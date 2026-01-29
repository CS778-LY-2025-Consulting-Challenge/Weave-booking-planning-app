import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Import community trip to user's saved trips
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: communityTripId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the community trip
    const communityTrip = await prisma.communityTrip.findUnique({
      where: { id: communityTripId },
    });
    
    if (!communityTrip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }
    
    // Create a new SavedTrip for the user
    const savedTrip = await prisma.savedTrip.create({
      data: {
        userId,
        title: `${communityTrip.title} (Imported)`,
        destination: communityTrip.destination,
        thumbnailUrl: communityTrip.thumbnailUrl,
        plannerState: communityTrip.plannerState,
        chatHistory: JSON.stringify([]),
      },
    });
    
    // Increment import count
    await prisma.communityTrip.update({
      where: { id: communityTripId },
      data: { importCount: { increment: 1 } },
    });
    
    return NextResponse.json({
      success: true,
      savedTripId: savedTrip.id,
      message: 'Trip imported successfully',
    });
  } catch (error) {
    console.error('[Import API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to import trip' },
      { status: 500 }
    );
  }
}
