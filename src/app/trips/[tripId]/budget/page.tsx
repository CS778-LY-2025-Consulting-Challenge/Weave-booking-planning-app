'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AddExpenseDialog } from '@/components/AddExpenseDialog';
import { InviteParticipantDialog } from '@/components/InviteParticipantDialog';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Receipt,
  ArrowDownUp,
  ArrowRight,
} from 'lucide-react';
import {
  TripWithParticipants,
  ExpenseWithShares,
  UserBalance,
  Settlement,
  TripBudgetSummary,
} from '@/types/expense';
import { formatCurrency, fromCents } from '@/lib/expense-utils';
import { toast } from 'sonner';

export default function TripBudgetPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<TripWithParticipants | null>(null);
  const [expenses, setExpenses] = useState<ExpenseWithShares[]>([]);
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [summary, setSummary] = useState<TripBudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTripData = async () => {
    try {
      const [tripRes, expensesRes, balancesRes] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/trips/${tripId}/expenses`),
        fetch(`/api/trips/${tripId}/balances`),
      ]);

      if (!tripRes.ok || !expensesRes.ok || !balancesRes.ok) {
        throw new Error('Failed to fetch trip data');
      }

      const tripData = await tripRes.json();
      const expensesData = await expensesRes.json();
      const balancesData = await balancesRes.json();

      setTrip(tripData.trip);
      setExpenses(expensesData.expenses);
      setBalances(balancesData.balances);
      setSettlements(balancesData.settlements);
      setSummary(balancesData.summary);
    } catch (error) {
      toast.error('Failed to load trip data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  const handleExpenseAdded = () => {
    fetchTripData();
  };

  const handleParticipantAdded = () => {
    fetchTripData();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading trip budget...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Trip not found</p>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const currency = trip.baseCurrency;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{trip.name}</h1>
              {trip.destination && (
                <p className="text-muted-foreground">{trip.destination}</p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <InviteParticipantDialog
                tripId={tripId}
                onParticipantAdded={handleParticipantAdded}
              />
              <AddExpenseDialog
                tripId={tripId}
                participants={trip.participants}
                currency={currency}
                onExpenseAdded={handleExpenseAdded}
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(summary.totalSpent, currency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.expenseCount} {summary.expenseCount === 1 ? 'expense' : 'expenses'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Participants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.participantCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(summary.averagePerPerson, currency)} per person
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {trip.budgetLimit ? (
                  <>
                    <div className="text-2xl font-bold">
                      {formatCurrency(trip.budgetLimit, currency)}
                    </div>
                    <Progress
                      value={summary.percentUsed}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {summary.percentUsed?.toFixed(0)}% used
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No budget set</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {trip.budgetLimit ? 'Remaining' : 'Average'}
                </CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {trip.budgetLimit && summary.budgetRemaining !== undefined
                    ? formatCurrency(summary.budgetRemaining, currency)
                    : formatCurrency(summary.averagePerPerson, currency)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {trip.budgetLimit ? 'Budget remaining' : 'Per person'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="expenses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="balances">Balances</TabsTrigger>
            <TabsTrigger value="settle">Settle Up</TabsTrigger>
          </TabsList>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Expenses</CardTitle>
                <CardDescription>
                  Track and manage group expenses for this trip
                </CardDescription>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No expenses yet</p>
                    <AddExpenseDialog
                      tripId={tripId}
                      participants={trip.participants}
                      currency={currency}
                      onExpenseAdded={handleExpenseAdded}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-start justify-between border-b pb-4 last:border-0"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{expense.description}</h4>
                            {expense.category && (
                              <Badge variant="secondary" className="text-xs">
                                {expense.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {new Date(expense.date).toLocaleDateString()} • Paid by{' '}
                            {expense.paidByUserName}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Split between {expense.shares.length}{' '}
                            {expense.shares.length === 1 ? 'person' : 'people'}:{' '}
                            {expense.shares.map((s) => s.userName).join(', ')}
                          </div>
                          {expense.notes && (
                            <p className="text-sm text-muted-foreground italic mt-2">
                              "{expense.notes}"
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">
                            {formatCurrency(expense.amount, currency)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(
                              expense.amount / expense.shares.length,
                              currency
                            )}{' '}
                            each
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Balances Tab */}
          <TabsContent value="balances" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trip Balances</CardTitle>
                <CardDescription>
                  See who's owed money and who owes money
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {balances.map((balance) => (
                    <div
                      key={balance.userId}
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                    >
                      <div>
                        <p className="font-semibold">{balance.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          Paid {formatCurrency(balance.totalPaid, currency)} • Owes{' '}
                          {formatCurrency(balance.totalOwed, currency)}
                        </p>
                      </div>
                      <div className="text-right">
                        {balance.balance === 0 ? (
                          <Badge variant="outline" className="text-sm">
                            Settled
                          </Badge>
                        ) : balance.balance > 0 ? (
                          <div>
                            <Badge className="bg-green-600 text-white text-sm mb-1">
                              Is owed
                            </Badge>
                            <p className="text-xl font-bold text-green-600">
                              +{formatCurrency(balance.balance, currency)}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <Badge variant="destructive" className="text-sm mb-1">
                              Owes
                            </Badge>
                            <p className="text-xl font-bold text-red-600">
                              {formatCurrency(balance.balance, currency)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settle Up Tab */}
          <TabsContent value="settle" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Settle Up</CardTitle>
                <CardDescription>
                  Simplified payments to balance everyone out
                </CardDescription>
              </CardHeader>
              <CardContent>
                {settlements.length === 0 ? (
                  <div className="text-center py-12">
                    <ArrowDownUp className="mx-auto h-12 w-12 text-green-600 mb-4" />
                    <p className="text-xl font-semibold text-green-600 mb-2">
                      All settled up!
                    </p>
                    <p className="text-muted-foreground">
                      Everyone is even on this trip
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      {settlements.length} payment{settlements.length !== 1 ? 's' : ''}{' '}
                      needed to settle all balances
                    </p>
                    {settlements.map((settlement, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {settlement.from.userName}
                            </span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">
                              {settlement.to.userName}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {formatCurrency(settlement.amount, currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Participants List */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Trip Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trip.participants.map((participant) => (
                <div
                  key={participant.userId}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium">{participant.userName}</p>
                    {participant.userEmail && (
                      <p className="text-sm text-muted-foreground">
                        {participant.userEmail}
                      </p>
                    )}
                  </div>
                  <Badge variant={participant.role === 'owner' ? 'default' : 'secondary'}>
                    {participant.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
