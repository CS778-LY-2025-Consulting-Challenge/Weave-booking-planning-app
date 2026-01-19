import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import { calculateEqualShares } from '@/lib/expense-utils'; // We will inline or use utils

// GET /api/trips/[tripId]/expenses
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
        const currentUserPart = await prisma.tripParticipant.findUnique({
            where: { tripId_userId: { tripId: tripId, userId } },
        });
        if (!currentUserPart) return new NextResponse('Forbidden', { status: 403 });

        const expenses = await prisma.expense.findMany({
            where: { tripId: tripId },
            include: {
                splits: true,
            },
            orderBy: { date: 'desc' },
        });

        return NextResponse.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// POST /api/trips/[tripId]/expenses
export async function POST(
    req: Request,
    { params }: { params: Promise<{ tripId: string }> }
) {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    const { tripId } = await params;

    try {
        const currentUserPart = await prisma.tripParticipant.findUnique({
            where: { tripId_userId: { tripId: tripId, userId } },
        });
        if (!currentUserPart) return new NextResponse('Forbidden', { status: 403 });

        const body = await req.json();
        const {
            description,
            amount,
            currency,
            date,
            category,
            splitWith, // Array of userIds to split with (including payer usually)
            paidByUserId, // Optional, defaults to current user
        } = body;

        const payerId = paidByUserId || userId;
        const splitUserIds: string[] = splitWith || [];

        // Validation
        if (!description || amount === undefined || !currency || splitUserIds.length === 0) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // Calculate Splits (Equal Split MVP)
        const splitsData: { userId: string; amount: number; isPaid: boolean }[] = [];
        const shareAmount = Math.floor(amount / splitUserIds.length);
        const remainder = amount % splitUserIds.length;

        for (let i = 0; i < splitUserIds.length; i++) {
            const splitUserId = splitUserIds[i];
            // Distribute remainder cents
            const finalShare = shareAmount + (i < remainder ? 1 : 0);

            splitsData.push({
                userId: splitUserId,
                amount: finalShare,
                isPaid: false, // Default false
            });
        }

        // Transactional create
        const expense = await prisma.expense.create({
            data: {
                tripId: tripId,
                description,
                amount,
                currency,
                date: new Date(date),
                category,
                paidByUserId: payerId,
                splitType: 'EQUAL',
                splits: {
                    create: splitsData,
                },
            },
            include: {
                splits: true,
            },
        });

        return NextResponse.json(expense);
    } catch (error) {
        console.error('Error creating expense:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
