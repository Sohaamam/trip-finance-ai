import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ChevronRight } from "lucide-react";

interface Group {
  id: string;
  name: string;
  members: number;
  totalExpense: number;
  yourShare: number;
  currency: string;
}

interface GroupsListProps {
  groups: Group[];
}

export const GroupsList = ({ groups }: GroupsListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Active Groups</h2>
        <Button variant="link" asChild>
          <Link to="/groups">View All</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {groups.map((group) => (
          <Card key={group.id} className="border-border bg-card p-5 transition-smooth hover:shadow-md hover:border-primary/50">
            <Link to={`/group/${group.id}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">{group.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-muted-foreground">{group.members} members</span>
                    <span className="text-muted-foreground">
                      Total: <span className="font-medium text-foreground">{group.currency}{group.totalExpense.toLocaleString()}</span>
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground">
                      Your share: <span className="font-semibold text-primary">{group.currency}{group.yourShare.toLocaleString()}</span>
                    </span>
                  </div>
                </div>
                
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};
