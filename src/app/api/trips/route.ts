import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/trips - Get all trips for the current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const trips = await prisma.trip.findMany({
      where: {
        participants: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        participants: true,
        _count: {
          select: { expenses: true },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ trips });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST /api/trips - Create a new trip
export async function POST(req: Request) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, destination, startDate, endDate, baseCurrency, budgetLimit } = body;

    const trip = await prisma.trip.create({
      data: {
        name,
        destination,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        baseCurrency: baseCurrency || 'USD',
        budgetLimit: budgetLimit ? Number(budgetLimit) : undefined,
        createdBy: userId,
        participants: {
          create: {
            userId: userId,
            email: user.emailAddresses[0]?.emailAddress,
            name: `${user.firstName} ${user.lastName}`.trim() || user.username || 'Unknown',
            role: 'owner',
            status: 'joined',
          },
        },
      },
    });

    return NextResponse.json({ trip });
  } catch (error) {
    console.error('Error creating trip:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
