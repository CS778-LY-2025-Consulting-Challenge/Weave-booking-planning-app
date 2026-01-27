import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch all community trips with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination');
    const minRating = searchParams.get('minRating');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const where: any = {
      isPublished: true,
    };
    
    if (destination) {
      where.destination = {
        contains: destination,
        mode: 'insensitive',
      };
    }
    
    if (minRating) {
      where.rating = {
        gte: parseFloat(minRating),
      };
    }
    
    const trips = await prisma.communityTrip.findMany({
      where,
      orderBy: [
        { rating: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      include: {
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
    
    return NextResponse.json(trips);
  } catch (error) {
    console.error('[Community Trips API] Error fetching trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community trips' },
      { status: 500 }
    );
  }
}

// POST: Create a new community trip
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
    const {
      title,
      destination,
      thumbnailUrl,
      duration,
      description,
      plannerState,
      highlights,
      originalTripId,
      sourceType,
    } = body;
    
    // Validate required fields
    if (!title || !destination || !plannerState) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get user info from Clerk
    const userName = body.userName || 'Anonymous User';
    const userAvatar = body.userAvatar || null;
    
    const communityTrip = await prisma.communityTrip.create({
      data: {
        userId,
        userName,
        userAvatar,
        title,
        destination,
        thumbnailUrl: thumbnailUrl || '',
        duration: duration || '1 day',
        description: description || '',
        plannerState: JSON.stringify(plannerState),
        highlights: JSON.stringify(highlights || []),
        originalTripId,
        sourceType: sourceType || 'scratch',
        rating: 0,
        isPublished: true,
      },
    });
    
    return NextResponse.json(communityTrip, { status: 201 });
  } catch (error) {
    console.error('[Community Trips API] Error creating trip:', error);
    return NextResponse.json(
      { error: 'Failed to create community trip' },
      { status: 500 }
    );
  }
}
