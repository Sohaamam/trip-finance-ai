import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  groupName: string;
  date: string;
  category: string;
}

interface ExpenseListProps {
  expenses: Expense[];
}

const categoryColors: Record<string, string> = {
  Food: "bg-secondary/20 text-secondary border-secondary/30",
  Transport: "bg-primary/20 text-primary border-primary/30",
  Accommodation: "bg-warning/20 text-warning border-warning/30",
};

export const ExpenseList = ({ expenses }: ExpenseListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Recent Expenses</h2>
        <Button variant="link" asChild>
          <Link to="/expenses">View All</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {expenses.map((expense) => (
          <Card key={expense.id} className="border-border bg-card p-4 transition-smooth hover:shadow-md">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{expense.description}</h4>
                  <p className="text-xs text-muted-foreground">{expense.groupName}</p>
                </div>
                <p className="text-lg font-bold text-foreground">₹{expense.amount.toLocaleString()}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={categoryColors[expense.category] || "bg-muted"}>
                    {expense.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Paid by {expense.paidBy}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(expense.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
