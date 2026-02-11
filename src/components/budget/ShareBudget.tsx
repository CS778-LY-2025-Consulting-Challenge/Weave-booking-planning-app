'use client';

import { useState } from 'react';
import { createInvite } from '@/services/budgetService';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Share2, Plus, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface ShareBudgetProps {
    budgetId: string;
    budgetName: string;
}

export default function ShareBudget({ budgetId, budgetName }: ShareBudgetProps) {
    const { user } = useUser();
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCreateInvite = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Use Server Action to bypass client-side permission issues
            const { createInviteAction } = await import('@/app/actions/budgetActions');
            const result = await createInviteAction(
                budgetId,
                budgetName,
                user.id,
                user.fullName || 'A friend',
                7 // Default 7 days
            );

            if (result.success && (result as any).invite) {
                setInviteCode((result as any).invite.inviteCode);
                toast.success('Invite link created!');
            } else {
                throw new Error((result as any).error || 'Unknown server error');
            }
        } catch (error: any) {
            console.error("Failed to create invite:", error);
            toast.error('Failed to create invite link: ' + (error?.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const getInviteLink = (code: string) => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return `${origin}/join/${code}`;
    };

    const handleEmailShare = () => {
        if (!inviteCode) return;
        const link = getInviteLink(inviteCode);
        const subject = encodeURIComponent(`Join me on Weave: ${budgetName}`);
        const body = encodeURIComponent(`Hey,\n\nI've created a shared budget "${budgetName}" on Weave for our upcoming trip. Join me to track our expenses together!\n\nClick here to join:\n${link}\n\nSee you there!`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        toast.success('Opening email client...');
    };

    return (
        <Card className="border-dashed border-2 bg-gray-50/50">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-blue-600" />
                    Share Budget
                </CardTitle>
                <CardDescription>Invite friends to track expenses with you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!inviteCode ? (
                    <Button onClick={handleCreateInvite} disabled={loading} className="w-full">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        Create Invite Link
                    </Button>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Invite Code</Label>
                            <div className="flex gap-2">
                                <div className="bg-white border rounded-md px-3 py-2 font-mono text-lg font-bold tracking-wider text-center flex-1">
                                    {inviteCode}
                                </div>
                                <Button variant="outline" size="icon" onClick={() => copyToClipboard(inviteCode)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Share Link</Label>
                            <div className="flex gap-2">
                                <Input readOnly value={getInviteLink(inviteCode)} className="bg-white" />
                                <Button variant="outline" size="icon" onClick={() => copyToClipboard(getInviteLink(inviteCode))}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Button
                            variant="secondary"
                            className="w-full gap-2 border bg-white hover:bg-gray-50 text-gray-700"
                            onClick={handleEmailShare}
                        >
                            <Mail className="h-4 w-4" />
                            Send via Email
                        </Button>

                        <p className="text-xs text-gray-500 text-center">
                            Link valid for 7 days
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
