import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Users, TrendingUp, Copy, Check } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const categoryColors: Record<string, string> = {
  Food: "hsl(20, 90%, 60%)",
  Transport: "hsl(185, 70%, 45%)",
  Accommodation: "hsl(38, 92%, 50%)",
  Activities: "hsl(142, 76%, 36%)",
  Shopping: "hsl(0, 84%, 60%)",
  Other: "hsl(215, 20%, 65%)",
};

const GroupDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groupData, setGroupData] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCopied, setInviteCopied] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchGroupData();
    }
  }, [id, user]);

  const fetchGroupData = async () => {
    if (!id || !user) return;

    // Get group details
    const { data: group } = await supabase
      .from("groups")
      .select("*")
      .eq("id", id)
      .single();

    if (!group) {
      toast.error("Group not found");
      navigate("/dashboard");
      return;
    }

    // Get group members
    const { data: members } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", id);

    const memberNames = await Promise.all(
      (members || []).map(async (m) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", m.user_id)
          .single();
        return profile?.full_name || "Unknown";
      })
    );

    // Get all expenses
    const { data: expensesData } = await supabase
      .from("expenses")
      .select("*")
      .eq("group_id", id)
      .order("expense_date", { ascending: false });

    if (expensesData) {
      const expensesWithDetails = await Promise.all(
        expensesData.map(async (expense) => {
          const { data: payer } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", expense.paid_by)
            .single();

          const { count } = await supabase
            .from("expense_splits")
            .select("*", { count: "exact", head: true })
            .eq("expense_id", expense.id);

          return {
            ...expense,
            payerName: payer?.full_name || "Unknown",
            splitBetween: count || 0,
          };
        })
      );

      setExpenses(expensesWithDetails);

      // Calculate category data
      const categoryMap = new Map();
      expensesData.forEach(expense => {
        const current = categoryMap.get(expense.category) || 0;
        categoryMap.set(expense.category, current + Number(expense.amount));
      });

      const catData = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value: Number(value),
        color: categoryColors[name] || categoryColors.Other,
      }));

      setCategoryData(catData);
    }

    // Calculate settlements
    if (expensesData && members) {
      await calculateSettlements(expensesData, members);
    }

    const totalExpense = expensesData?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

    setGroupData({
      ...group,
      members: memberNames,
      totalExpense,
    });

    setLoading(false);
  };

  const calculateSettlements = async (expensesData: any[], members: any[]) => {
    // Create a balance map: balances[userId] = net amount (positive = owed to them, negative = they owe)
    const balances = new Map<string, number>();
    
    // Initialize all members with 0 balance
    members.forEach(m => balances.set(m.user_id, 0));

    // For each expense, calculate balances
    for (const expense of expensesData) {
      const payerId = expense.paid_by;
      const totalAmount = Number(expense.amount);
      
      // Get splits for this expense
      const { data: splits } = await supabase
        .from("expense_splits")
        .select("user_id, amount")
        .eq("expense_id", expense.id);

      if (!splits || splits.length === 0) continue;

      // Payer paid the full amount
      balances.set(payerId, (balances.get(payerId) || 0) + totalAmount);

      // Each person owes their split amount
      splits.forEach(split => {
        balances.set(split.user_id, (balances.get(split.user_id) || 0) - Number(split.amount));
      });
    }

    // Convert balances to settlements (who owes whom)
    const settlementsList: any[] = [];
    const balanceArray = Array.from(balances.entries())
      .filter(([_, amount]) => Math.abs(amount) > 0.01); // Ignore tiny amounts

    // Separate creditors (owed money) and debtors (owe money)
    const creditors = balanceArray.filter(([_, amount]) => amount > 0);
    const debtors = balanceArray.filter(([_, amount]) => amount < 0);

    // Calculate simplified settlements
    for (const [debtorId, debtAmount] of debtors) {
      let remainingDebt = Math.abs(debtAmount);
      
      for (const [creditorId, creditAmount] of creditors) {
        if (remainingDebt < 0.01) break;
        if (creditAmount < 0.01) continue;

        const settlementAmount = Math.min(remainingDebt, creditAmount);
        
        // Get names
        const { data: debtorProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", debtorId)
          .single();
        
        const { data: creditorProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", creditorId)
          .single();

        settlementsList.push({
          fromId: debtorId,
          fromName: debtorProfile?.full_name || "Unknown",
          toId: creditorId,
          toName: creditorProfile?.full_name || "Unknown",
          amount: settlementAmount,
        });

        remainingDebt -= settlementAmount;
        // Update creditor's remaining credit
        const creditorIndex = creditors.findIndex(([id]) => id === creditorId);
        if (creditorIndex !== -1) {
          creditors[creditorIndex][1] -= settlementAmount;
        }
      }
    }

    setSettlements(settlementsList);
  };

  const copyInviteCode = () => {
    if (groupData?.invite_code) {
      navigator.clipboard.writeText(groupData.invite_code);
      setInviteCopied(true);
      toast.success("Invite code copied!");
      setTimeout(() => setInviteCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!groupData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{groupData.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {groupData.members.length} members • ₹{groupData.totalExpense.toLocaleString()} total
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyInviteCode}>
                {inviteCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="ml-2 font-mono">{groupData.invite_code}</span>
              </Button>
              <Link to={`/group/${id}/add-expense`}>
                <Button variant="hero" size="lg">
                  <Plus className="h-5 w-5" />
                  Add Expense
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="expenses" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="settlements">Settlements</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4">
            {expenses.length === 0 ? (
              <Card className="border-border bg-card p-12 text-center">
                <TrendingUp className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-semibold text-foreground">No expenses yet</h3>
                <p className="mb-6 text-muted-foreground">Start adding expenses to track group spending</p>
                <Link to={`/group/${id}/add-expense`}>
                  <Button variant="hero">Add First Expense</Button>
                </Link>
              </Card>
            ) : (
              expenses.map((expense) => (
                <Card key={expense.id} className="border-border bg-card p-5 transition-smooth hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{expense.description}</h3>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Paid by {expense.paid_by === user?.id ? "You" : expense.payerName}</span>
                        <span>•</span>
                        <span>{expense.category}</span>
                        <span>•</span>
                        <span>Split {expense.splitBetween} ways</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(expense.expense_date).toLocaleDateString('en-IN', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-foreground">₹{Number(expense.amount).toLocaleString()}</p>
                      {expense.splitBetween > 0 && (
                        <p className="text-sm text-muted-foreground">
                          ₹{(Number(expense.amount) / expense.splitBetween).toFixed(0)} each
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="settlements" className="space-y-4">
            {settlements.length === 0 ? (
              <Card className="border-border bg-card p-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-semibold text-foreground">All settled up!</h3>
                <p className="text-muted-foreground">No outstanding balances in this group</p>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card className="border-border bg-card p-6">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">Who Owes Whom</h3>
                  <div className="space-y-3">
                    {settlements.map((settlement, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-smooth hover:shadow-sm"
                      >
                        <div className="flex-1">
                          <p className="text-sm text-foreground">
                            <span className="font-semibold">
                              {settlement.fromId === user?.id ? "You" : settlement.fromName}
                            </span>
                            {" owe "}
                            <span className="font-semibold">
                              {settlement.toId === user?.id ? "you" : settlement.toName}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">
                            ₹{settlement.amount.toFixed(0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {expenses.length === 0 ? (
              <Card className="border-border bg-card p-12 text-center">
                <TrendingUp className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-semibold text-foreground">No data yet</h3>
                <p className="text-muted-foreground">Add expenses to see analytics</p>
              </Card>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {categoryData.length > 0 && (
                  <Card className="border-border bg-card p-6">
                    <h3 className="mb-4 text-lg font-semibold text-foreground">Expense by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                )}

                <Card className="border-border bg-card p-6">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">Total Spending</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-accent p-4">
                      <span className="text-sm font-medium text-accent-foreground">Group Total</span>
                      <span className="text-xl font-bold text-primary">₹{groupData.totalExpense.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                      <span className="text-sm font-medium text-foreground">Per Person</span>
                      <span className="text-xl font-bold text-foreground">
                        ₹{(groupData.totalExpense / groupData.members.length).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GroupDetail;