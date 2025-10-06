import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  variant?: "default" | "success" | "warning";
}

export const StatsCard = ({ title, value, icon, trend, variant = "default" }: StatsCardProps) => {
  return (
    <Card className={cn(
      "relative overflow-hidden border-border bg-gradient-card p-6 transition-smooth hover:shadow-lg",
      variant === "success" && "border-l-4 border-l-success",
      variant === "warning" && "border-l-4 border-l-warning"
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs",
              variant === "success" ? "text-success" : variant === "warning" ? "text-warning" : "text-muted-foreground"
            )}>
              {trend}
            </p>
          )}
        </div>
        <div className={cn(
          "rounded-full p-3",
          variant === "success" ? "bg-success/10 text-success" : 
          variant === "warning" ? "bg-warning/10 text-warning" : 
          "bg-primary/10 text-primary"
        )}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
