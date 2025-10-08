import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const CATEGORIES = ["Food", "Transport", "Accommodation", "Activities", "Shopping", "Other"];

const AddExpense = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [groupName, setGroupName] = useState("");
  
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [splitEqually, setSplitEqually] = useState(true);

  useEffect(() => {
    if (user && groupId) {
      fetchGroupDetails();
    }
  }, [groupId, user]);

  const fetchGroupDetails = async () => {
    if (!groupId) return;

    try {
      // Get group name
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .select("name")
        .eq("id", groupId)
        .single();

      if (groupError) {
        console.error("Error fetching group:", groupError);
        toast.error("Failed to load group details");
        return;
      }

      if (group) setGroupName(group.name);

      // Get group members with their profiles
      const { data: members, error: membersError } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", groupId);

      if (membersError) {
        console.error("Error fetching members:", membersError);
        toast.error("Failed to load group members");
        return;
      }

      console.log("Fetched members:", members);
      
      if (members && members.length > 0) {
        // Fetch profile names for each member
        const membersWithProfiles = await Promise.all(
          members.map(async (member) => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", member.user_id)
              .single();
            
            return {
              user_id: member.user_id,
              full_name: profile?.full_name || "Unknown"
            };
          })
        );
        
        console.log("Members with profiles:", membersWithProfiles);
        setGroupMembers(membersWithProfiles);
      } else {
        toast.error("This group has no members. Add members first.");
        setGroupMembers([]);
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast.error("An error occurred while loading group details");
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !groupId) return;

    setLoading(true);
    try {
      // Create expense
      const { data: expense, error: expenseError } = await supabase
        .from("expenses")
        .insert({
          group_id: groupId,
          description,
          amount: parseFloat(amount),
          category,
          paid_by: user.id,
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Create expense splits (equal split)
      const splitAmount = parseFloat(amount) / groupMembers.length;
      const splits = groupMembers.map(member => ({
        expense_id: expense.id,
        user_id: member.user_id,
        amount: splitAmount,
      }));

      const { error: splitError } = await supabase
        .from("expense_splits")
        .insert(splits);

      if (splitError) throw splitError;

      toast.success("Expense added successfully!");
      navigate(`/group/${groupId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to={`/group/${groupId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Add Expense</h1>
              <p className="text-sm text-muted-foreground">{groupName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-2xl border-border bg-card p-8">
          <form onSubmit={handleAddExpense} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                type="text"
                placeholder="e.g., Dinner at restaurant"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted p-4">
              <p className="text-sm font-medium text-foreground">Split Details</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Split equally among {groupMembers.length} member{groupMembers.length !== 1 ? 's' : ''}
              </p>
              {amount && (
                <p className="mt-2 text-lg font-semibold text-primary">
                  ₹{(parseFloat(amount) / groupMembers.length).toFixed(2)} per person
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(`/group/${groupId}`)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="hero" className="flex-1" disabled={loading}>
                {loading ? "Adding..." : "Add Expense"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default AddExpense;