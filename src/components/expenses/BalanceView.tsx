"use client";

import { useState } from "react";
import { ArrowRight, CheckCheck, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface BalanceViewProps {
    balances: any[];
    settlements: any[];
    participants: any[];
    currentUserId: string;
}

export function BalanceView({ balances, settlements, participants, currentUserId }: BalanceViewProps) {
    const [showSimplified, setShowSimplified] = useState(true);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(Math.abs(amount) / 100);
    };

    const getUserName = (userId: string) => {
        if (userId === currentUserId) return "You";
        const p = participants.find(p => p.userId === userId);
        return p?.name || "Unknown";
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Group Balances</h3>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="simplify-mode" className="text-sm">Simplified Debts</Label>
                    <Switch
                        id="simplify-mode"
                        checked={showSimplified}
                        onCheckedChange={setShowSimplified}
                    />
                </div>
            </div>

            {showSimplified ? (
                <div className="space-y-4">
                    {settlements.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground flex flex-col items-center">
                            <CheckCheck className="h-10 w-10 text-green-500 mb-2" />
                            <p>Everything is settled up!</p>
                        </div>
                    ) : (
                        settlements.map((settlement, idx) => (
                            <Card key={idx} className="bg-muted/20">
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs">{getUserName(settlement.from.userId).substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{getUserName(settlement.from.userId)}</span>
                                    </div>

                                    <div className="flex flex-col items-center px-4">
                                        <span className="text-xs text-muted-foreground mb-1">pays</span>
                                        <div className="flex items-center text-muted-foreground">
                                            <span className="h-[1px] w-8 bg-border"></span>
                                            <ArrowRight className="h-4 w-4 mx-1" />
                                            <span className="h-[1px] w-8 bg-border"></span>
                                        </div>
                                        <span className="font-bold text-sm mt-1">{formatCurrency(settlement.amount)}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{getUserName(settlement.to.userId)}</span>
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs">{getUserName(settlement.to.userId).substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {balances.map((balance) => (
                        <Card key={balance.userId}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{balance.userName.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{balance.userId === currentUserId ? "You" : balance.userName}</p>
                                        {balance.balance !== 0 && (
                                            <p className={cn("text-sm", balance.balance > 0 ? "text-green-600" : "text-red-600")}>
                                                {balance.balance > 0 ? "gets back" : "owes"} {formatCurrency(balance.balance)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {balance.balance > 0 ? (
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                ) : balance.balance < 0 ? (
                                    <TrendingDown className="h-5 w-5 text-red-500" />
                                ) : (
                                    <CheckCheck className="h-5 w-5 text-muted-foreground" />
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
