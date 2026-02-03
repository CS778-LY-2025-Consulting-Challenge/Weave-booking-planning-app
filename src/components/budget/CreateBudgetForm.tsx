'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBudget } from '@/services/budgetService';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateBudgetForm() {
    const router = useRouter();
    const { user } = useUser();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !user?.id) return;

        setLoading(true);
        try {
            // Use Server Action to bypass client-side permission issues
            const { createBudgetAction } = await import('@/app/actions/budgetActions');
            const result = await createBudgetAction(name, user.id);

            if (result.success && result.budgetId) {
                console.log('[CreateBudget] Success, ID:', result.budgetId);
                toast.success('Budget created successfully!');
                router.push(`/budget/${result.budgetId}`);
            } else {
                throw new Error(result.error || 'Unknown server error');
            }
        } catch (error: any) {
            console.error('[CreateBudget] Error:', error);
            toast.error('Failed to create budget: ' + (error?.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Create New Budget</CardTitle>
                <CardDescription>Start tracking expenses for your trip or group.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Budget Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Europe Trip 2026"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create Budget
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
