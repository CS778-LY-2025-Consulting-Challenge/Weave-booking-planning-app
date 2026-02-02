'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { getUserBudgets } from '@/services/budgetService';
import { Budget } from '@/types/budget';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Plus, Wallet, ArrowRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function BudgetListPage() {
    const { user, isLoaded } = useUser();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            getUserBudgets(user.id)
                .then(setBudgets)
                .finally(() => setLoading(false));
        } else if (isLoaded && !user) {
            setLoading(false);
        }
    }, [user, isLoaded]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 pt-24 pb-8 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Budgets</h1>
                    <p className="text-gray-500 mt-1">Track shared expenses for your trips</p>
                </div>

                <Link href="/budget/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Budget
                    </Button>
                </Link>
            </div>

            {!user ? (
                <Card className="bg-gray-50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <Wallet className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign in to manage budgets</h3>
                        <p className="text-gray-500 mb-6">Create shared budgets and track expenses with friends.</p>
                        <Link href="/sign-in">
                            <Button variant="outline">Sign In</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : budgets.length === 0 ? (
                <Card className="bg-gray-50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <Wallet className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No budgets yet</h3>
                        <p className="text-gray-500 mb-6">Create your first budget to start tracking expenses.</p>
                        <Link href="/budget/new">
                            <Button>Create New Budget</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.map((budget) => (
                        <Link key={budget.id} href={`/budget/${budget.id}`}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-gray-200">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="truncate pr-4">{budget.name}</CardTitle>
                                        <ArrowRight className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <CardDescription>
                                        Created {budget.createdAt ? format(new Date(budget.createdAt.seconds ? budget.createdAt.seconds * 1000 : budget.createdAt), 'MMM d, yyyy') : 'Recently'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <Wallet className="h-4 w-4" />
                                        {budget.participants.length} Participant{budget.participants.length !== 1 ? 's' : ''}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
