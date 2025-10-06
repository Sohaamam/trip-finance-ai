import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Users, TrendingUp, DollarSign, Bell, LogOut, LogIn } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ExpenseList } from "@/components/dashboard/ExpenseList";
import { GroupsList } from "@/components/dashboard/GroupsList";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    activeGroups: 0,
    pendingSettlements: 0,
    thisMonthSpending: 0,
  });
  const [groups, setGroups] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    // Get user's groups
    const { data: groupMembers } = await supabase
      .from("group_members")
      .select(`
        group_id,
        groups:group_id (id, name)
      `)
      .eq("user_id", user.id)
      .limit(3);

    const groupIds = groupMembers?.map(gm => gm.group_id) || [];

    if (groupIds.length > 0) {
      // Get groups with stats
      const groupsWithStats = await Promise.all(
        (groupMembers || []).map(async (gm: any) => {
          const group = gm.groups;
          
          const { count: memberCount } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id);

          const { data: expenses } = await supabase
            .from("expenses")
            .select("amount")
            .eq("group_id", group.id);

          const totalExpense = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

          const { data: userSplits } = await supabase
            .from("expense_splits")
            .select("amount, expenses!inner(group_id)")
            .eq("user_id", user.id)
            .eq("expenses.group_id", group.id);

          const yourShare = userSplits?.reduce((sum, split) => sum + Number(split.amount), 0) || 0;

          return {
            id: group.id,
            name: group.name,
            members: memberCount || 0,
            totalExpense,
            yourShare,
            currency: "₹",
          };
        })
      );

      setGroups(groupsWithStats);

      // Get recent expenses
      const { data: recentExpenses } = await supabase
        .from("expenses")
        .select(`
          id,
          description,
          amount,
          paid_by,
          expense_date,
          category,
          group_id,
          groups (name)
        `)
        .in("group_id", groupIds)
        .order("created_at", { ascending: false })
        .limit(4);

      if (recentExpenses) {
        const expensesWithSplits = await Promise.all(
          recentExpenses.map(async (expense) => {
            // Get payer info
            const { data: payer } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", expense.paid_by)
              .single();

            return {
              id: expense.id,
              description: expense.description,
              amount: Number(expense.amount),
              paidBy: expense.paid_by === user.id ? "You" : payer?.full_name || "Unknown",
              groupName: expense.groups?.name || "",
              date: expense.expense_date,
              category: expense.category,
            };
          })
        );

        setExpenses(expensesWithSplits);
      }

      // Calculate stats
      const { data: allExpenses } = await supabase
        .from("expenses")
        .select("amount")
        .in("group_id", groupIds);

      const totalExpenses = allExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

      const { data: userSplits } = await supabase
        .from("expense_splits")
        .select("amount, expenses!inner(group_id, expense_date)")
        .eq("user_id", user.id);

      const pendingSettlements = userSplits?.reduce((sum, split) => sum + Number(split.amount), 0) || 0;

      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthExpenses = userSplits?.filter((split: any) => 
        new Date(split.expenses.expense_date) >= thisMonth
      ).reduce((sum, split) => sum + Number(split.amount), 0) || 0;

      setStats({
        totalExpenses,
        activeGroups: groupIds.length,
        pendingSettlements,
        thisMonthSpending: thisMonthExpenses,
      });
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md border-border bg-card p-8 text-center">
          <DollarSign className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h2 className="mb-4 text-2xl font-bold text-foreground">Welcome to SplitSmart</h2>
          <p className="mb-6 text-muted-foreground">Sign in to manage your group expenses</p>
          <Button variant="hero" size="lg" className="w-full" onClick={() => navigate("/auth")}>
            <LogIn className="mr-2 h-5 w-5" />
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">SplitSmart</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Link to="/create-group">
                <Button variant="hero" size="lg">
                  <Plus className="h-5 w-5" />
                  Create Group
                </Button>
              </Link>
              <Button variant="outline" size="icon" onClick={signOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {groups.length === 0 ? (
          <Card className="border-border bg-card p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold text-foreground">Get Started</h3>
            <p className="mb-6 text-muted-foreground">
              Create a new group or join an existing one to start tracking expenses
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/create-group">
                <Button variant="hero">Create Group</Button>
              </Link>
              <Link to="/join-group">
                <Button variant="outline">Join Group</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <>
            <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Expenses"
                value={`₹${stats.totalExpenses.toLocaleString()}`}
                icon={<DollarSign className="h-5 w-5" />}
                trend="All time"
              />
              <StatsCard
                title="Active Groups"
                value={stats.activeGroups}
                icon={<Users className="h-5 w-5" />}
                trend={`${stats.activeGroups} group${stats.activeGroups !== 1 ? 's' : ''}`}
              />
              <StatsCard
                title="Your Total Share"
                value={`₹${stats.pendingSettlements.toLocaleString()}`}
                icon={<TrendingUp className="h-5 w-5" />}
                trend="Across all groups"
                variant="warning"
              />
              <StatsCard
                title="This Month"
                value={`₹${stats.thisMonthSpending.toLocaleString()}`}
                icon={<TrendingUp className="h-5 w-5" />}
                trend="Your spending"
                variant="success"
              />
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <GroupsList groups={groups} />
              </div>

              <div className="lg:col-span-1">
                <ExpenseList expenses={expenses} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;