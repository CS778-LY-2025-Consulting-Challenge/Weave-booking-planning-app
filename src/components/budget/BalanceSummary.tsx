'use client';

import { Balance, Participant } from '@/types/budget';
import { formatCurrency } from '@/utils/balanceCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface BalanceSummaryProps {
    balances: Record<string, Balance>;
    participants: Participant[];
    currentUserId: string;
}

export default function BalanceSummary({ balances, participants, currentUserId }: BalanceSummaryProps) {

    const getParticipantName = (id: string) => {
        const p = participants.find(p => p.id === id);
        return p ? (p.id === currentUserId ? 'You' : p.name) : 'Unknown';
    };

    // Convert balances to list of debts (simplified for visualization)
    // Positive balance = owed money (Receiver)
    // Negative balance = owes money (Payer)

    const debtors = Object.values(balances)
        .filter(b => b.netBalance < -0.01)
        .sort((a, b) => a.netBalance - b.netBalance); // Most negative first

    const creditors = Object.values(balances)
        .filter(b => b.netBalance > 0.01)
        .sort((a, b) => b.netBalance - a.netBalance); // Most positive first

    // Simple algorithm to match debtors to creditors
    // This is purely for display "Who owes Whom" - it doesn't persist connections
    const transactions: { from: string; to: string; amount: number }[] = [];

    let i = 0; // debtor index
    let j = 0; // creditor index

    // Clone to modify
    const tempDebtors = debtors.map(d => ({ ...d }));
    const tempCreditors = creditors.map(c => ({ ...c }));

    while (i < tempDebtors.length && j < tempCreditors.length) {
        const debtor = tempDebtors[i];
        const creditor = tempCreditors[j];

        // The amount to settle is the minimum of what debtor owes and creditor is owed
        const amount = Math.min(Math.abs(debtor.netBalance), creditor.netBalance);

        transactions.push({
            from: debtor.userId,
            to: creditor.userId,
            amount: amount
        });

        debtor.netBalance += amount;
        creditor.netBalance -= amount;

        // If settled, move to next
        if (Math.abs(debtor.netBalance) < 0.01) i++;
        if (Math.abs(creditor.netBalance) < 0.01) j++;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Balances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Individual Net Balances */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Net Status</h4>
                    {Object.values(balances).map((balance) => {
                        const isPositive = balance.netBalance > 0.01;
                        const isNegative = balance.netBalance < -0.01;
                        const colorClass = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500';
                        const text = isPositive
                            ? `gets back ${formatCurrency(balance.netBalance)}`
                            : isNegative
                                ? `owes ${formatCurrency(Math.abs(balance.netBalance))}`
                                : 'settled up';

                        return (
                            <div key={balance.userId} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                                <div className="font-medium">{getParticipantName(balance.userId)}</div>
                                <div className={`font-bold ${colorClass}`}>
                                    {text}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Simplified Settlements */}
                {transactions.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Suggested Payments</h4>
                        {transactions.map((t, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{getParticipantName(t.from)}</span>
                                    <span className="text-gray-400">pays</span>
                                    <span className="font-medium">{getParticipantName(t.to)}</span>
                                </div>
                                <div className="font-bold text-gray-900">
                                    {formatCurrency(t.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {transactions.length === 0 && Object.keys(balances).length > 0 && (
                    <div className="text-center text-sm text-green-600 font-medium p-4 bg-green-50 rounded-lg">
                        All settled up!
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
