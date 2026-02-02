import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    onSnapshot,
    orderBy,
    serverTimestamp,
    limit,
    arrayUnion,
    Transaction,
    runTransaction
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '@/lib/firebase';
import { Budget, Expense, Participant, Invite } from '@/types/budget';

const BUDGETS_COLLECTION = 'budgets';
const EXPENSES_COLLECTION = 'expenses';
const INVITES_COLLECTION = 'invites';

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

        const budgetData = {
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

        const docRef = await addDoc(collection(firestore, BUDGETS_COLLECTION), budgetData);
        return docRef.id;
    } catch (error) {
        console.error("Error creating budget:", error);
        throw error;
    }
}

export async function getUserBudgets(userId: string): Promise<Budget[]> {
    const q = query(
        collection(firestore, BUDGETS_COLLECTION),
        where("participants", "array-contains", userId),
        orderBy("updatedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
}

export async function getBudgetByTripId(tripId: string): Promise<Budget | null> {
    const q = query(
        collection(firestore, BUDGETS_COLLECTION),
        where("tripId", "==", tripId),
        limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Budget;
    }
    return null;
}

export async function getBudget(budgetId: string): Promise<Budget | null> {
    const docRef = doc(firestore, BUDGETS_COLLECTION, budgetId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Budget;
    }
    return null;
}

const defaultOnError = (error: any) => console.error("Snapshot error:", error);

export function subscribeToBudget(budgetId: string, callback: (budget: Budget | null) => void, onError = defaultOnError) {
    const docRef = doc(firestore, BUDGETS_COLLECTION, budgetId);
    return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() } as Budget);
        } else {
            callback(null);
        }
    }, onError);
}

// ...



// --- Invites ---

export async function createInvite(
    budgetId: string,
    budgetName: string,
    userId: string,
    userName: string,
    options: { expiresInDays?: number; maxUses?: number } = {}
): Promise<Invite> {
    // 1. Check for existing active invite for this user and budget
    // Note: This optimization prevents spamming new invites and speeds up the UI
    // We filter in memory to avoid needing a complex composite index immediately
    const q = query(
        collection(firestore, INVITES_COLLECTION),
        where("budgetId", "==", budgetId),
        where("createdBy", "==", userId),
        limit(10) // Fetch a few recent invites
    );

    try {
        const snapshot = await getDocs(q);
        const now = new Date();

        // Sort in memory (newest first) and find valid one
        const activeInviteDoc = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Invite))
            .sort((a, b) => {
                const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
                const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
                return timeB - timeA;
            })
            .find(invite => {
                // Check expiration
                if (invite.expiresAt && invite.expiresAt.toDate() < now) return false;
                // Check max usage
                if (invite.maxUses && invite.usedCount >= invite.maxUses) return false;
                return true;
            });

        if (activeInviteDoc) {
            console.log("Reusing existing active invite");
            return activeInviteDoc;
        }
    } catch (error) {
        console.warn("Failed to check existing invites, proceeding to create new one:", error);
    }

    // 2. Create new invite if none found
    // Generate a random 6-character code (uppercase alphanumeric)
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const inviteData: Omit<Invite, 'id'> = {
        inviteCode,
        budgetId,
        budgetName,
        createdBy: userId,
        createdByName: userName,
        createdAt: serverTimestamp(),
        usedCount: 0,
        maxUses: options.maxUses || null,
    };

    if (options.expiresInDays) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + options.expiresInDays);
        inviteData.expiresAt = expirationDate;
    }

    const docRef = await addDoc(collection(firestore, INVITES_COLLECTION), inviteData);
    return { id: docRef.id, ...inviteData } as Invite;
}

export async function getInviteByCode(code: string): Promise<Invite | null> {
    const q = query(
        collection(firestore, INVITES_COLLECTION),
        where("inviteCode", "==", code),
        limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Invite;
}

export async function joinBudgetWithInvite(inviteCode: string, userId: string): Promise<{ success: boolean; budgetId?: string; message: string }> {
    const invite = await getInviteByCode(inviteCode);

    if (!invite) {
        return { success: false, message: "Invalid invite code" };
    }

    // Check Expiration
    if (invite.expiresAt && invite.expiresAt.toDate() < new Date()) {
        return { success: false, message: "Invite has expired" };
    }

    // Check Max Uses
    if (invite.maxUses && invite.usedCount >= invite.maxUses) {
        return { success: false, message: "Invite limit reached" };
    }

    // Check if user is already in the budget (optional optimization, but good UX)
    const budget = await getBudget(invite.budgetId);
    if (budget && budget.participants.includes(userId)) {
        return { success: true, budgetId: invite.budgetId, message: "You are already a member of this budget" };
    }

    try {
        await runTransaction(firestore, async (transaction) => {
            const inviteRef = doc(firestore, INVITES_COLLECTION, invite.id);
            const budgetRef = doc(firestore, BUDGETS_COLLECTION, invite.budgetId);

            // Increment used count
            transaction.update(inviteRef, { usedCount: invite.usedCount + 1 });

            // Add user to budget participants
            transaction.update(budgetRef, {
                participants: arrayUnion(userId),
                updatedAt: serverTimestamp()
            });
        });

        return { success: true, budgetId: invite.budgetId, message: "Successfully joined budget" };
    } catch (error) {
        console.error("Error joining budget:", error);
        return { success: false, message: "Failed to join budget. Please try again." };
    }
}

// --- Expenses ---

export async function addExpense(budgetId: string, expense: Omit<Expense, 'id' | 'createdAt'>) {
    try {
        const expensesRef = collection(firestore, BUDGETS_COLLECTION, budgetId, EXPENSES_COLLECTION);

        const expenseData = {
            ...expense,
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(expensesRef, expenseData);

        // Update budget updated timestamp
        const budgetRef = doc(firestore, BUDGETS_COLLECTION, budgetId);
        await updateDoc(budgetRef, { updatedAt: serverTimestamp() });

        return docRef.id;
    } catch (error) {
        console.error("Error adding expense:", error);
        throw error;
    }
}

export function subscribeToExpenses(budgetId: string, callback: (expenses: Expense[]) => void, onError = defaultOnError) {
    const expensesRef = collection(firestore, BUDGETS_COLLECTION, budgetId, EXPENSES_COLLECTION);
    const q = query(expensesRef, orderBy("date", "desc"));

    return onSnapshot(q, (snapshot) => {
        const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
        callback(expenses);
    }, onError);
}

export async function deleteExpense(budgetId: string, expenseId: string) {
    const expenseRef = doc(firestore, BUDGETS_COLLECTION, budgetId, EXPENSES_COLLECTION, expenseId);
    await deleteDoc(expenseRef);
}

// --- Storage ---

export async function uploadReceipt(file: File, budgetId: string): Promise<string> {
    const fileRef = ref(storage, `receipts/${budgetId}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
}
