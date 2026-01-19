"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EXPENSE_CATEGORIES } from "@/types/expense";

interface AddExpenseDialogProps {
    tripId: string;
    participants: any[];
    currentUserId: string;
    onExpenseAdded: () => void;
    trigger?: React.ReactNode;
}

export function AddExpenseDialog({
    tripId,
    participants,
    currentUserId,
    onExpenseAdded,
    trigger,
}: AddExpenseDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState<Date>(new Date());

    // Split state
    const [splitWith, setSplitWith] = useState<string[]>(
        participants.map((p) => p.userId)
    );

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const amountStr = formData.get("amount") as string;
        const description = formData.get("description") as string;
        const category = formData.get("category") as string;
        const paidBy = formData.get("paidBy") as string;

        // Convert amount to cents
        const amount = Math.round(parseFloat(amountStr) * 100);

        try {
            const res = await fetch(`/api/trips/${tripId}/expenses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    description,
                    amount,
                    currency: "USD", // MVP default
                    date,
                    category,
                    paidByUserId: paidBy,
                    splitWith,
                }),
            });

            if (!res.ok) throw new Error("Failed to add expense");

            toast.success("Expense added successfully");
            setOpen(false);
            onExpenseAdded();

            // Reset form if needed, though closing resets visually
        } catch (error) {
            console.error(error);
            toast.error("Failed to add expense");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSplit = (userId: string) => {
        if (splitWith.includes(userId)) {
            setSplitWith(splitWith.filter((id) => id !== userId));
        } else {
            setSplitWith([...splitWith, userId]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>Add Expense</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                    <DialogDescription>
                        Enter expense details to split with the group.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" name="description" placeholder="e.g. Dinner at Mario's" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <Input id="amount" name="amount" type="number" min="0.01" step="0.01" className="pl-7" placeholder="0.00" required />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select name="category" defaultValue="Food & Dining">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EXPENSE_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(d) => d && setDate(d)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="paidBy">Paid By</Label>
                            <Select name="paidBy" defaultValue={currentUserId}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {participants.map((p) => (
                                        <SelectItem key={p.userId} value={p.userId}>
                                            {p.name || p.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Split With</Label>
                        <div className="space-y-2 border rounded-md p-3">
                            <div className="flex items-center space-x-2 pb-2 border-b">
                                <Checkbox
                                    id="all"
                                    checked={splitWith.length === participants.length}
                                    onCheckedChange={(checked) => {
                                        if (checked) setSplitWith(participants.map(p => p.userId));
                                        else setSplitWith([]);
                                    }}
                                />
                                <label
                                    htmlFor="all"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Everyone
                                </label>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                {participants.map((p) => (
                                    <div key={p.userId} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`split-${p.userId}`}
                                            checked={splitWith.includes(p.userId)}
                                            onCheckedChange={() => handleToggleSplit(p.userId)}
                                        />
                                        <label
                                            htmlFor={`split-${p.userId}`}
                                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate"
                                        >
                                            {p.name || p.email}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Expense
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
