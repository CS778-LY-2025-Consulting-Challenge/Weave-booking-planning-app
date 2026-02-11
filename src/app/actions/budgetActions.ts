'use server';

import { adminRtdb } from '@/lib/firebase-admin';
import { ServerValue } from 'firebase-admin/database';

// Helper to get formatted error
const getError = (e: any): ActionResult => ({ success: false, error: e.message });

type ActionResult<T = object> = { success: boolean; error?: string } & T;

export async function createBudgetAction(name: string, userId: string): Promise<ActionResult<{ budgetId?: string }>> {
    if (!name || !userId) return { success: false, error: 'Missing required fields' };

    try {
        const budgetsRef = adminRtdb.ref('budgets');
        const newBudgetRef = budgetsRef.push();
        const budgetId = newBudgetRef.key;

        if (!budgetId) throw new Error('Failed to generate key');

        const budgetData = {
            id: budgetId,
            name,
            tripId: null,
            currency: 'USD',
            participants: [userId], // Store as simple array
            adminIds: [userId],
            createdBy: userId,
            createdAt: ServerValue.TIMESTAMP,
            updatedAt: ServerValue.TIMESTAMP,
            totalBudget: 0,
        };

        await newBudgetRef.set(budgetData);
        return { success: true, budgetId };
    } catch (error: any) {
        console.error('Create Budget Error:', error);
        return getError(error);
    }
}

export async function createInviteAction(
    budgetId: string,
    budgetName: string,
    userId: string,
    userName: string,
    expiresInDays: number = 7
): Promise<ActionResult<{ invite?: any }>> {
    if (!budgetId || !userId) return { success: false, error: 'Missing fields' };

    try {
        const invitesRef = adminRtdb.ref('invites');

        // Optimization: Check for existing active invite
        // RTDB Query: Order by budgetId filtering for userId is hard without composite keys.
        // We'll just fetch by budgetId and filter in memory since volume is low per budget.
        const query = invitesRef.orderByChild('budgetId').equalTo(budgetId);
        const snapshot = await query.once('value');

        const now = Date.now();
        let activeInvite: any = null;

        snapshot.forEach((child) => {
            const val = child.val();
            if (val.createdBy === userId) {
                // Check expiry (handled as timestamp number in RTDB)
                const isExpired = val.expiresAt && val.expiresAt < now;
                const isMaxed = val.maxUses && val.usedCount >= val.maxUses;
                if (!isExpired && !isMaxed) {
                    activeInvite = { id: child.key, ...val };
                    return true; // Stop? forEach in RTDB SDK doesn't support break easily but we can just assign
                }
            }
        });

        if (activeInvite) return { success: true, invite: activeInvite };

        // Create New
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newInviteRef = invitesRef.push();

        let expiresAt: number | null = null;
        if (expiresInDays) {
            expiresAt = now + (expiresInDays * 24 * 60 * 60 * 1000);
        }

        const inviteData = {
            inviteCode,
            budgetId,
            budgetName,
            createdBy: userId,
            createdByName: userName,
            createdAt: ServerValue.TIMESTAMP,
            usedCount: 0,
            maxUses: null,
            expiresAt
        };

        await newInviteRef.set(inviteData);
        return { success: true, invite: { id: newInviteRef.key, ...inviteData } };

    } catch (error: any) {
        console.error('Create Invite Error:', error);
        return getError(error);
    }
}

export async function getInviteByCodeAction(inviteCode: string): Promise<ActionResult<{ invite?: any }>> {
    if (!inviteCode) return { success: false, error: 'Missing code' };

    try {
        const invitesRef = adminRtdb.ref('invites');
        const query = invitesRef.orderByChild('inviteCode').equalTo(inviteCode).limitToFirst(1);
        const snapshot = await query.once('value');

        if (!snapshot.exists()) return { success: false, error: 'Invite not found' };

        let inviteData: any = null;
        snapshot.forEach((child) => {
            inviteData = { id: child.key, ...child.val() };
        });

        return { success: true, invite: inviteData };
    } catch (error: any) {
        return getError(error);
    }
}

export async function joinBudgetAction(inviteCode: string, userId: string): Promise<ActionResult<{ budgetId?: string; message?: string }>> {
    if (!inviteCode || !userId) return { success: false, error: 'Missing fields' };

    try {
        // 1. Get Invite
        const result = await getInviteByCodeAction(inviteCode);
        if (!result.success || !result.invite) {
            return { success: false, error: result.error || 'Invalid Invite' };
        }
        const invite = result.invite;

        // 2. Validate
        const now = Date.now();
        if (invite.expiresAt && invite.expiresAt < now) return { success: false, error: 'Expired' };
        if (invite.maxUses && invite.usedCount >= invite.maxUses) return { success: false, error: 'Limit reached' };

        // 3. Join (Transaction)
        const budgetRef = adminRtdb.ref(`budgets/${invite.budgetId}`);
        const inviteRef = adminRtdb.ref(`invites/${invite.id}`);

        // Check if already member
        const budgetSnap = await budgetRef.once('value');
        if (!budgetSnap.exists()) return { success: false, error: 'Budget deleted' };

        const budgetVal = budgetSnap.val();
        if (budgetVal.participants && budgetVal.participants.includes(userId)) {
            return { success: true, budgetId: invite.budgetId, message: 'Already joined' };
        }

        // Transaction on Invite Usage
        await inviteRef.child('usedCount').transaction((current) => (current || 0) + 1);

        // Add to Budget Participants
        // RTDB arrays are tricky. We'll read, modify, write for simplicity or use a map if redesigned.
        // Sticking to array to match existing logic.
        const participants = budgetVal.participants || [];
        if (!participants.includes(userId)) {
            participants.push(userId);
            await budgetRef.update({
                participants,
                updatedAt: ServerValue.TIMESTAMP
            });
        }

        return { success: true, budgetId: invite.budgetId };

    } catch (error: any) {
        console.error('Join Error:', error);
        return getError(error);
    }
}

export async function getBudgetDetailsAction(budgetId: string): Promise<ActionResult<{ budget?: any; expenses?: any[] }>> {
    if (!budgetId) return { success: false, error: 'Missing ID' };

    try {
        const budgetRef = adminRtdb.ref(`budgets/${budgetId}`);
        const snapshot = await budgetRef.once('value');

        if (!snapshot.exists()) return { success: false, error: 'Not found' };

        const budgetData = snapshot.val();

        // Expenses are stored as a sub-collection (nested object in RTDB)
        const expensesData = budgetData.expenses || {};
        const expenses = Object.entries(expensesData).map(([key, val]: [string, any]) => ({
            id: key,
            ...val
        })).sort((a: any, b: any) => {
            // Sort by date desc
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        // Clean up budget object (remove expenses key from it to avoid duplication if passed to view)
        const { expenses: _, ...cleanBudget } = budgetData;

        return {
            success: true,
            budget: { id: budgetId, ...cleanBudget },
            expenses
        };
    } catch (error: any) {
        console.error('Get Budget Error:', error);
        return getError(error);
    }
}

export async function addExpenseAction(budgetId: string, expense: any): Promise<ActionResult> {
    if (!budgetId || !expense) return { success: false, error: 'Missing fields' };

    try {
        const expensesRef = adminRtdb.ref(`budgets/${budgetId}/expenses`);
        const newExpenseRef = expensesRef.push();

        await newExpenseRef.set({
            ...expense,
            createdAt: ServerValue.TIMESTAMP
        });

        // Update budget timestamp
        await adminRtdb.ref(`budgets/${budgetId}`).update({
            updatedAt: ServerValue.TIMESTAMP
        });

        return { success: true };

    } catch (error: any) {
        console.error('Add Expense Error:', error);
        return getError(error);
    }
}

export async function debugServerConnectionAction(): Promise<ActionResult<{ projectId?: string }>> {
    try {
        // Test Read
        await adminRtdb.ref().child('test_connection').once('value');
        // Type assertion for credential property which might not be in standard definitions
        const options: any = adminRtdb.app.options;
        const cred = options.credential;
        return {
            success: true,
            projectId: cred?.projectId || 'unknown'
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteExpenseAction(budgetId: string, expenseId: string): Promise<ActionResult> {
    if (!budgetId || !expenseId) return { success: false, error: 'Missing fields' };

    try {
        await adminRtdb.ref(`budgets/${budgetId}/expenses/${expenseId}`).remove();

        // Update timestamp
        await adminRtdb.ref(`budgets/${budgetId}`).update({
            updatedAt: ServerValue.TIMESTAMP
        });

        return { success: true };
    } catch (error: any) {
        console.error('Delete Expense Error:', error);
        return getError(error);
    }
}

export async function deleteBudgetAction(budgetId: string, userId: string): Promise<ActionResult> {
    if (!budgetId || !userId) return { success: false, error: 'Missing fields' };

    try {
        const budgetRef = adminRtdb.ref(`budgets/${budgetId}`);
        const snapshot = await budgetRef.once('value');

        if (!snapshot.exists()) return { success: false, error: 'Budget not found' };

        const budget = snapshot.val();

        // Ownership check
        if (budget.createdBy !== userId && (!budget.adminIds || !budget.adminIds.includes(userId))) {
            return { success: false, error: 'Not authorized to delete this budget' };
        }

        // Delete the budget
        await budgetRef.remove();

        return { success: true };
    } catch (error: any) {
        console.error('Delete Budget Error:', error);
        return getError(error);
    }
}
