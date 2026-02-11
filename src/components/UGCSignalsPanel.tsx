'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  AlertTriangle,
  ThumbsUp,
  Sparkles,
  TrendingUp,
  Info,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type UGCSignal = {
  id: string;
  signalType: 'positive' | 'negative' | 'suggestion';
  category: string;
  title: string;
  content: string;
  actionable: string | null;
  confidence: number;
  commentCount: number;
  priority: 'high' | 'medium' | 'low';
  impactArea: string | null;
  actionabilityScore?: number; // New field
  qualityTier?: string; // New field: 'critical' | 'high' | 'standard' | 'low'
  createdAt: string;
};

interface UGCSignalsPanelProps {
  tripId: string;
  onGenerate?: () => void;
}

const signalTypeConfig = {
  positive: {
    icon: ThumbsUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Praise',
  },
  negative: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Issue',
  },
  suggestion: {
    icon: Lightbulb,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Suggestion',
  },
};

const priorityConfig = {
  high: { color: 'bg-red-500', label: 'High Priority' },
  medium: { color: 'bg-yellow-500', label: 'Medium' },
  low: { color: 'bg-gray-400', label: 'Low' },
};

const categoryEmoji: Record<string, string> = {
  accommodation: '🏨',
  transportation: '🚗',
  food: '🍽️',
  activity: '🎯',
  timing: '⏰',
  cost: '💰',
  safety: '🛡️',
  other: '📋',
};

export default function UGCSignalsPanel({
  tripId,
  onGenerate,
}: UGCSignalsPanelProps) {
  const [signals, setSignals] = useState<UGCSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Simple client-side deduplication
  const deduplicateClientSide = (signals: UGCSignal[]) => {
    console.log('[Dedupe] Input signals:', signals.length);
    
    if (!signals || signals.length === 0) {
      return [];
    }
    
    const seen = new Map<string, UGCSignal>();
    
    for (const signal of signals) {
      if (!signal || !signal.title) {
        console.warn('[Dedupe] Invalid signal:', signal);
        continue;
      }
      
      const normalizedTitle = signal.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log('[Dedupe] Processing:', normalizedTitle);
      
      // Check for similar titles
      let isDuplicate = false;
      for (const [existingKey, existingSignal] of seen.entries()) {
        const similarity = calculateTitleSimilarity(normalizedTitle, existingKey);
        console.log(`[Dedupe] Similarity between "${normalizedTitle}" and "${existingKey}": ${similarity.toFixed(2)}`);
        
        if (similarity > 0.6) {
          isDuplicate = true;
          console.log('[Dedupe] Found duplicate!');
          // Keep the one with higher score or more comments
          if ((signal.actionabilityScore ?? 0.5) > (existingSignal.actionabilityScore ?? 0.5) ||
              signal.commentCount > existingSignal.commentCount) {
            seen.delete(existingKey);
            seen.set(normalizedTitle, signal);
            console.log('[Dedupe] Replaced with better version');
          }
          break;
        }
      }
      
      if (!isDuplicate) {
        seen.set(normalizedTitle, signal);
        console.log('[Dedupe] Added as new signal');
      }
    }
    
    const result = Array.from(seen.values());
    console.log('[Dedupe] Output signals:', result.length);
    return result;
  };

  const calculateTitleSimilarity = (str1: string, str2: string): number => {
    // Remove stop words for better matching
    const stopWords = new Set(['the', 'a', 'an', 'to', 'and', 'or', 'for', 'of', 'in', 'on', 'at']);
    
    const getKeyWords = (s: string) => 
      s.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    
    const words1 = getKeyWords(str1);
    const words2 = getKeyWords(str2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter(w => set2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  };

  useEffect(() => {
    fetchSignals();
  }, [tripId]);

  const fetchSignals = async () => {
    try {
      setLoading(true);
      console.log('[UGCSignalsPanel] Fetching signals for tripId:', tripId);
      
      const response = await fetch(
        `/api/ugc-signals/generate?tripId=${tripId}`
      );

      console.log('[UGCSignalsPanel] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[UGCSignalsPanel] Error response:', errorData);
        throw new Error(errorData.details || 'Failed to fetch signals');
      }

      const data = await response.json();
      console.log('[UGCSignalsPanel] Received data:', data);
      console.log('[UGCSignalsPanel] Signals array:', data.signals);
      console.log('[UGCSignalsPanel] Signal count:', data.signals?.length);
      
      const signalsArray = data.signals || [];
      
      if (signalsArray.length === 0) {
        console.log('[UGCSignalsPanel] No signals to deduplicate');
        setSignals([]);
        return;
      }
      
      // Client-side deduplication based on title similarity
      try {
        const deduplicatedSignals = deduplicateClientSide(signalsArray);
        console.log('[UGCSignalsPanel] After deduplication:', deduplicatedSignals.length);
        setSignals(deduplicatedSignals);
      } catch (dedupeError) {
        console.error('[UGCSignalsPanel] Deduplication error:', dedupeError);
        // Fallback: use original signals without deduplication
        setSignals(signalsArray);
      }
    } catch (error) {
      console.error('[UGCSignalsPanel] Error fetching signals:', error);
      // Don't show error toast on initial load - signals might not exist yet
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSignals = async () => {
    try {
      setGenerating(true);
      toast.info('Analyzing comments with AI...');

      const response = await fetch('/api/ugc-signals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate signals');
      }

      const data = await response.json();
      setSignals(data.signals || []);
      toast.success(data.message || 'Signals generated successfully!');
      
      if (onGenerate) {
        onGenerate();
      }
    } catch (error) {
      console.error('Error generating signals:', error);
      toast.error('Failed to generate signals');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span className="text-sm text-gray-500">Loading insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (signals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Community Insights</CardTitle>
            </div>
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              AI-Powered
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Info className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 mb-4">
              No insights generated yet. Analyze user comments to discover
              patterns and suggestions.
            </p>
            <Button
              onClick={handleGenerateSignals}
              disabled={generating}
              className="gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group signals by priority
  const highPrioritySignals = signals.filter((s) => s.priority === 'high');
  const otherSignals = signals.filter((s) => s.priority !== 'high');

  // Determine which signals to show based on showAll state
  const totalSignals = signals.length;
  const shouldShowLoadMore = totalSignals > 2 && !showAll;
  
  // When collapsed, show max 2 signals
  const displayedSignals = shouldShowLoadMore 
    ? signals.slice(0, 2)
    : signals;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Community Insights</CardTitle>
            <Badge variant="secondary">{signals.length}</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateSignals}
            disabled={generating}
            className="gap-1"
          >
            {generating ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                Refresh
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          AI-analyzed insights from {signals.reduce((sum, s) => sum + s.commentCount, 0)} user comments
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Display signals */}
        <div className="space-y-2">
          {displayedSignals.map((signal, index) => (
            <SignalCard key={signal.id} signal={signal} index={index} />
          ))}
        </div>

        {/* Load More Button */}
        {shouldShowLoadMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(true)}
            className="w-full gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          >
            <ChevronDown className="h-4 w-4" />
            Load More ({totalSignals - 2} more insights)
          </Button>
        )}

        {/* Show Less Button */}
        {showAll && totalSignals > 2 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(false)}
            className="w-full gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          >
            <ChevronUp className="h-4 w-4" />
            Show Less
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function SignalCard({ signal, index }: { signal: UGCSignal; index: number }) {
  const config = signalTypeConfig[signal.signalType];
  const Icon = config.icon;
  const priorityBadge = priorityConfig[signal.priority];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div
        className={cn(
          'p-3 rounded-lg border-l-4 transition-all hover:shadow-sm',
          config.bgColor,
          config.borderColor
        )}
      >
        <div className="flex items-start gap-3">
          <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.color)} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-medium text-gray-900">
                {categoryEmoji[signal.category] || '📋'} {signal.title}
              </span>
              <Badge
                variant="secondary"
                className={cn('h-5 text-xs', priorityBadge.color, 'text-white')}
              >
                {signal.priority.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {signal.commentCount} {signal.commentCount === 1 ? 'comment' : 'comments'}
              </Badge>
            </div>
            
            <p className="text-xs text-gray-600 mb-2">{signal.content}</p>
            
            {signal.actionable && (
              <div className="bg-white/50 p-2 rounded text-xs">
                <span className="font-medium text-gray-700">💡 Suggestion:</span>{' '}
                <span className="text-gray-600">{signal.actionable}</span>
              </div>
            )}
            
            {signal.impactArea && (
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <Info className="h-3 w-3" />
                <span>Affects: {signal.impactArea}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
