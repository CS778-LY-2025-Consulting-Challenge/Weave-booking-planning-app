import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch replies for a comment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params;
    
    const replies = await prisma.comment.findMany({
      where: { parentId: commentId },
      orderBy: { createdAt: 'asc' },
    });
    
    return NextResponse.json(replies);
  } catch (error) {
    console.error('[Replies API] Error fetching:', error);
    return NextResponse.json(
      { error: 'Failed to fetch replies' },
      { status: 500 }
    );
  }
}

// POST: Add a reply to a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: tripId, commentId } = await params;
    
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
        { error: 'Reply content is required' },
        { status: 400 }
      );
    }
    
    // Check if parent comment exists
    const parentComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    
    if (!parentComment) {
      return NextResponse.json(
        { error: 'Parent comment not found' },
        { status: 404 }
      );
    }
    
    const reply = await prisma.comment.create({
      data: {
        tripId,
        userId,
        userName: userName || 'Anonymous User',
        userAvatar: userAvatar || null,
        content: content.trim(),
        parentId: commentId,
      },
    });
    
    // Update comment count
    await prisma.communityTrip.update({
      where: { id: tripId },
      data: { commentCount: { increment: 1 } },
    });
    
    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error('[Replies API] Error creating:', error);
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    );
  }
}
