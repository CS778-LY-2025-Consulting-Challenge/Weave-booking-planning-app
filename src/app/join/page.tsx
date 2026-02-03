'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Search } from 'lucide-react';

export default function JoinPage() {
    const router = useRouter();
    const [code, setCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim().length === 6) {
            router.push(`/join/${code.trim().toUpperCase()}`);
        }
    };

    return (
        <div className="container mx-auto flex items-center justify-center min-h-[60vh] px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
                        <Search className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">Join a Budget</CardTitle>
                    <CardDescription>Enter the 6-character code shared with you</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            placeholder="e.g. TRIP26"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            maxLength={6}
                            className="text-center text-2xl tracking-widest uppercase py-6"
                        />
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={code.length !== 6}
                        >
                            Find Budget
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
