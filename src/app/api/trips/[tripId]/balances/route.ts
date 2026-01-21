import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateSettlements } from '@/lib/expense-utils';

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

        // Fetch all active expenses and their splits
        const expenses = await prisma.expense.findMany({
            where: { tripId: tripId, status: 'active' },
            include: { splits: true },
        });

        const participants = await prisma.tripParticipant.findMany({
            where: { tripId: tripId },
        });

        // Calculate Balances
        // Map of userId -> Balance (positive = owed, negative = owes)
        const balancesMap = new Map<string, number>();

        // Initialize
        participants.forEach(p => balancesMap.set(p.userId, 0));

        expenses.forEach(expense => {
            // Payer gets +amount
            const currentPayerBalance = balancesMap.get(expense.paidByUserId) || 0;
            balancesMap.set(expense.paidByUserId, currentPayerBalance + expense.amount);

            // Each split user gets -share
            expense.splits.forEach(split => {
                const currentSplitBalance = balancesMap.get(split.userId) || 0;
                balancesMap.set(split.userId, currentSplitBalance - split.amount);
            });
        });

        // Format for response
        const balances = participants.map(p => ({
            userId: p.userId,
            userName: p.name ?? '',
            userEmail: p.email ?? '',
            email: p.email, // keep existing field for response compatibility
            totalPaid: 0,
            totalOwed: 0,
            balance: balancesMap.get(p.userId) || 0,
        }));

        // Calculate simplified settlements using the normalized UserBalance shape
        const settlements = calculateSettlements(balances);

        return NextResponse.json({
            balances,
            settlements
        });

    } catch (error) {
        console.error('Error fetching balances:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
