import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Users, TrendingUp, DollarSign, Bell } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ExpenseList } from "@/components/dashboard/ExpenseList";
import { GroupsList } from "@/components/dashboard/GroupsList";

// Mock data
const mockStats = {
  totalExpenses: 12450,
  activeGroups: 3,
  pendingSettlements: 2340,
  thisMonthSpending: 4560,
};

const mockGroups = [
  { id: "1", name: "Goa Trip 2024", members: 8, totalExpense: 45600, yourShare: 5700, currency: "₹" },
  { id: "2", name: "Office Team Lunch", members: 12, totalExpense: 8400, yourShare: 700, currency: "₹" },
  { id: "3", name: "Weekend Getaway", members: 4, totalExpense: 12300, yourShare: 3075, currency: "₹" },
];

const mockExpenses = [
  { id: "1", description: "Hotel Booking", amount: 15000, paidBy: "Rahul", groupName: "Goa Trip 2024", date: "2024-01-15", category: "Accommodation" },
  { id: "2", description: "Dinner at Beach Shack", amount: 3500, paidBy: "You", groupName: "Goa Trip 2024", date: "2024-01-14", category: "Food" },
  { id: "3", description: "Cab to Airport", amount: 1200, paidBy: "Priya", groupName: "Goa Trip 2024", date: "2024-01-13", category: "Transport" },
  { id: "4", description: "Team Lunch", amount: 8400, paidBy: "Company", groupName: "Office Team Lunch", date: "2024-01-12", category: "Food" },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Expenses"
            value={`₹${mockStats.totalExpenses.toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5" />}
            trend="+12% from last month"
          />
          <StatsCard
            title="Active Groups"
            value={mockStats.activeGroups}
            icon={<Users className="h-5 w-5" />}
            trend="3 groups"
          />
          <StatsCard
            title="Pending Settlements"
            value={`₹${mockStats.pendingSettlements.toLocaleString()}`}
            icon={<TrendingUp className="h-5 w-5" />}
            trend="2 people owe you"
            variant="warning"
          />
          <StatsCard
            title="This Month"
            value={`₹${mockStats.thisMonthSpending.toLocaleString()}`}
            icon={<TrendingUp className="h-5 w-5" />}
            trend="-8% vs last month"
            variant="success"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Active Groups */}
          <div className="lg:col-span-2">
            <GroupsList groups={mockGroups} />
          </div>

          {/* Recent Expenses */}
          <div className="lg:col-span-1">
            <ExpenseList expenses={mockExpenses} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
