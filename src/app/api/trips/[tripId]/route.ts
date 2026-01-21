import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/trips/[id] - Get trip details
export async function GET(
    req: Request,
    { params }: { params: Promise<{ tripId: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { tripId } = await params;

    try {
        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                participants: true,
                expenses: {
                    include: {
                        splits: true,
                    },
                    orderBy: {
                        date: 'desc',
                    },
                },
            },
        });

        if (!trip) {
            return new NextResponse('Trip not found', { status: 404 });
        }

        // Check if user is a participant
        const isParticipant = trip.participants.some((p) => p.userId === userId);
        if (!isParticipant) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        return NextResponse.json(trip);
    } catch (error) {
        console.error('Error fetching trip:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// PATCH /api/trips/[tripId] - Update trip details (Owner only)
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ tripId: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { tripId } = await params;

    try {
        // Verify ownership
        const participant = await prisma.tripParticipant.findUnique({
            where: {
                tripId_userId: {
                    tripId: tripId,
                    userId: userId,
                },
            },
        });

        if (!participant || participant.role !== 'owner') {
            return new NextResponse('Forbidden', { status: 403 });
        }

        const body = await req.json();
        const { name, destination, startDate, endDate, budgetLimit, baseCurrency } = body;

        const updatedTrip = await prisma.trip.update({
            where: { id: tripId },
            data: {
                name,
                destination,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                budgetLimit: budgetLimit !== undefined ? Number(budgetLimit) : undefined,
                baseCurrency,
            },
        });

        return NextResponse.json(updatedTrip);
    } catch (error) {
        console.error('Error updating trip:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
