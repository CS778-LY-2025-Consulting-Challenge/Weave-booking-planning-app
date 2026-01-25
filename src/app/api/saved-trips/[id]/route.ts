import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/saved-trips/[id] - Fetch a single saved trip
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const savedTrip = await prisma.savedTrip.findFirst({
      where: {
        id: params.id,
        userId: userId,
      },
    });

    if (!savedTrip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Parse JSON strings back to objects
    const response = {
      ...savedTrip,
      plannerState: savedTrip.plannerState ? JSON.parse(savedTrip.plannerState) : null,
      chatHistory: savedTrip.chatHistory ? JSON.parse(savedTrip.chatHistory) : null,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[API] Error fetching saved trip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved trip', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/saved-trips/[id] - Update a saved trip
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify ownership
    const existingTrip = await prisma.savedTrip.findFirst({
      where: {
        id: params.id,
        userId: userId,
      },
    });

    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found or unauthorized' },
        { status: 404 }
      );
    }

    const updatedTrip = await prisma.savedTrip.update({
      where: {
        id: params.id,
      },
      data: {
        title: title || existingTrip.title,
        destination: destination || existingTrip.destination,
        thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : existingTrip.thumbnailUrl,
        plannerState: plannerState ? JSON.stringify(plannerState) : existingTrip.plannerState,
        chatHistory: chatHistory ? JSON.stringify(chatHistory) : existingTrip.chatHistory,
      },
    });

    return NextResponse.json(updatedTrip);
  } catch (error: any) {
    console.error('[API] Error updating saved trip:', error);
    return NextResponse.json(
      { error: 'Failed to update saved trip', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/saved-trips/[id] - Delete a saved trip
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership before deleting
    const existingTrip = await prisma.savedTrip.findFirst({
      where: {
        id: params.id,
        userId: userId,
      },
    });

    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.savedTrip.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API] Error deleting saved trip:', error);
    return NextResponse.json(
      { error: 'Failed to delete saved trip', details: error.message },
      { status: 500 }
    );
  }
}
