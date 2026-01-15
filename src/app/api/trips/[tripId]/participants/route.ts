import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { expenseStore } from '@/lib/expense-store';
import { InviteParticipantRequest, TripParticipant } from '@/types/expense';

// GET /api/trips/[tripId]/participants - Get all participants
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

    const participants = expenseStore.getParticipants(tripId);
    return NextResponse.json({ participants });
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}

// POST /api/trips/[tripId]/participants - Invite participant
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

    // Check if user is participant (any participant can invite)
    if (!expenseStore.isParticipant(tripId, userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body: InviteParticipantRequest = await req.json();

    if (!body.email || !body.email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // In a real app, you would:
    // 1. Look up user by email in Clerk
    // 2. Send invitation email
    // 3. Create pending invitation record
    // For MVP, we'll just create a participant with a mock user ID

    const mockUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const participant: TripParticipant = {
      id: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tripId,
      userId: mockUserId,
      userName: body.userName || body.email.split('@')[0],
      userEmail: body.email,
      role: 'member',
      isActive: true,
      joinedAt: new Date().toISOString(),
    };

    const createdParticipant = expenseStore.addParticipant(participant);
    return NextResponse.json({ participant: createdParticipant }, { status: 201 });
  } catch (error) {
    console.error('Error inviting participant:', error);
    return NextResponse.json(
      { error: 'Failed to invite participant' },
      { status: 500 }
    );
  }
}
