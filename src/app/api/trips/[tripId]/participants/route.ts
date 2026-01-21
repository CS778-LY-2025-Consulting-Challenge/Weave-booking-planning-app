import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/trips/[id]/participants
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
        // Check access
        const currentUserPart = await prisma.tripParticipant.findUnique({
            where: {
                tripId_userId: {
                    tripId: tripId,
                    userId: userId,
                },
            },
        });

        if (!currentUserPart) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        const participants = await prisma.tripParticipant.findMany({
            where: { tripId: tripId },
            orderBy: { joinedAt: 'asc' },
        });

        return NextResponse.json(participants);
    } catch (error) {
        console.error('Error fetching participants:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// POST /api/trips/[tripId]/participants - Invite/Add participant
export async function POST(
    req: Request,
    { params }: { params: Promise<{ tripId: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { tripId } = await params;
    const body = await req.json();
    const { email, name } = body;

    if (!email) {
        return new NextResponse('Email is required', { status: 400 });
    }

    try {
        // Check permission (Owner or Member can invite? MVP: Any member can invite)
        const currentUserPart = await prisma.tripParticipant.findUnique({
            where: {
                tripId_userId: {
                    tripId: tripId,
                    userId: userId,
                },
            },
        });

        if (!currentUserPart) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Check if already exists
        // Note: We need a way to map email -> userId if they are already in the system.
        // For MVP, we might create a placeholder participant with a fake userId or generated ID if they haven't signed up.
        // However, our schema enforces `userId` as a String. We can use the email as userId for invited users if they aren't signed up yet, 
        // OR generate a UUID.
        // Let's generate a temporary UUID for the invited user.
        // When they actual join/signup, we would need to merge, but that's complex.
        // Simpler MVP: We assume we find the user by email, or we just add them as "Invited User".
        // For now, let's just generate a random ID for the `userId` field to satisfy schema, and rely on `email`.

        // BETTER: If we want to test with real users, we assume the UI sends the target `userId` if found, or just email.
        // Let's support adding by known userId OR email.

        let targetUserId = body.userId;
        if (!targetUserId) {
            // Mock logic: In a real app we'd look up the user via Clerk API. 
            // Here, we'll just create a placeholder ID.
            targetUserId = `invited_${crypto.randomUUID()}`;
        }

        const participant = await prisma.tripParticipant.create({
            data: {
                tripId: tripId,
                userId: targetUserId,
                email,
                name: name || email.split('@')[0],
                role: 'member',
                status: 'invited',
            },
        });

        return NextResponse.json(participant);
    } catch (error) {
        console.error('Error adding participant:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
