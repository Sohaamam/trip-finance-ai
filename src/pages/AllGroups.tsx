import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DollarSign, Users, ArrowLeft, Plus, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const AllGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const fetchGroups = async () => {
    if (!user) return;

    const { data: groupMembers } = await supabase
      .from("group_members")
      .select(`
        group_id,
        groups:group_id (
          id,
          name,
          description,
          invite_code,
          created_at
        )
      `)
      .eq("user_id", user.id);

    if (groupMembers) {
      const groupsWithStats = await Promise.all(
        groupMembers.map(async (gm: any) => {
          const group = gm.groups;
          
          // Get member count
          const { count: memberCount } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id);

          // Get total expenses
          const { data: expenses } = await supabase
            .from("expenses")
            .select("amount")
            .eq("group_id", group.id);

          const totalExpense = expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0) || 0;

          // Get user's share
          const { data: userSplits } = await supabase
            .from("expense_splits")
            .select("amount, expenses!inner(group_id)")
            .eq("user_id", user.id)
            .eq("expenses.group_id", group.id);

          const yourShare = userSplits?.reduce((sum, split) => sum + parseFloat(split.amount.toString()), 0) || 0;

          return {
            ...group,
            memberCount: memberCount || 0,
            totalExpense,
            yourShare,
          };
        })
      );

      setGroups(groupsWithStats);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <DollarSign className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">All Groups</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/join-group">
                <Button variant="outline" size="lg">
                  <LogIn className="h-5 w-5" />
                  Join Group
                </Button>
              </Link>
              <Link to="/create-group">
                <Button variant="hero" size="lg">
                  <Plus className="h-5 w-5" />
                  Create Group
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {groups.length === 0 ? (
          <Card className="border-border bg-card p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold text-foreground">No groups yet</h3>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Link key={group.id} to={`/group/${group.id}`}>
                <Card className="border-border bg-card p-6 transition-smooth hover:border-primary/50 hover:shadow-md">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{group.name}</h3>
                      {group.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
                      )}
                    </div>
                    <div className="rounded-full bg-primary/10 p-2">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Members</span>
                      <span className="font-medium text-foreground">{group.memberCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-medium text-foreground">₹{group.totalExpense.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2">
                      <span className="text-muted-foreground">Your share</span>
                      <span className="font-semibold text-primary">₹{group.yourShare.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 rounded bg-muted px-3 py-2 text-center font-mono text-xs text-muted-foreground">
                    Code: {group.invite_code}
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

export default AllGroups;