import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/saved-trips - Fetch all saved trips for the current user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const savedTrips = await prisma.savedTrip.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        destination: true,
        thumbnailUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(savedTrips);
  } catch (error: any) {
    console.error('[API] Error fetching saved trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved trips', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/saved-trips - Create a new saved trip
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, destination, thumbnailUrl, plannerState, chatHistory } = body;

    if (!title || !destination) {
      return NextResponse.json(
        { error: 'Title and destination are required' },
        { status: 400 }
      );
    }

    const savedTrip = await prisma.savedTrip.create({
      data: {
        userId,
        title,
        destination,
        thumbnailUrl: thumbnailUrl || null,
        plannerState: plannerState ? JSON.stringify(plannerState) : '{}',
        chatHistory: chatHistory ? JSON.stringify(chatHistory) : '[]',
      },
    });

    return NextResponse.json(savedTrip, { status: 201 });
  } catch (error: any) {
    console.error('[API] Error creating saved trip:', error);
    return NextResponse.json(
      { error: 'Failed to create saved trip', details: error.message },
      { status: 500 }
    );
  }
}
