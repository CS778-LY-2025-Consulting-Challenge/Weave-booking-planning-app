import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { BalanceView } from "@/components/expenses/BalanceView";
import { VisualBudget } from "@/components/expenses/VisualBudget";
import { AddTripmateDialog } from "@/components/expenses/AddTripmateDialog";
import { BudgetTabs } from "@/components/expenses/BudgetTabs";
import { AddExpenseWrapper } from "./AddExpenseWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";

export default async function BudgetPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { tripId } = await params;

  // Fetch Trip, Participants, Expenses
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      participants: true,
      expenses: {
        include: { splits: true },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!trip) {
    return <div>Trip not found</div>;
  }

  const isParticipant = trip.participants.some((p) => p.userId === userId);
  if (!isParticipant) {
    return <div>Access Denied</div>;
  }

  const totalSpent = trip.expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget & Expenses</h1>
          <p className="text-muted-foreground">{trip.name}</p>
        </div>
        <div className="flex gap-2">
          <AddExpenseWrapper
            tripId={tripId}
            participants={trip.participants}
            currentUserId={userId}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Stats & Breakdown */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: trip.baseCurrency }).format(totalSpent / 100)}
              </div>
              {trip.budgetLimit && (
                <p className="text-xs text-muted-foreground mt-1">
                  of {new Intl.NumberFormat("en-US", { style: "currency", currency: trip.baseCurrency }).format(trip.budgetLimit / 100)} budget
                </p>
              )}
            </CardContent>
          </Card>

          <VisualBudget expenses={trip.expenses} currency={trip.baseCurrency} />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Tripmates
              </CardTitle>
              <AddTripmateDialog tripId={tripId} />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {trip.participants.map(p => (
                  <div key={p.id} className="flex items-center gap-2 text-sm bg-muted px-2 py-1 rounded-md">
                    <span>{p.name || p.email}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabs for Expenses and Balances */}
        <div className="lg:col-span-2">
          <BudgetTabs
            tripId={tripId}
            expenses={trip.expenses}
            participants={trip.participants}
            currentUserId={userId}
          />
        </div>
      </div>
    </div>
  );
}
