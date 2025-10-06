import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Users, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// Mock data
const mockGroupData = {
  id: "1",
  name: "Goa Trip 2024",
  members: ["You", "Rahul", "Priya", "Amit", "Sneha", "Vikram", "Ananya", "Rohan"],
  totalExpense: 45600,
  startDate: "2024-01-10",
  endDate: "2024-01-17",
};

const mockExpenses = [
  { id: "1", description: "Hotel Booking", amount: 15000, paidBy: "Rahul", date: "2024-01-15", category: "Accommodation", splitBetween: 8 },
  { id: "2", description: "Dinner at Beach Shack", amount: 3500, paidBy: "You", date: "2024-01-14", category: "Food", splitBetween: 8 },
  { id: "3", description: "Parasailing Adventure", amount: 8000, paidBy: "Amit", date: "2024-01-14", category: "Activities", splitBetween: 6 },
  { id: "4", description: "Breakfast Buffet", amount: 2400, paidBy: "Priya", date: "2024-01-13", category: "Food", splitBetween: 8 },
  { id: "5", description: "Cab to Airport", amount: 1200, paidBy: "Vikram", date: "2024-01-13", category: "Transport", splitBetween: 4 },
];

const categoryData = [
  { name: "Accommodation", value: 15000, color: "hsl(38, 92%, 50%)" },
  { name: "Food", value: 12400, color: "hsl(20, 90%, 60%)" },
  { name: "Activities", value: 11200, color: "hsl(185, 70%, 45%)" },
  { name: "Transport", value: 6800, color: "hsl(142, 76%, 36%)" },
];

const settlementData = [
  { from: "Priya", to: "Rahul", amount: 2800 },
  { from: "Amit", to: "You", amount: 1500 },
  { from: "Sneha", to: "Vikram", amount: 950 },
];

const GroupDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                <h1 className="text-2xl font-bold text-foreground">{mockGroupData.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {mockGroupData.members.length} members • ₹{mockGroupData.totalExpense.toLocaleString()} total
                </p>
              </div>
            </div>
            <Link to={`/group/${id}/add-expense`}>
              <Button variant="hero" size="lg">
                <Plus className="h-5 w-5" />
                Add Expense
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="expenses" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settlements">Settlements</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4">
            {mockExpenses.map((expense) => (
              <Card key={expense.id} className="border-border bg-card p-5 transition-smooth hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{expense.description}</h3>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Paid by {expense.paidBy}</span>
                      <span>•</span>
                      <span>{expense.category}</span>
                      <span>•</span>
                      <span>Split {expense.splitBetween} ways</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">₹{expense.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">₹{(expense.amount / expense.splitBetween).toFixed(0)} each</p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
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

              <Card className="border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Daily Spending</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { day: "Day 1", amount: 6500 },
                    { day: "Day 2", amount: 8200 },
                    { day: "Day 3", amount: 12300 },
                    { day: "Day 4", amount: 7800 },
                    { day: "Day 5", amount: 10800 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      formatter={(value: number) => `₹${value.toLocaleString()}`}
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)"
                      }}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="border-border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">AI Trip Cost Prediction</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-accent p-4">
                  <span className="text-sm font-medium text-accent-foreground">Predicted Total Cost</span>
                  <span className="text-xl font-bold text-primary">₹48,500</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                  <span className="text-sm font-medium text-foreground">Actual Spending</span>
                  <span className="text-xl font-bold text-foreground">₹45,600</span>
                </div>
                <div className="rounded-lg border border-success bg-success/10 p-4">
                  <p className="text-sm font-medium text-success">
                    🎉 You saved ₹2,900 compared to the AI prediction! Great budgeting!
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settlements" className="space-y-4">
            <Card className="border-border bg-gradient-accent p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-accent-foreground">Smart Settlement Optimization</h3>
                  <p className="text-sm text-accent-foreground/80">
                    Minimized to {settlementData.length} transactions instead of {mockGroupData.members.length * 2}
                  </p>
                </div>
              </div>
            </Card>

            {settlementData.map((settlement, index) => (
              <Card key={index} className="border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {settlement.from} pays {settlement.to}
                      </p>
                      <p className="text-sm text-muted-foreground">Pending settlement</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">₹{settlement.amount.toLocaleString()}</p>
                    <Button variant="success" size="sm" className="mt-2">
                      Mark Paid
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GroupDetail;
