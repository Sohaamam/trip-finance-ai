import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, Smartphone, Shield, Zap, Brain, BarChart3 } from "lucide-react";
import heroImage from "@/assets/hero-expense.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container relative mx-auto px-4 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-accent-foreground">AI-Powered Expense Tracking</span>
              </div>
              
              <h1 className="text-5xl font-bold leading-tight text-foreground lg:text-6xl">
                Smart Expense Management for{" "}
                <span className="bg-gradient-hero bg-clip-text text-transparent">Groups</span>
              </h1>
              
              <p className="text-lg text-muted-foreground lg:text-xl">
                Track shared expenses, predict trip costs with AI, and settle debts effortlessly. 
                Perfect for trips, events, and group activities.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/dashboard">
                  <Button variant="hero" size="xl">
                    Get Started Free
                  </Button>
                </Link>
                <Button variant="outline" size="xl">
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">10K+</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">₹50Cr+</p>
                  <p className="text-sm text-muted-foreground">Expenses Tracked</p>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">95%</p>
                  <p className="text-sm text-muted-foreground">User Satisfaction</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-gradient-hero opacity-20 blur-3xl"></div>
              <img
                src={heroImage}
                alt="Friends managing expenses together"
                className="relative rounded-2xl shadow-glow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b border-border py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
              Everything you need to manage group expenses
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed to make expense tracking effortless and intelligent
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border bg-gradient-card p-6 transition-smooth hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">AI Cost Prediction</h3>
              <p className="text-muted-foreground">
                Get accurate trip cost estimates before you travel using machine learning models
              </p>
            </Card>

            <Card className="border-border bg-gradient-card p-6 transition-smooth hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-full bg-success/10 p-3">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Smart Settlements</h3>
              <p className="text-muted-foreground">
                Minimize transactions with intelligent algorithms that optimize who owes whom
              </p>
            </Card>

            <Card className="border-border bg-gradient-card p-6 transition-smooth hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-full bg-secondary/10 p-3">
                <BarChart3 className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Visual Analytics</h3>
              <p className="text-muted-foreground">
                Beautiful charts and insights to understand spending patterns across categories
              </p>
            </Card>

            <Card className="border-border bg-gradient-card p-6 transition-smooth hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-full bg-warning/10 p-3">
                <Smartphone className="h-6 w-6 text-warning" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">UPI Integration</h3>
              <p className="text-muted-foreground">
                Seamlessly settle payments via UPI, Paytm, or GPay with one-tap integration
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-border bg-accent/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">How it works</h2>
            <p className="text-lg text-muted-foreground">Get started in three simple steps</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-hero text-2xl font-bold text-primary-foreground shadow-glow">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Create a Group</h3>
              <p className="text-muted-foreground">
                Add friends or colleagues to your expense group for trips or events
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-hero text-2xl font-bold text-primary-foreground shadow-glow">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Track Expenses</h3>
              <p className="text-muted-foreground">
                Add expenses as they happen and split them equally or by custom amounts
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-hero text-2xl font-bold text-primary-foreground shadow-glow">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Settle Smart</h3>
              <p className="text-muted-foreground">
                Let our AI optimize settlements and pay directly via UPI with minimal transactions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="relative overflow-hidden border-0 bg-gradient-hero p-12 text-center shadow-glow">
            <div className="relative z-10">
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground lg:text-4xl">
                Ready to simplify your group expenses?
              </h2>
              <p className="mb-8 text-lg text-primary-foreground/90">
                Join thousands of users who trust SplitSmart for their expense management
              </p>
              <Link to="/dashboard">
                <Button variant="secondary" size="xl" className="shadow-lg">
                  Start Tracking Now
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">SplitSmart</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 SplitSmart. Making expense management effortless with AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
