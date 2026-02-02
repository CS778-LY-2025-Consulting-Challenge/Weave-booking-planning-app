export interface Participant {
    id: string; // User ID or unique identifier
    name: string;
    email?: string;
    photoURL?: string;
}

export interface Split {
    userId: string;
    amount: number;
    percentage?: number; // For future use
}

export interface Expense {
    id: string;
    budgetId: string;
    description: string;
    amount: number;
    currency: string;
    paidBy: string; // User ID
    date: string; // ISO string
    category?: string;
    receiptUrl?: string; // URL from Firebase Storage
    splitType: 'equal' | 'exact' | 'percentage';
    splits: Split[];
    createdAt: number; // Timestamp
    createdBy: string; // User ID
}

export interface Budget {
    id: string;
    name: string;
    description?: string;
    currency: string;
    totalBudget?: number;
    participants: string[]; // List of User IDs
    adminIds: string[]; // List of User IDs who can manage the budget
    createdAt: any;
    updatedAt: any;
    createdBy: string;
    coverImage?: string;
    tripId?: string; // Link to the Trip
}

export interface Balance {
    userId: string;
    netBalance: number; // Positive means they are owed money, negative means they owe
    owedTo: { [userId: string]: number }; // Detail of who they owe
    owedBy: { [userId: string]: number }; // Detail of who owes them
}

export interface Invite {
    id: string;
    inviteCode: string;
    budgetId: string;
    budgetName: string;
    createdBy: string;
    createdByName: string;
    createdAt: any;
    expiresAt?: any;
    maxUses?: number | null;
    usedCount: number;
}
