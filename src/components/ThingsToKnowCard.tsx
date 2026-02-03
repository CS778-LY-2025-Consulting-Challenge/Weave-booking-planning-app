'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Lightbulb, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TipCategory {
  category: string;
  emoji: string;
  importance: 'Critical' | 'Important' | 'Good to Know';
  subtitle?: string;
  tips: string[];
}

interface QuickFacts {
  currency?: string;
  language?: string;
  electricity?: string;
  timeZone?: string;
}

interface DestinationTipsData {
  destination: string;
  categories: TipCategory[];
  quickFacts?: QuickFacts;
  lastUpdated: string;
}

interface ThingsToKnowCardProps {
  destination: string;
  userOrigin?: string;
}

export default function ThingsToKnowCard({ destination, userOrigin }: ThingsToKnowCardProps) {
  const [tipsData, setTipsData] = useState<DestinationTipsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchTipsData = async (forceRefresh = false) => {
    if (!destination) return;

    setIsLoading(true);
    setError('');
    setTipsData(null); // Clear old data when fetching new destination

    try {
      const response = await fetch('/api/destination-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, userOrigin, forceRefresh }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch destination tips');
      }

      const data = await response.json();
      setTipsData(data);
    } catch (err: any) {
      console.error('[ThingsToKnowCard] Error:', err);
      setError(err.message || 'Failed to load destination information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTipsData(false); // Normal fetch from cache
  }, [destination, userOrigin, refreshTrigger]);

  const handleRefresh = () => {
    fetchTipsData(true); // Force refresh bypasses cache
  };

  const getImportanceStyle = (importance: string) => {
    switch (importance) {
      case 'Critical':
        return 'text-red-700 font-semibold';
      case 'Important':
        return 'text-orange-700 font-semibold';
      case 'Good to Know':
        return 'text-slate-700 font-semibold';
      default:
        return 'text-slate-700 font-semibold';
    }
  };

  if (!destination) return null;

  return (
    <Card className="border-0 bg-white shadow-2xl shadow-slate-200/50 rounded-3xl pt-3 pb-3 overflow-hidden">
      <CardHeader className="pb-0.5 pt-0 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-base font-bold">Things to Know</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 w-8 p-0 rounded-xl hover:bg-slate-100"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 rounded-xl hover:bg-slate-100"
            >
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3 pt-2 pb-1 px-8">
          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <div className="text-center space-y-2">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-amber-500" />
                <p className="text-sm text-slate-500">Gathering essential travel information...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!isLoading && !error && tipsData && (
            <>
              {/* Destination Title */}
              <div className="mb-5 pb-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {destination}: Essential Travel Insights
                </h3>
              </div>

              {/* Categories - Clean List Format */}
              <div className="space-y-5">
                {tipsData.categories.map((category, idx) => (
                  <div key={idx} className="space-y-3">
                    {/* Category Header with Emoji */}
                    <div className="flex items-start gap-3">
                      <span className="text-2xl leading-none mt-0.5">{category.emoji}</span>
                      <div className="flex-1">
                        <h4 className={`text-sm font-bold ${getImportanceStyle(category.importance)}`}>
                          {category.category}
                          {category.subtitle && (
                            <span className="text-slate-600 font-normal ml-1.5">
                              {category.subtitle}
                            </span>
                          )}
                        </h4>
                        <span className="inline-block mt-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {category.importance}
                        </span>
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <ul className="space-y-2.5 pl-10">
                      {category.tips.map((tip, tipIdx) => (
                        <li key={tipIdx} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                          <span className="flex-shrink-0 mt-2 h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                          <span dangerouslySetInnerHTML={{ __html: tip }} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Footer Note */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 text-center">
                  AI-generated insights • Last updated {new Date(tipsData.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
