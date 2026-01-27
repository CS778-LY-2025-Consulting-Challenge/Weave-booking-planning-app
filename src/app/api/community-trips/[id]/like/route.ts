import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Toggle like (add or remove)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: tripId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId,
        },
      },
    });
    
    if (existingLike) {
      // Unlike: remove like
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      
      await prisma.communityTrip.update({
        where: { id: tripId },
        data: { likeCount: { decrement: 1 } },
      });
      
      return NextResponse.json({ liked: false });
    } else {
      // Like: add like
      await prisma.like.create({
        data: {
          tripId,
          userId,
        },
      });
      
      await prisma.communityTrip.update({
        where: { id: tripId },
        data: { likeCount: { increment: 1 } },
      });
      
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('[Like API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
