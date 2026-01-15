import {
  Expense,
  ExpenseShare,
  Settlement,
  TripParticipant,
  UserBalance,
} from '@/types/expense';

/**
 * Calculate balances for all participants in a trip
 * Balance = Total Paid - Total Owed
 * Positive balance = they are owed money
 * Negative balance = they owe money
 */
export function calculateBalances(
  participants: TripParticipant[],
  expenses: Expense[],
  expenseShares: ExpenseShare[]
): UserBalance[] {
  const balances: Map<string, UserBalance> = new Map();

  // Initialize balances for all participants
  participants.forEach((participant) => {
    balances.set(participant.userId, {
      userId: participant.userId,
      userName: participant.userName,
      userEmail: participant.userEmail,
      totalPaid: 0,
      totalOwed: 0,
      balance: 0,
    });
  });

  // Calculate total paid by each user
  expenses
    .filter((expense) => expense.status === 'active')
    .forEach((expense) => {
      const userBalance = balances.get(expense.paidByUserId);
      if (userBalance) {
        userBalance.totalPaid += expense.amount;
      }
    });

  // Calculate total owed by each user
  expenseShares.forEach((share) => {
    const userBalance = balances.get(share.userId);
    if (userBalance) {
      userBalance.totalOwed += share.shareAmount;
    }
  });

  // Calculate net balance
  balances.forEach((balance) => {
    balance.balance = balance.totalPaid - balance.totalOwed;
  });

  return Array.from(balances.values());
}

/**
 * Generate simplified settlement payments
 * This uses a greedy algorithm to minimize number of transactions
 */
export function calculateSettlements(balances: UserBalance[]): Settlement[] {
  const settlements: Settlement[] = [];

  // Separate creditors (owed money) and debtors (owe money)
  const creditors = balances
    .filter((b) => b.balance > 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.balance - a.balance);

  const debtors = balances
    .filter((b) => b.balance < 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.balance - b.balance);

  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

    if (amount > 0) {
      settlements.push({
        from: {
          userId: debtor.userId,
          userName: debtor.userName,
        },
        to: {
          userId: creditor.userId,
          userName: creditor.userName,
        },
        amount: Math.round(amount), // Round to avoid floating point issues
      });
    }

    creditor.balance -= amount;
    debtor.balance += amount;

    if (Math.abs(creditor.balance) < 1) i++;
    if (Math.abs(debtor.balance) < 1) j++;
  }

  return settlements;
}

/**
 * Calculate expense shares for equal split
 */
export function calculateEqualShares(
  expense: Expense,
  participantIds: string[],
  participants: TripParticipant[]
): Omit<ExpenseShare, 'id' | 'createdAt'>[] {
  const shareAmount = Math.floor(expense.amount / participantIds.length);
  const remainder = expense.amount % participantIds.length;

  return participantIds.map((userId, index) => {
    const participant = participants.find((p) => p.userId === userId);
    // Distribute remainder cents to first N people
    const adjustedShare = shareAmount + (index < remainder ? 1 : 0);

    return {
      expenseId: expense.id,
      userId,
      userName: participant?.userName || 'Unknown',
      shareAmount: adjustedShare,
      isPaid: false,
    };
  });
}

/**
 * Format currency amount (cents to display)
 */
export function formatCurrency(
  amountInCents: number,
  currencyCode: string = 'USD'
): string {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}

/**
 * Convert currency amount to cents
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert cents to currency amount
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Get currency symbol from code
 */
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    INR: '₹',
  };
  return symbols[currencyCode] || currencyCode;
}

/**
 * Validate expense split participants
 */
export function validateSplitParticipants(
  splitWith: string[],
  participants: TripParticipant[]
): { valid: boolean; error?: string } {
  if (splitWith.length === 0) {
    return { valid: false, error: 'Must select at least one person to split with' };
  }

  const participantIds = participants.map((p) => p.userId);
  const invalidIds = splitWith.filter((id) => !participantIds.includes(id));

  if (invalidIds.length > 0) {
    return { valid: false, error: 'Some selected users are not trip participants' };
  }

  return { valid: true };
}
