// Type definitions for collaborative expense splitting feature

export type TripParticipantRole = 'owner' | 'member';
export type ExpenseSplitType = 'EQUAL' | 'CUSTOM'; // MVP: EQUAL only
export type ExpenseStatus = 'active' | 'deleted';

export interface Trip {
  id: string;
  name: string;
  baseCurrency: string; // MVP: single currency per trip
  createdBy: string; // userId from Clerk
  startDate?: string;
  endDate?: string;
  destination?: string;
  budgetLimit?: number; // optional budget cap
  createdAt: string;
  updatedAt: string;
}

export interface TripParticipant {
  id: string;
  tripId: string;
  userId: string; // Clerk user ID
  userName: string; // Display name
  userEmail: string;
  role: TripParticipantRole;
  isActive: boolean; // for handling removed participants
  joinedAt: string;
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number; // stored in cents to avoid rounding issues
  currency: string;
  date: string;
  paidByUserId: string;
  paidByUserName: string;
  createdByUserId: string;
  splitType: ExpenseSplitType;
  status: ExpenseStatus;
  category?: string; // optional: food, transport, accommodation, etc.
  notes?: string;
  receiptUrl?: string; // optional receipt image
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseShare {
  id: string;
  expenseId: string;
  userId: string;
  userName: string;
  shareAmount: number; // in cents
  isPaid: boolean; // for tracking settlements
  createdAt: string;
}

// Computed balance for a user in a trip
export interface UserBalance {
  userId: string;
  userName: string;
  userEmail: string;
  totalPaid: number; // total amount paid by this user (in cents)
  totalOwed: number; // total amount owed by this user (in cents)
  balance: number; // net balance (positive = they are owed, negative = they owe)
}

// Simplified payment suggestion for settlement
export interface Settlement {
  from: {
    userId: string;
    userName: string;
  };
  to: {
    userId: string;
    userName: string;
  };
  amount: number; // in cents
}

// Request/Response types for API endpoints
export interface CreateTripRequest {
  name: string;
  baseCurrency?: string;
  startDate?: string;
  endDate?: string;
  destination?: string;
  budgetLimit?: number;
}

export interface InviteParticipantRequest {
  email: string;
  userName?: string;
}

export interface CreateExpenseRequest {
  description: string;
  amount: number; // in cents
  currency?: string;
  date: string;
  paidByUserId: string;
  splitWith: string[]; // array of userIds to split with
  category?: string;
  notes?: string;
  receiptUrl?: string;
}

export interface UpdateExpenseRequest {
  description?: string;
  amount?: number;
  date?: string;
  category?: string;
  notes?: string;
  receiptUrl?: string;
}

export interface TripWithParticipants extends Trip {
  participants: TripParticipant[];
  currentUserRole?: TripParticipantRole;
}

export interface ExpenseWithShares extends Expense {
  shares: ExpenseShare[];
}

export interface TripBudgetSummary {
  totalSpent: number;
  budgetLimit?: number;
  budgetRemaining?: number;
  percentUsed?: number;
  expenseCount: number;
  participantCount: number;
  averagePerPerson: number;
}

// Helper type for expense categories
export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Accommodation',
  'Activities',
  'Shopping',
  'Other',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

// Currency options (MVP: just show common ones)
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
] as const;
