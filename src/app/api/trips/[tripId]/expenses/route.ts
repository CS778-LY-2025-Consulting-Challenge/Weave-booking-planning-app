import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { expenseStore } from '@/lib/expense-store';
import { calculateEqualShares, validateSplitParticipants } from '@/lib/expense-utils';
import { CreateExpenseRequest, Expense, ExpenseShare } from '@/types/expense';

// GET /api/trips/[tripId]/expenses - Get all expenses for a trip
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

    if (!expenseStore.isParticipant(tripId, userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const expenses = expenseStore.getExpenses(tripId);
    
    // Include shares with each expense
    const expensesWithShares = expenses
      .filter((e) => e.status === 'active')
      .map((expense) => ({
        ...expense,
        shares: expenseStore.getExpenseShares(expense.id),
      }));

    return NextResponse.json({ expenses: expensesWithShares });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST /api/trips/[tripId]/expenses - Create a new expense
export async function POST(
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

    const body: CreateExpenseRequest = await req.json();

    // Validate required fields
    if (!body.description || body.description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!body.paidByUserId) {
      return NextResponse.json(
        { error: 'Payer is required' },
        { status: 400 }
      );
    }

    if (!body.splitWith || body.splitWith.length === 0) {
      return NextResponse.json(
        { error: 'Must select at least one person to split with' },
        { status: 400 }
      );
    }

    // Get participants to validate
    const participants = expenseStore.getParticipants(tripId);
    const validation = validateSplitParticipants(body.splitWith, participants);
    
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Get payer info
    const payer = participants.find((p) => p.userId === body.paidByUserId);
    if (!payer) {
      return NextResponse.json(
        { error: 'Payer must be a trip participant' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const expense: Expense = {
      id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tripId,
      description: body.description.trim(),
      amount: body.amount,
      currency: body.currency || trip.baseCurrency,
      date: body.date,
      paidByUserId: body.paidByUserId,
      paidByUserName: payer.userName,
      createdByUserId: userId,
      splitType: 'EQUAL',
      status: 'active',
      category: body.category,
      notes: body.notes,
      receiptUrl: body.receiptUrl,
      createdAt: now,
      updatedAt: now,
    };

    // Create the expense
    const createdExpense = expenseStore.createExpense(expense);

    // Calculate and create shares
    const shareData = calculateEqualShares(expense, body.splitWith, participants);
    const shares: ExpenseShare[] = shareData.map((share) => ({
      ...share,
      id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
    }));

    expenseStore.createExpenseShares(shares);

    return NextResponse.json(
      { expense: { ...createdExpense, shares } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
