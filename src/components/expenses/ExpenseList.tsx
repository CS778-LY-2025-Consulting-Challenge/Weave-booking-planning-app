"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Receipt, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Expense {
    id: string;
    description: string;
    amount: number;
    currency: string;
    date: string | Date;
    category: string | null;
    paidByUserId: string;
    // We handle both our manual types and Prisma types
    // Prisma expenses don't have 'paidByUserName' directly unless invited
    // but we can pass a map of users or just show ID for MVP if name missing
}

interface ExpenseListProps {
    expenses: any[]; // Using any for MVP flexibility with Prisma types
    participants: any[];
    currentUserId: string;
}

export function ExpenseList({ expenses, participants, currentUserId }: ExpenseListProps) {
    if (expenses.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <Receipt className="mx-auto h-12 w-12 opacity-50 mb-4" />
                <p>No expenses yet. Add one to get started!</p>
            </div>
        );
    }

    // Helper to get user name
    const getUserName = (userId: string) => {
        if (userId === currentUserId) return "You";
        const p = participants.find((p) => p.userId === userId);
        return p?.name || p?.email || "Unknown";
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
        }).format(amount / 100);
    };

    return (
        <div className="space-y-4">
            {expenses.map((expense) => (
                <Card key={expense.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Receipt className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium">{expense.description}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                                    {expense.category || "General"}
                                </span>
                                <span>•</span>
                                <span>{format(new Date(expense.date), "MMM d")}</span>
                                <span>•</span>
                                <span>Paid by {getUserName(expense.paidByUserId)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-lg">
                            {formatCurrency(expense.amount, expense.currency)}
                        </p>
                        {/* Split status could go here */}
                    </div>
                </Card>
            ))}
        </div>
    );
}
