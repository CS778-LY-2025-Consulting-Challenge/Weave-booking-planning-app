import { getBudgetDetailsAction } from '@/app/actions/budgetActions';
import BudgetView from '@/components/budget/BudgetView';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
    params: {
        budgetId: string;
    };
}

export default async function BudgetDashboard({ params }: any) {
    const resolvedParams = await params;
    const { budgetId } = resolvedParams;

    console.log('[BudgetPage] Fetching budget for ID:', budgetId);

    // Fetch initial data on server to bypass client rules
    const { success, budget, expenses, error } = await getBudgetDetailsAction(budgetId);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <Link href="/budget">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
            </div>
            <BudgetView
                budgetId={budgetId}
                initialBudget={success ? budget : null}
                initialExpenses={success ? expenses : []}
                serverError={error}
            />
        </div>
    );
}
