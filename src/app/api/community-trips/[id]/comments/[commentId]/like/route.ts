import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Toggle like on a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { userId } = await auth();
    const { commentId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    // Check if user already liked
    const existingLike = await prisma.commentLike.findFirst({
      where: {
        commentId,
        userId,
      },
    });
    
    if (existingLike) {
      // Unlike
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      });
      
      const likeCount = await prisma.commentLike.count({
        where: { commentId },
      });
      
      return NextResponse.json({
        isLiked: false,
        likeCount,
      });
    } else {
      // Like
      await prisma.commentLike.create({
        data: {
          commentId,
          userId,
        },
      });
      
      const likeCount = await prisma.commentLike.count({
        where: { commentId },
      });
      
      return NextResponse.json({
        isLiked: true,
        likeCount,
      });
    }
  } catch (error) {
    console.error('[Comment Like API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
