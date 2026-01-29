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

  useEffect(() => {
    fetchSignals();
  }, [tripId]);

  const fetchSignals = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/ugc-signals/generate?tripId=${tripId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch signals');
      }

      const data = await response.json();
      setSignals(data.signals || []);
    } catch (error) {
      console.error('Error fetching signals:', error);
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
        {/* High Priority Signals */}
        {highPrioritySignals.length > 0 && (
          <div className="space-y-2">
            {highPrioritySignals.map((signal, index) => (
              <SignalCard key={signal.id} signal={signal} index={index} />
            ))}
          </div>
        )}

        {/* Other Signals */}
        {otherSignals.length > 0 && (
          <div className="space-y-2">
            {otherSignals.map((signal, index) => (
              <SignalCard key={signal.id} signal={signal} index={index + highPrioritySignals.length} />
            ))}
          </div>
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
