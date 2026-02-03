import { Expense, Balance, Participant } from '@/types/budget';

/**
 * Calculates net balances for all participants based on expenses.
 */
export function calculateBalances(expenses: Expense[], participants: Participant[]): Record<string, Balance> {
    const balances: Record<string, Balance> = {};

    // Initialize balances for each participant
    participants.forEach(p => {
        balances[p.id] = {
            userId: p.id,
            netBalance: 0,
            owedTo: {},
            owedBy: {}
        };
    });

    // Process each expense
    expenses.forEach(expense => {
        const paidBy = expense.paidBy;
        const amount = expense.amount;

        // In MVP, we might only support 'equal' split, but handling general case
        // If splits are defined, use them. Otherwise assume equal split among all participants.
        let expenseSplits = expense.splits;

        if (!expenseSplits || expenseSplits.length === 0) {
            const splitAmount = amount / participants.length;
            expenseSplits = participants.map(p => ({
                userId: p.id,
                amount: splitAmount
            }));
        }

        // Add usage to each person's balance (they OWE this)
        // Add payment to payer's balance (they are OWED this)

        expenseSplits.forEach(split => {
            // The payer effectively "gave" this amount to the split.userId

            // If payer paid for themselves, net effect is 0.
            if (paidBy === split.userId) {
                return;
            }

            // Initialize if not exists (handling cases where participant list changes)
            if (!balances[paidBy]) {
                balances[paidBy] = { userId: paidBy, netBalance: 0, owedTo: {}, owedBy: {} };
            }
            if (!balances[split.userId]) {
                balances[split.userId] = { userId: split.userId, netBalance: 0, owedTo: {}, owedBy: {} };
            }

            // Payer gets positive balance (owed money)
            balances[paidBy].netBalance += split.amount;

            // Splitter gets negative balance (owes money)
            balances[split.userId].netBalance -= split.amount;
        });
    });

    // Optional: Simplify debts (Who pays whom)
    // This is a naive implementation. For MVP, net balance is key.
    // A proper debt simplification algorithm (like minimizing transactions) is more complex.
    // For now, we will leave owedTo/owedBy empty or simple.

    return balances;
}

/**
 * Formats a currency amount
 */
export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
    }).format(amount);
}
