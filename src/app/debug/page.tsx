'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { toast } from 'sonner';

export default function DebugPage() {
    const [invites, setInvites] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('Ready');

    useEffect(() => {
        const fetchInvites = async () => {
            try {
                const q = query(
                    collection(firestore, 'invites'),
                    orderBy('createdAt', 'desc'),
                    limit(20)
                );
                const snap = await getDocs(q);
                console.log('Debug Page Docs:', snap.docs.length);
                setInvites(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            }
        };
        fetchInvites();
    }, []);

    const handleTestRead = async () => {
        setStatus('Testing Read...');
        try {
            const q = query(collection(firestore, 'invites'), limit(1));
            await getDocs(q);
            setStatus('Read Success!');
            alert('Read Connected!');
        } catch (err: any) {
            console.error(err);
            setStatus('Read Failed: ' + err.message);
        }
    };

    const handleTestWrite = async () => {
        setStatus('Testing Write (Client)...');
        try {
            console.log('Testing write permission...');

            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Write Timed Out (Likely Connection or Rules Blocked)')), 5000)
            );

            // Race the write against the timeout
            const testRef = await Promise.race([
                addDoc(collection(firestore, 'debug_tests'), {
                    timestamp: serverTimestamp(),
                    message: 'Hello from debug page',
                    test: true
                }),
                timeoutPromise
            ]) as any;

            console.log('Write success, ID:', testRef.id);
            setStatus('Write Success! ID: ' + testRef.id);
            alert('Write Success! Permissions are good.');
        } catch (err: any) {
            console.error('Write failed:', err);
            const msg = err.message || 'Unknown error';
            setStatus('Write Failed: ' + msg);
            alert('Write Failed: ' + msg);
        }
    };

    const handleTestServer = async () => {
        setStatus('Testing Server Connection...');
        try {
            const { debugServerConnectionAction } = await import('@/app/actions/budgetActions');
            const result = await debugServerConnectionAction();
            if (result.success) {
                setStatus(`Server Connected! Collections: ${result.collections?.join(', ') || 'None'}`);
                toast.success('Server Connection OK');
            } else {
                setStatus(`Server Failed: ${result.error}`);
                toast.error('Server Connection Failed');
            }
        } catch (error: any) {
            setStatus('Server Action Failed: ' + error.message);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Debug Panel</h1>
            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
                    Error: {error}
                </div>
            )}

            <div className="bg-white p-4 rounded shadow space-y-4">
                <h2 className="font-semibold">Connectivity Status: <span className="text-blue-600">{status}</span></h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <Button onClick={handleTestRead} variant="outline" className="w-full">
                        Test Read
                    </Button>
                    <Button onClick={handleTestWrite} variant="outline" className="w-full">
                        Test Write (Client)
                    </Button>
                    <Button onClick={handleTestServer} className="w-full">
                        Test Server Connection
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {invites.map(invite => (
                    <Card key={invite.id}>
                        <CardHeader>
                            <CardTitle>{invite.inviteCode}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                                {JSON.stringify(invite, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
