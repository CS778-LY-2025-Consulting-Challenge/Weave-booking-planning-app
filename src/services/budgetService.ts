import {
    ref,
    set,
    push,
    get,
    query,
    orderByChild,
    equalTo,
    onValue,
    serverTimestamp,
    update,
    remove,
    runTransaction
} from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Budget, Expense, Invite } from '@/types/budget';

const BUDGETS_REF = 'budgets';
const INVITES_REF = 'invites';

// --- Budgets ---

export async function createBudget(
    name: string,
    userId: string,
    participants: string[] = [],
    currency: string = 'USD',
    tripId?: string
) {
    try {
        const allParticipants = Array.from(new Set([userId, ...participants]));
        const budgetRef = push(ref(db, BUDGETS_REF));

        const budgetData = {
            id: budgetRef.key,
            name,
            currency,
            participants: allParticipants,
            adminIds: [userId],
            createdBy: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            totalBudget: 0,
            tripId: tripId || null
        };

        await set(budgetRef, budgetData);
        return budgetRef.key;
    } catch (error) {
        console.error("Error creating budget:", error);
        throw error;
    }
}

export async function getUserBudgets(userId: string): Promise<Budget[]> {
    // RTDB doesn't support array-contains directly. 
    // We fetch all budgets (or a reasonable limit) and filter client-side, 
    // or ideally we would maintain a user_budgets/{userId} index.
    // For this app's scale, fetching and filtering is okay for now, 
    // OR we can query by createdBy if that covers most cases? No, collaborators need to see it too.
    // Let's filter client side for now as it's simplest without changing data structure.

    try {
        const budgetsRef = ref(db, BUDGETS_REF);
        // We can't query array contains. We'll fetch all and filter. 
        // NOTE: In production, use a denormalized index: `users/{userId}/budgets/{budgetId}: true`
        const snapshot = await get(budgetsRef);

        if (!snapshot.exists()) return [];

        const budgets: Budget[] = [];
        snapshot.forEach((child) => {
            const val = child.val();
            if (val.participants && Array.isArray(val.participants) && val.participants.includes(userId)) {
                budgets.push({ id: child.key!, ...val });
            }
        });

        // Sort by updatedAt desc
        return budgets.sort((a, b) => {
            const timeA = new Date(a.updatedAt || 0).getTime();
            const timeB = new Date(b.updatedAt || 0).getTime();
            return timeB - timeA;
        });
    } catch (error) {
        console.error("Error fetching user budgets:", error);
        return [];
    }
}

export async function getBudgetByTripId(tripId: string): Promise<Budget | null> {
    const budgetsQuery = query(ref(db, BUDGETS_REF), orderByChild('tripId'), equalTo(tripId));
    const snapshot = await get(budgetsQuery);

    if (snapshot.exists()) {
        const key = Object.keys(snapshot.val())[0];
        return { id: key, ...snapshot.val()[key] } as Budget;
    }
    return null;
}

export async function getBudget(budgetId: string): Promise<Budget | null> {
    const snapshot = await get(ref(db, `${BUDGETS_REF}/${budgetId}`));
    if (snapshot.exists()) {
        return { id: snapshot.key!, ...snapshot.val() } as Budget;
    }
    return null;
}

const defaultOnError = (error: any) => console.error("Snapshot error:", error);

export function subscribeToBudget(budgetId: string, callback: (budget: Budget | null) => void, onError = defaultOnError) {
    const budgetRef = ref(db, `${BUDGETS_REF}/${budgetId}`);
    return onValue(budgetRef, (snapshot) => {
        if (snapshot.exists()) {
            const val = snapshot.val();
            // Expenses are inside the budget object in RTDB, remove them to keep Budget clean?
            // The type definition might expect them separate or not. 
            // In the previous Firestore code, it returned {id, ...data}.
            const { expenses: _, ...cleanBudget } = val;
            callback({ id: snapshot.key!, ...cleanBudget } as Budget);
        } else {
            callback(null);
        }
    }, onError);
}


// --- Invites ---

export async function createInvite(
    budgetId: string,
    budgetName: string,
    userId: string,
    userName: string,
    options: { expiresInDays?: number; maxUses?: number } = {}
): Promise<Invite> {
    // 1. Check existing
    // RTDB filtering is limited. We'll simplify and just create new or fetch by budgetId and filter in memory.
    const invitesQuery = query(ref(db, INVITES_REF), orderByChild('budgetId'), equalTo(budgetId));
    const snapshot = await get(invitesQuery);

    const now = new Date();
    let existingInvite: Invite | null = null;

    if (snapshot.exists()) {
        snapshot.forEach((child) => {
            const val = child.val();
            if (val.createdBy === userId) {
                const expiresAt = val.expiresAt ? new Date(val.expiresAt) : null;
                const isExpired = expiresAt && expiresAt < now;
                const isMaxed = val.maxUses && val.usedCount >= val.maxUses;

                if (!isExpired && !isMaxed) {
                    existingInvite = { id: child.key!, ...val };
                }
            }
        });
    }

    if (existingInvite) return existingInvite;

    // 2. Create New
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newInviteRef = push(ref(db, INVITES_REF));

    let expiresAt: number | null = null;
    if (options.expiresInDays) {
        expiresAt = Date.now() + (options.expiresInDays * 24 * 60 * 60 * 1000);
    }

    const inviteData = {
        inviteCode,
        budgetId,
        budgetName,
        createdBy: userId,
        createdByName: userName,
        createdAt: serverTimestamp(),
        usedCount: 0,
        maxUses: options.maxUses || null,
        expiresAt
    };

    await set(newInviteRef, inviteData);
    return { id: newInviteRef.key!, ...inviteData } as any;
}

export async function getInviteByCode(code: string): Promise<Invite | null> {
    const invitesQuery = query(ref(db, INVITES_REF), orderByChild('inviteCode'), equalTo(code));
    const snapshot = await get(invitesQuery);

    if (snapshot.exists()) {
        const key = Object.keys(snapshot.val())[0];
        return { id: key, ...snapshot.val()[key] } as Invite;
    }
    return null;
}

export async function joinBudgetWithInvite(inviteCode: string, userId: string): Promise<{ success: boolean; budgetId?: string; message: string }> {
    const invite = await getInviteByCode(inviteCode);
    if (!invite) return { success: false, message: "Invalid invite code" };

    const now = Date.now();
    const expiresAt = invite.expiresAt instanceof Date ? invite.expiresAt.getTime() : invite.expiresAt;

    if (expiresAt && expiresAt < now) return { success: false, message: "Invite expired" };
    if (invite.maxUses && invite.usedCount >= invite.maxUses) return { success: false, message: "Invite limit reached" };

    const budgetRef = ref(db, `${BUDGETS_REF}/${invite.budgetId}`);
    const inviteRef = ref(db, `${INVITES_REF}/${invite.id}`);

    try {
        await runTransaction(budgetRef, (currentBudget) => {
            if (currentBudget) {
                if (!currentBudget.participants) currentBudget.participants = [];
                if (!currentBudget.participants.includes(userId)) {
                    currentBudget.participants.push(userId);
                    currentBudget.updatedAt = serverTimestamp();
                }
            }
            return currentBudget;
        });

        await runTransaction(inviteRef, (currentInvite) => {
            if (currentInvite) {
                currentInvite.usedCount = (currentInvite.usedCount || 0) + 1;
            }
            return currentInvite;
        });

        return { success: true, budgetId: invite.budgetId, message: "Successfully joined" };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

// --- Expenses ---

export async function addExpense(budgetId: string, expense: Omit<Expense, 'id' | 'createdAt'>) {
    const expenseRef = push(ref(db, `${BUDGETS_REF}/${budgetId}/expenses`));
    await set(expenseRef, {
        ...expense,
        createdAt: serverTimestamp()
    });

    // Update budget timestamp
    await update(ref(db, `${BUDGETS_REF}/${budgetId}`), {
        updatedAt: serverTimestamp()
    });

    return expenseRef.key;
}

export function subscribeToExpenses(budgetId: string, callback: (expenses: Expense[]) => void, onError = defaultOnError) {
    const expensesRef = ref(db, `${BUDGETS_REF}/${budgetId}/expenses`);
    return onValue(expensesRef, (snapshot) => {
        if (snapshot.exists()) {
            const expensesObj = snapshot.val();
            const expensesList = Object.entries(expensesObj).map(([key, val]: [string, any]) => ({
                id: key,
                ...val
            })).sort((a: any, b: any) => {
                // Sort desc by date
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
            callback(expensesList);
        } else {
            callback([]);
        }
    }, onError);
}

export async function deleteExpense(budgetId: string, expenseId: string) {
    await remove(ref(db, `${BUDGETS_REF}/${budgetId}/expenses/${expenseId}`));
    await update(ref(db, `${BUDGETS_REF}/${budgetId}`), {
        updatedAt: serverTimestamp()
    });
}

// --- Storage ---

export async function uploadReceipt(file: File, budgetId: string): Promise<string> {
    const fileRef = storageRef(storage, `receipts/${budgetId}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
}
