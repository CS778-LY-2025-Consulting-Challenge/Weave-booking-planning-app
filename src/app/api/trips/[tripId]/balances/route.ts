import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { expenseStore } from '@/lib/expense-store';
import {
  calculateBalances,
  calculateSettlements,
} from '@/lib/expense-utils';

// GET /api/trips/[tripId]/balances - Get balance calculations for all participants
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId } = await params;

    // Check if trip exists
    const trip = expenseStore.getTrip(tripId);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check if user is participant
    if (!expenseStore.isParticipant(tripId, userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const participants = expenseStore.getParticipants(tripId);
    const expenses = expenseStore.getExpenses(tripId);
    const allShares = expenseStore.getAllSharesForTrip(tripId);

    // Calculate balances
    const balances = calculateBalances(participants, expenses, allShares);

    // Calculate settlements
    const settlements = calculateSettlements(balances);

    // Calculate summary statistics
    const totalSpent = expenses
      .filter((e) => e.status === 'active')
      .reduce((sum, e) => sum + e.amount, 0);

    const expenseCount = expenses.filter((e) => e.status === 'active').length;
    const participantCount = participants.filter((p) => p.isActive).length;
    const averagePerPerson = participantCount > 0 ? totalSpent / participantCount : 0;

    const budgetSummary = {
      totalSpent,
      budgetLimit: trip.budgetLimit,
      budgetRemaining: trip.budgetLimit
        ? trip.budgetLimit - totalSpent
        : undefined,
      percentUsed: trip.budgetLimit
        ? (totalSpent / trip.budgetLimit) * 100
        : undefined,
      expenseCount,
      participantCount,
      averagePerPerson,
    };

    return NextResponse.json({
      balances,
      settlements,
      summary: budgetSummary,
    });
  } catch (error) {
    console.error('Error calculating balances:', error);
    return NextResponse.json(
      { error: 'Failed to calculate balances' },
      { status: 500 }
    );
  }
}
