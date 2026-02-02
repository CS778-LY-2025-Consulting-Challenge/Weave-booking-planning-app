'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { subscribeToBudget, subscribeToExpenses, createBudget, getBudgetByTripId } from '@/services/budgetService';
import { getUserProfile } from '@/lib/userProfile';
import { calculateBalances } from '@/utils/balanceCalculator';
import { Budget, Expense, Participant, Balance } from '@/types/budget';
import AddExpenseForm from '@/components/budget/AddExpenseForm';
import ExpenseList from '@/components/budget/ExpenseList';
import BalanceSummary from '@/components/budget/BalanceSummary';
import ShareBudget from '@/components/budget/ShareBudget';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Share2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface BudgetViewProps {
    budgetId?: string; // Existing budget ID
    tripId?: string;   // Or Trip ID to find/create budget
    tripName?: string; // For auto-creation
    initialBudget?: Budget | null; // SSR Data
    initialExpenses?: Expense[];   // SSR Data
    serverError?: string;
}

export default function BudgetView({
    budgetId: initialBudgetId,
    tripId,
    tripName,
    initialBudget,
    initialExpenses,
    serverError
}: BudgetViewProps) {
    const { user } = useUser();

    // Use initial data if provided
    const [budget, setBudget] = useState<Budget | null>(initialBudget || null);
    const [expenses, setExpenses] = useState<Expense[]>(initialExpenses || []);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [balances, setBalances] = useState<Record<string, Balance>>({});

    // Only loading if we don't have initial data AND we need to fetch
    const [loading, setLoading] = useState(!initialBudget && !initialExpenses);

    const [activeBudgetId, setActiveBudgetId] = useState<string | null>(initialBudgetId || null);
    const [creating, setCreating] = useState(false);

    // If we have a tripId but no budgetId, fetch the budget for this trip
    useEffect(() => {
        if (activeBudgetId) return;
        if (!tripId) return;

        const fetchBudget = async () => {
            try {
                const budget = await getBudgetByTripId(tripId);
                if (budget) {
                    setActiveBudgetId(budget.id);
                } else {
                    setLoading(false); // No budget found, show create state
                }
            } catch (err) {
                console.error("Error fetching budget by tripId:", err);
                setLoading(false);
            }
        };

        fetchBudget();
    }, [tripId, activeBudgetId]);

    // Subscribe to Budget and Expenses
    useEffect(() => {
        if (!activeBudgetId) {
            if (initialBudgetId) setActiveBudgetId(initialBudgetId);
            else setLoading(false);
            return;
        }

        console.log('[BudgetView] Subscribing to budget ID:', activeBudgetId);
        console.log('[BudgetView] Current User:', user?.id);

        // RTDB Migration: Client-side subscriptions disabled for now.
        // We rely on Server Side Rendering (SSR) and manual page refreshes (handled by AddExpenseForm).
        // TODO: Implement RTDB client-side listeners if real-time is needed later.
        setLoading(false);
        /* 
        const unsubscribeBudget = subscribeToBudget(activeBudgetId, (data) => { ... });
        const unsubscribeExpenses = subscribeToExpenses(activeBudgetId, (data) => { ... });
        return () => { unsubscribeBudget(); unsubscribeExpenses(); };
        */
    }, [activeBudgetId, initialBudgetId]);

    // Fetch Participant Details when budget loads
    useEffect(() => {
        if (!budget) return;

        const fetchParticipants = async () => {
            try {
                const promises = budget.participants.map(async (uid) => {
                    const profile = await getUserProfile(uid);
                    return {
                        id: uid,
                        name: profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : 'Unknown User',
                        email: profile?.email,
                        photoURL: ''
                    } as Participant;
                });

                const results = await Promise.all(promises);
                setParticipants(results);
            } catch (err) {
                console.error("Failed to fetch participants", err);
            }
        };

        fetchParticipants();
    }, [budget]);

    // Calculate Balances
    useEffect(() => {
        if (participants.length > 0) {
            const newBalances = calculateBalances(expenses, participants);
            setBalances(newBalances);
        }
    }, [expenses, participants]);

    const handleCreateBudgetForTrip = async () => {
        if (!user || !tripId) return;
        setCreating(true);
        try {
            const name = tripName ? `${tripName} Budget` : 'Trip Budget';
            const newId = await createBudget(name, user.id, [], 'USD', tripId);
            setActiveBudgetId(newId);
            toast.success('Budget created for this trip!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to create budget');
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // State: No Budget Found/Linked
    if (!activeBudgetId && !budget) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="bg-blue-100 p-4 rounded-full">
                    <Share2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">No budget set up yet</h3>
                <p className="text-gray-500 max-w-sm text-center">Start tracking expenses for this trip by creating a shared budget.</p>
                <Button onClick={handleCreateBudgetForTrip} disabled={creating}>
                    {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Create Trip Budget
                </Button>
            </div>
        );
    }

    if (!budget) {
        return (
            <div className="p-8 text-center text-red-500">Budget not found</div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{budget.name}</h2>
                    <p className="text-gray-500">
                        {participants.length} Participant{participants.length !== 1 ? 's' : ''} • {responseTotal(expenses, budget.currency)}
                    </p>
                </div>
                {/* Share Button could go here or inside tabs */}
            </div>

            <Tabs defaultValue="expenses" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                    <TabsTrigger value="expenses">Expenses</TabsTrigger>
                    <TabsTrigger value="balances">Balances</TabsTrigger>
                </TabsList>

                <TabsContent value="expenses" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 space-y-6">
                            <AddExpenseForm
                                budgetId={budget.id}
                                participants={participants}
                                currentUserId={user?.id || ''}
                            />
                            <ShareBudget
                                budgetId={budget.id}
                                budgetName={budget.name}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ExpenseList
                                        expenses={expenses}
                                        participants={participants}
                                        currentUserId={user?.id || ''}
                                        budgetId={budget.id}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="balances">
                    <BalanceSummary
                        balances={balances}
                        participants={participants}
                        currentUserId={user?.id || ''}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function responseTotal(expenses: Expense[], currency: string = 'USD') {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(total);
}
