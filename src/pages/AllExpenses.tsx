import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ArrowLeft, Receipt } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const categoryColors: Record<string, string> = {
  Food: "bg-secondary/20 text-secondary border-secondary/30",
  Transport: "bg-primary/20 text-primary border-primary/30",
  Accommodation: "bg-warning/20 text-warning border-warning/30",
  Activities: "bg-success/20 text-success border-success/30",
  Shopping: "bg-destructive/20 text-destructive border-destructive/30",
  Other: "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30",
};

const AllExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  const fetchExpenses = async () => {
    if (!user) return;

    // Get all groups the user is a member of
    const { data: groupMembers } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);

    if (!groupMembers) {
      setLoading(false);
      return;
    }

    const groupIds = groupMembers.map(gm => gm.group_id);

    // Get all expenses from those groups
    const { data: expensesData } = await supabase
      .from("expenses")
      .select(`
        *,
        groups:group_id (name),
        profiles:paid_by (full_name)
      `)
      .in("group_id", groupIds)
      .order("expense_date", { ascending: false })
      .limit(50);

    if (expensesData) {
      // Get split info for each expense
      const expensesWithSplits = await Promise.all(
        expensesData.map(async (expense) => {
          const { count } = await supabase
            .from("expense_splits")
            .select("*", { count: "exact", head: true })
            .eq("expense_id", expense.id);

          return {
            ...expense,
            splitCount: count || 0,
          };
        })
      );

      setExpenses(expensesWithSplits);
    }
    setLoading(false);
  };

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
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">All Expenses</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {expenses.length === 0 ? (
          <Card className="border-border bg-card p-12 text-center">
            <Receipt className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold text-foreground">No expenses yet</h3>
            <p className="text-muted-foreground">
              Start adding expenses to your groups to track spending
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <Link key={expense.id} to={`/group/${expense.group_id}`}>
                <Card className="border-border bg-card p-5 transition-smooth hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{expense.description}</h4>
                      <p className="text-xs text-muted-foreground">{expense.groups?.name}</p>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className={categoryColors[expense.category] || categoryColors.Other}>
                          {expense.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Paid by {expense.paid_by === user.id ? "You" : expense.profiles?.full_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • Split {expense.splitCount} way{expense.splitCount !== 1 ? 's' : ''}
                        </span>
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
                      <p className="text-xl font-bold text-foreground">₹{parseFloat(expense.amount).toLocaleString()}</p>
                      {expense.splitCount > 0 && (
                        <p className="text-sm text-muted-foreground">
                          ₹{(parseFloat(expense.amount) / expense.splitCount).toFixed(0)} each
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllExpenses;