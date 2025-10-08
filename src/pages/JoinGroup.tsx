import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const JoinGroup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Find group by invite code using security definer function
      const { data: groups, error: groupError } = await supabase
        .rpc("find_group_by_invite_code", { _invite_code: inviteCode.toUpperCase() });

      if (groupError || !groups || groups.length === 0) {
        throw new Error("Invalid invite code");
      }

      const group = groups[0];

      // Check if already a member
      const { data: existingMember } = await supabase
        .from("group_members")
        .select("*")
        .eq("group_id", group.id)
        .eq("user_id", user.id)
        .single();

      if (existingMember) {
        toast.info("You're already a member of this group!");
        navigate(`/group/${group.id}`);
        return;
      }

      // Add user as member
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
        });

      if (memberError) throw memberError;

      toast.success(`Successfully joined "${group.name}"!`);
      navigate(`/group/${group.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to join group");
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-2xl font-bold text-foreground">Join a Group</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-md border-border bg-card p-8">
          <p className="mb-6 text-center text-muted-foreground">
            Enter the invite code shared with you to join an expense group
          </p>

          <form onSubmit={handleJoinGroup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                type="text"
                placeholder="e.g., ABC12XYZ"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                required
                maxLength={8}
                className="text-center text-lg font-mono uppercase tracking-wider"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" variant="hero" className="flex-1" disabled={loading}>
                {loading ? "Joining..." : "Join Group"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default JoinGroup;