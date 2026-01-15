import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { expenseStore } from '@/lib/expense-store';
import { CreateTripRequest, Trip } from '@/types/expense';

// GET /api/trips - Get all trips for current user
export async function GET() {
  try {
    console.log('[/api/trips] GET request started');
    
    const authResult = await auth();
    console.log('[/api/trips] Auth result:', { userId: authResult?.userId, hasSession: !!authResult });
    
    const { userId } = authResult;
    
    if (!userId) {
      console.warn('[/api/trips] No userId found in auth');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[/api/trips] Fetching trips for user:', userId);
    const trips = expenseStore.getTripsByUser(userId);
    console.log('[/api/trips] Found trips:', trips.length);
    
    return NextResponse.json({ trips });
  } catch (error) {
    console.error('[/api/trips] Error fetching trips:', error);
    console.error('[/api/trips] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[/api/trips] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Unknown',
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch trips', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/trips - Create a new trip
export async function POST(req: NextRequest) {
  try {
    console.log('[/api/trips] POST request started');
    
    const authResult = await auth();
    const { userId } = authResult;
    
    if (!userId) {
      console.warn('[/api/trips] No userId found in auth for POST');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateTripRequest = await req.json();

    // Validate required fields
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Trip name is required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const trip: Trip = {
      id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: body.name.trim(),
      baseCurrency: body.baseCurrency || 'USD',
      createdBy: userId,
      startDate: body.startDate,
      endDate: body.endDate,
      destination: body.destination,
      budgetLimit: body.budgetLimit,
      createdAt: now,
      updatedAt: now,
    };

    // Create the trip
    const createdTrip = expenseStore.createTrip(trip);

    // Add creator as owner participant
    const participant = {
      id: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tripId: trip.id,
      userId: userId,
      userName: 'You', // This should come from Clerk user data
      userEmail: '', // This should come from Clerk user data
      role: 'owner' as const,
      isActive: true,
      joinedAt: now,
    };

    expenseStore.addParticipant(participant);

    console.log('[/api/trips] Trip created successfully:', trip.id);
    return NextResponse.json({ trip: createdTrip }, { status: 201 });
  } catch (error) {
    console.error('[/api/trips] Error creating trip:', error);
    console.error('[/api/trips] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { error: 'Failed to create trip', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
