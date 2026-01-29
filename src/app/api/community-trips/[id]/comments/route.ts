import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

// DELETE: Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user owns the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    if (comment.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    await prisma.comment.delete({
      where: { id: commentId },
    });
    
    // Update comment count
    const { id: tripId } = await params;
    await prisma.communityTrip.update({
      where: { id: tripId },
      data: { commentCount: { decrement: 1 } },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Comments API] Error deleting:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}

// PATCH: Update a comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { commentId, content } = body;
    
    if (!commentId || !content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment ID and content are required' },
        { status: 400 }
      );
    }
    
    // Check if user owns the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    if (comment.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { 
        content: content.trim(),
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('[Comments API] Error updating:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}
