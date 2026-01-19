"use client";

import { useRouter } from "next/navigation";
import { AddExpenseDialog } from "@/components/expenses/AddExpenseDialog";

export function AddExpenseWrapper({ tripId, participants, currentUserId }: any) {
    const router = useRouter();

    return (
        <AddExpenseDialog
            tripId={tripId}
            participants={participants}
            currentUserId={currentUserId}
            onExpenseAdded={() => {
                router.refresh();
            }}
        />
    );
}
