import CreateBudgetForm from '@/components/budget/CreateBudgetForm';

export default function NewBudgetPage() {
    return (
        <div className="container mx-auto px-4 pt-24 pb-8">
            <h1 className="text-3xl font-bold text-center mb-8">Create New Budget</h1>
            <CreateBudgetForm />
        </div>
    );
}
