'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { joinBudgetWithInvite, getInviteByCode } from '@/services/budgetService';
import { useUser, SignInButton } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, UserPlus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Invite } from '@/types/budget';

export default function JoinBudgetProcess() {
    const { inviteCode } = useParams();
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const [loading, setLoading] = useState(true);
    const [invite, setInvite] = useState<Invite | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [joining, setJoining] = useState(false);

    // 1. Fetch Invite Details (Even if not logged in)
    useEffect(() => {
        const fetchInvite = async () => {
            if (!inviteCode || typeof inviteCode !== 'string') {
                setError('Invalid invite link');
                setLoading(false);
                return;
            }

            try {
                console.log('[JoinPage] Fetching invite (Server Action):', inviteCode);

                // Use Server Action to bypass client-side permission issues
                const { getInviteByCodeAction } = await import('@/app/actions/budgetActions');
                const result = await getInviteByCodeAction(inviteCode);

                console.log('[JoinPage] Result:', result);

                if (result.success && (result as any).invite) {
                    setInvite((result as any).invite);
                } else {
                    const errorMsg = (result as any).error;
                    console.warn('[JoinPage] Invite not found or error:', errorMsg);
                    setError(errorMsg || 'Invite code not found');
                }
            } catch (err: any) {
                console.error('[JoinPage] Error loading invite:', err);
                setError('Failed to load invite: ' + (err.message || 'Unknown error'));
            } finally {
                setLoading(false);
            }
        };

        fetchInvite();
    }, [inviteCode]);

    const handleJoin = async () => {
        if (!user || !inviteCode || typeof inviteCode !== 'string') return;

        setJoining(true);
        try {
            // Use Server Action to join
            const { joinBudgetAction } = await import('@/app/actions/budgetActions');
            const result = await joinBudgetAction(inviteCode, user.id);

            if (result.success && (result as any).budgetId) {
                toast.success((result as any).message || 'Successfully joined budget');
                router.push(`/budget/${(result as any).budgetId}`);
            } else {
                const errorMsg = (result as any).error || 'Failed to join';
                toast.error(errorMsg);
                setError(errorMsg);
            }
        } catch (err) {
            console.error(err);
            toast.error('Unexpected error while joining');
        } finally {
            setJoining(false);
        }
    };

    if (loading || !isLoaded) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Error State
    if (error || !invite) {
        return (
            <div className="container mx-auto flex items-center justify-center min-h-[60vh] px-4">
                <Card className="w-full max-w-md border-red-200 bg-red-50">
                    <CardContent className="flex flex-col items-center p-8 text-center pt-10">
                        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                        <h3 className="text-xl font-bold text-red-700 mb-2">Unavailable</h3>
                        <p className="text-red-600 mb-6">{error || "This invite link is invalid or expired."}</p>
                        <Button variant="outline" onClick={() => router.push('/budget')}>
                            Back to My Budgets
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Invite Valid - Show Join Prompt
    return (
        <div className="container mx-auto flex items-center justify-center min-h-[60vh] px-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                        <UserPlus className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">You&apos;re Invited!</CardTitle>
                    <CardDescription>
                        Join <strong>{invite.budgetName}</strong> created by {invite.createdByName}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="bg-gray-50 p-4 rounded-lg text-center border">
                        <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-1">Budget Code</p>
                        <p className="text-3xl font-mono font-bold text-gray-900">{invite.inviteCode}</p>
                    </div>

                    {!user ? (
                        <div className="text-center space-y-4">
                            <p className="text-sm text-gray-600">You need to sign in to join this budget.</p>
                            <SignInButton mode="modal">
                                <Button className="w-full" size="lg">
                                    Sign In to Join
                                </Button>
                            </SignInButton>
                        </div>
                    ) : (
                        <Button
                            className="w-full text-lg h-12"
                            onClick={handleJoin}
                            disabled={joining}
                        >
                            {joining ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                <>
                                    Join Budget
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
