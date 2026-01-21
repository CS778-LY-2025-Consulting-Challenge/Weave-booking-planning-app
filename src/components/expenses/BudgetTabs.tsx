"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseList } from "./ExpenseList";
import { BalanceView } from "./BalanceView";
import { Loader2 } from "lucide-react";

interface BudgetTabsProps {
    tripId: string;
    expenses: any[];
    participants: any[];
    currentUserId: string;
}

export function BudgetTabs({ tripId, expenses, participants, currentUserId }: BudgetTabsProps) {
    const [balances, setBalances] = useState<any[]>([]);
    const [settlements, setSettlements] = useState<any[]>([]);
    const [loadingBalances, setLoadingBalances] = useState(false);

    // Fetch balances when tab changes to "balances" or on mount
    const fetchBalances = async () => {
        setLoadingBalances(true);
        try {
            const res = await fetch(`/api/trips/${tripId}/balances`);
            if (res.ok) {
                const data = await res.json();
                setBalances(data.balances);
                setSettlements(data.settlements);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingBalances(false);
        }
    };

    return (
        <Tabs defaultValue="expenses" className="w-full" onValueChange={(val) => {
            if (val === "balances") fetchBalances();
        }}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="balances">Balances & Settle Up</TabsTrigger>
            </TabsList>
            <TabsContent value="expenses" className="mt-4">
                <ExpenseList
                    expenses={expenses}
                    participants={participants}
                    currentUserId={currentUserId}
                />
            </TabsContent>
            <TabsContent value="balances" className="mt-4">
                {loadingBalances ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <BalanceView
                        balances={balances}
                        settlements={settlements}
                        participants={participants}
                        currentUserId={currentUserId}
                    />
                )}
            </TabsContent>
        </Tabs>
    );
}
