import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch single community trip by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const trip = await prisma.communityTrip.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' },
        },
        likes: true,
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
    
    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await prisma.communityTrip.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
    
    // Parse JSON fields
    const tripData = {
      ...trip,
      plannerState: JSON.parse(trip.plannerState),
      highlights: JSON.parse(trip.highlights),
      dayGuides: trip.dayGuides ? JSON.parse(trip.dayGuides) : null, // 解析 dayGuides
    };
    
    return NextResponse.json(tripData);
  } catch (error) {
    console.error('[Community Trip Detail API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip details' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a community trip (only by owner)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check ownership
    const trip = await prisma.communityTrip.findUnique({
      where: { id },
    });
    
    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }
    
    if (trip.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    await prisma.communityTrip.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Community Trip Delete API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}
