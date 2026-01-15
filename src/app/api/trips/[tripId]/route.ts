import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { expenseStore } from '@/lib/expense-store';

// GET /api/trips/[tripId] - Get trip details with participants
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
    const trip = expenseStore.getTrip(tripId);

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check if user is participant
    if (!expenseStore.isParticipant(tripId, userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const participants = expenseStore.getParticipants(tripId);
    const currentParticipant = participants.find((p) => p.userId === userId);

    return NextResponse.json({
      trip: {
        ...trip,
        participants,
        currentUserRole: currentParticipant?.role,
      },
    });
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip' },
      { status: 500 }
    );
  }
}

// PATCH /api/trips/[tripId] - Update trip details
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tripId } = await params;
    const trip = expenseStore.getTrip(tripId);

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Only owner can update trip
    if (!expenseStore.isOwner(tripId, userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const updatedTrip = expenseStore.updateTrip(tripId, body);

    return NextResponse.json({ trip: updatedTrip });
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}
