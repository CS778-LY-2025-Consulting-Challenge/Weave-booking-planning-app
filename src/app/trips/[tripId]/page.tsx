'use client';

import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import AIPlanner from '@/app/ai-planner/page';
import BudgetView from '@/components/budget/BudgetView';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Map, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function TripDashboard() {
    const params = useParams();
    const tripId = Array.isArray(params.tripId) ? params.tripId[0] : params.tripId;

    if (!tripId) {
        return <div className="p-8 text-center text-red-500">Invalid Trip ID</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navigation Header */}
            <header className="bg-white border-b sticky top-0 z-20 px-4 h-16 flex items-center shadow-sm">
                <div className="container mx-auto max-w-7xl flex items-center gap-4">
                    <Link href="/trips/saved">
                        <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                        Trip Dashboard
                    </h1>
                </div>
            </header>

            <div className="flex-1 container mx-auto max-w-7xl p-4">
                <Tabs defaultValue="itinerary" className="h-full flex flex-col">
                    <div className="flex justify-center mb-6">
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="itinerary" className="flex items-center gap-2">
                                <Map className="h-4 w-4" />
                                Itinerary
                            </TabsTrigger>
                            <TabsTrigger value="budget" className="flex items-center gap-2">
                                <Wallet className="h-4 w-4" />
                                Budget
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="itinerary" className="flex-1 mt-0 h-full">
                        {/* Embed AI Planner with tripId prop */}
                        <Card className="h-full border-0 shadow-none bg-transparent">
                            <AIPlanner tripId={tripId} />
                        </Card>
                    </TabsContent>

                    <TabsContent value="budget" className="mt-0">
                        <Card className="border-0 shadow-none bg-transparent">
                            <BudgetView tripId={tripId} />
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
