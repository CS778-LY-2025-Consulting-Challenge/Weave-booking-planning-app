'use client';

import { useState } from 'react';
import { addExpense } from '@/services/budgetService';
import { Participant } from '@/types/budget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddExpenseFormProps {
    budgetId: string;
    participants: Participant[];
    currentUserId: string;
    onSuccess?: () => void;
}

export default function AddExpenseForm({ budgetId, participants, currentUserId, onSuccess }: AddExpenseFormProps) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState(currentUserId);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !paidBy) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            // Use Server Action to bypass client side rules
            const { addExpenseAction } = await import('@/app/actions/budgetActions');
            const result = await addExpenseAction(budgetId, {
                budgetId,
                description,
                amount: parseFloat(amount),
                currency: 'USD',
                paidBy,
                date: new Date().toISOString(),
                splitType: 'equal',
                splits: [],
                createdBy: currentUserId,
            });

            if (result.success) {
                toast.success('Expense added');
                setDescription('');
                setAmount('');
                setPaidBy(currentUserId);

                // Force router refresh to update server components
                if (typeof window !== 'undefined') {
                    window.location.reload();
                }

                if (onSuccess) onSuccess();
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to add expense: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold text-lg">Add Expense</h3>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                    id="description"
                    placeholder="e.g. Dinner at Mario's"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="paidBy">Paid By</Label>
                    <Select value={paidBy} onValueChange={setPaidBy}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select who paid" />
                        </SelectTrigger>
                        <SelectContent>
                            {participants.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.name} {p.id === currentUserId ? '(You)' : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Expense
            </Button>
        </form>
    );
}
