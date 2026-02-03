'use client';

import { Expense, Participant } from '@/types/budget';
import { formatCurrency } from '@/utils/balanceCalculator';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ExpenseListProps {
    expenses: Expense[];
    participants: Participant[];
    currentUserId: string;
    budgetId: string;
}

import { useRouter } from 'next/navigation';

export default function ExpenseList({ expenses, participants, currentUserId, budgetId }: ExpenseListProps) {
    const router = useRouter();

    const getParticipantName = (id: string) => {
        const p = participants.find(p => p.id === id);
        return p ? p.name : 'Unknown';
    };

    const handleDelete = async (expenseId: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;
        try {
            const { deleteExpenseAction } = await import('@/app/actions/budgetActions');
            const result = await deleteExpenseAction(budgetId, expenseId);

            if (result.success) {
                toast.success('Expense deleted');
                router.refresh();
            } else {
                toast.error((result as any).error || 'Failed to delete expense');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete expense');
        }
    };

    if (expenses.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No expenses yet. Add one to get started!
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {expenses.map((expense) => (
                <Card key={expense.id} className="overflow-hidden">
                    <CardContent className="p-4 flex justify-between items-center sm:items-start sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold text-gray-900">{expense.description}</h4>
                                <div className="text-xs text-gray-500 whitespace-nowrap">
                                    {format(new Date(expense.date), 'MMM d, yyyy')}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium text-gray-900">{getParticipantName(expense.paidBy)}</span> paid <span className="font-bold text-gray-900">{formatCurrency(expense.amount, expense.currency)}</span>
                            </p>
                        </div>
                        {expense.createdBy === currentUserId && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                onClick={() => handleDelete(expense.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
