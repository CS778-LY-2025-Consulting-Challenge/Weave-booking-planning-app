'use client';

import { useState, useEffect } from 'react';
import { Sparkles, X, Loader2, Check, Lightbulb, AlertCircle, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type Issue = {
  id: string;
  type: 'geographic' | 'timing' | 'signal';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  dayIndex?: number;
  activityIndex?: number;
};

type Suggestion = {
  id: string;
  issueId: string;
  type: 'reorder' | 'replace' | 'adjust' | 'add_note';
  title: string;
  description: string;
  action: {
    type: 'reorder_activities' | 'update_activity' | 'add_highlight';
    payload: any;
  };
};

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

type SignalMatch = {
  signal: UGCSignal;
  matchScore: number;
  matchReason: string;
};

type DayOptimizationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  activityTitle: string;
  activityLocation?: string;
  destination: string;
  dayPlans: any[];
  tripId?: string;
  onApplySuggestion: (suggestion: Suggestion) => void;
  onApplySignalToNote?: (content: string) => void;
};

export default function DayOptimizationDialog({
  isOpen,
  onClose,
  dayNumber,
  activityTitle,
  activityLocation,
  destination,
  dayPlans,
  tripId,
  onApplySuggestion,
  onApplySignalToNote,
}: DayOptimizationDialogProps) {
  const [isLoadingOptimizations, setIsLoadingOptimizations] = useState(false);
  const [isLoadingSignals, setIsLoadingSignals] = useState(false);
  const [optimizations, setOptimizations] = useState<{issues: Issue[], suggestions: Suggestion[]}>({ issues: [], suggestions: [] });
  const [signals, setSignals] = useState<SignalMatch[]>([]);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  // Fetch AI optimizations for the specific day
  useEffect(() => {
    if (!isOpen || !dayPlans || dayPlans.length === 0) return;

    const fetchOptimizations = async () => {
      setIsLoadingOptimizations(true);
      try {
        const response = await fetch('/api/planner/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dayPlans, tripId }),
        });

        if (!response.ok) throw new Error('Analysis failed');

        const data = await response.json();
        
        // Filter issues and suggestions for this specific day
        const dayIssues = data.issues.filter((issue: Issue) => 
          issue.dayIndex === dayNumber - 1
        );
        
        const dayIssueIds = new Set(dayIssues.map((i: Issue) => i.id));
        const daySuggestions = data.suggestions.filter((s: Suggestion) => 
          dayIssueIds.has(s.issueId)
        );

        setOptimizations({
          issues: dayIssues,
          suggestions: daySuggestions,
        });
      } catch (error) {
        console.error('[DayOptimization] Analysis error:', error);
        toast.error('Failed to analyze day');
      } finally {
        setIsLoadingOptimizations(false);
      }
    };

    fetchOptimizations();
  }, [isOpen, dayNumber, dayPlans, tripId]);

  // Fetch community signals for the activity
  useEffect(() => {
    if (!isOpen || !destination || !activityTitle) return;

    const fetchSignals = async () => {
      setIsLoadingSignals(true);
      try {
        const params = new URLSearchParams({
          destination,
          activityTitle,
        });
        
        if (activityLocation) params.append('activityLocation', activityLocation);
        
        const res = await fetch(`/api/planner/signals?${params.toString()}`);
        if (!res.ok) throw new Error('Signals fetch failed');
        
        const data = await res.json();
        if (data.matches && data.matches.length > 0) {
          setSignals(data.matches.slice(0, 5)); // Top 5 matches
        }
      } catch (error) {
        console.error('[DayOptimization] Signals error:', error);
      } finally {
        setIsLoadingSignals(false);
      }
    };

    fetchSignals();
  }, [isOpen, destination, activityTitle, activityLocation]);

  const handleApplySuggestion = (suggestion: Suggestion) => {
    try {
      onApplySuggestion(suggestion);
      setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
      toast.success('Optimization applied successfully');
    } catch (error) {
      console.error('[DayOptimization] Apply error:', error);
      toast.error('Failed to apply optimization');
    }
  };

  const handleApplySignal = (signal: UGCSignal) => {
    if (onApplySignalToNote) {
      const noteText = signal.actionable || signal.content;
      onApplySignalToNote(noteText);
      toast.success('Tip added to activity notes!');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'geographic': return '📍';
      case 'timing': return '⏰';
      case 'signal': return '💡';
      default: return '📌';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSignalTypeConfig = (type: string) => {
    switch (type) {
      case 'positive':
        return { bgColor: 'bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-200', label: 'Praise' };
      case 'negative':
        return { bgColor: 'bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-200', label: 'Issue' };
      case 'suggestion':
        return { bgColor: 'bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-200', label: 'Suggestion' };
      default:
        return { bgColor: 'bg-gray-100', textColor: 'text-gray-700', borderColor: 'border-gray-200', label: 'Info' };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] w-full max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">Day {dayNumber} Optimization</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">{activityTitle}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Left Side: AI Optimization */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-blue-900">AI Optimization</h3>
                  <p className="text-sm text-blue-700">Smart suggestions for this day</p>
                </div>
              </div>

              {isLoadingOptimizations ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : optimizations.issues.length === 0 ? (
                <div className="text-center py-12 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-5xl mb-3">🎉</div>
                  <p className="text-blue-900 font-medium">Perfect Schedule!</p>
                  <p className="text-sm text-blue-600 mt-1">No optimization opportunities found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {optimizations.issues.map((issue) => {
                    const relatedSuggestions = optimizations.suggestions.filter(s => s.issueId === issue.id);
                    
                    return (
                      <div key={issue.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50 hover:bg-blue-100 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="text-2xl">{getTypeIcon(issue.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-blue-900">{issue.title}</h4>
                              <Badge variant="outline" className={getSeverityColor(issue.severity)}>
                                {issue.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-blue-700">{issue.description}</p>
                          </div>
                        </div>

                        {relatedSuggestions.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-blue-200 space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="h-4 w-4 text-blue-600" />
                              <h5 className="font-medium text-blue-900 text-sm">Suggested Solutions</h5>
                            </div>
                            {relatedSuggestions.map((suggestion) => {
                              const isApplied = appliedSuggestions.has(suggestion.id);
                              
                              return (
                                <div key={suggestion.id} className="bg-white rounded-lg p-3 border border-blue-200">
                                  <h6 className="font-medium text-sm text-gray-900 mb-1">{suggestion.title}</h6>
                                  <p className="text-xs text-gray-600 mb-3">{suggestion.description}</p>
                                  <Button
                                    onClick={() => handleApplySuggestion(suggestion)}
                                    disabled={isApplied}
                                    size="sm"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    {isApplied ? (
                                      <>
                                        <Check className="h-3 w-3 mr-1" />
                                        Applied
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        Apply
                                      </>
                                    )}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Side: Community Insights */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-amber-900">Community Insights</h3>
                  <p className="text-sm text-amber-700">Tips from travelers who've been here</p>
                </div>
              </div>

              {isLoadingSignals ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
              ) : signals.length === 0 ? (
                <div className="text-center py-12 bg-amber-50 rounded-lg border border-amber-100">
                  <Lightbulb className="h-12 w-12 mx-auto text-amber-300 mb-3" />
                  <p className="text-amber-900 font-medium">No insights yet</p>
                  <p className="text-sm text-amber-600 mt-1">Be the first to share your experience!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {signals.map((match, idx) => {
                    const config = getSignalTypeConfig(match.signal.signalType);
                    
                    return (
                      <div 
                        key={idx} 
                        className={`p-4 bg-white rounded-lg border ${config.borderColor} hover:shadow-md transition-all`}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-0.5 ${config.bgColor} ${config.textColor} border-0`}
                          >
                            {config.label}
                          </Badge>
                          {match.signal.priority === 'high' && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5 bg-red-100 text-red-700 border-0">
                              High Priority
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-1">{match.signal.title}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed mb-2">{match.signal.content}</p>
                        
                        {match.signal.actionable && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-amber-700 font-medium mb-3">
                              💡 {match.signal.actionable}
                            </p>
                            {onApplySignalToNote && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300 text-amber-900"
                                onClick={() => handleApplySignal(match.signal)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Apply to Notes
                              </Button>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <span>Match: {(match.matchScore * 100).toFixed(0)}%</span>
                          <span>•</span>
                          <span>{match.signal.commentCount} comments</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
