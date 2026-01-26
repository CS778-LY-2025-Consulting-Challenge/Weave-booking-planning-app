import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch comments for a trip
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const comments = await prisma.comment.findMany({
      where: { tripId: id },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error('[Comments API] Error fetching:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST: Add a comment
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
    
    const body = await request.json();
    const { content, userName, userAvatar } = body;
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }
    
    const comment = await prisma.comment.create({
      data: {
        tripId,
        userId,
        userName: userName || 'Anonymous User',
        userAvatar: userAvatar || null,
        content: content.trim(),
      },
    });
    
    // Update comment count
    await prisma.communityTrip.update({
      where: { id: tripId },
      data: { commentCount: { increment: 1 } },
    });
    
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('[Comments API] Error creating:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
