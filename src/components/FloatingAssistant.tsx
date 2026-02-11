'use client';

import { useState } from 'react';
import { Sparkles, X, Loader2, Check, Lightbulb } from 'lucide-react';
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

type AnalysisResult = {
  issues: Issue[];
  suggestions: Suggestion[];
  summary: {
    totalIssues: number;
    highSeverity: number;
    mediumSeverity: number;
    lowSeverity: number;
  };
};

type FloatingAssistantProps = {
  dayPlans: any[];
  tripId?: string;
  onApplySuggestion: (suggestion: Suggestion) => void;
};

export default function FloatingAssistant({ dayPlans, tripId, onApplySuggestion }: FloatingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  const handleAnalyze = async () => {
    if (!dayPlans || dayPlans.length === 0) {
      toast.error('No itinerary to analyze');
      return;
    }

    setIsAnalyzing(true);
    setIsOpen(true);

    try {
      const response = await fetch('/api/planner/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayPlans, tripId }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data);

      if (data.issues.length === 0) {
        toast.success('🎉 Your itinerary looks great! No issues found.');
      } else {
        toast.success(`Found ${data.issues.length} optimization opportunities`);
      }
    } catch (error) {
      console.error('[FloatingAssistant] Analysis error:', error);
      toast.error('Failed to analyze itinerary');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySuggestion = (suggestion: Suggestion) => {
    try {
      onApplySuggestion(suggestion);
      setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
      toast.success('Suggestion applied successfully');
    } catch (error) {
      console.error('[FloatingAssistant] Apply error:', error);
      toast.error('Failed to apply suggestion');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'geographic': return '🗺️';
      case 'timing': return '⏰';
      case 'signal': return '💡';
      default: return '📍';
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || !dayPlans || dayPlans.length === 0}
        className="fixed bottom-8 right-8 z-50 group"
        aria-label="Optimize itinerary"
      >
        <div className="relative">
          {/* Main button with blue gradient */}
          <div className="relative flex items-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span className="font-medium">Optimize Trip</span>
              </>
            )}
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            AI-powered itinerary optimization
            <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </button>

      {/* Analysis Results Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[90vw] w-full max-h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-blue-600" />
              Itinerary Optimization
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="text-gray-600">Analyzing your itinerary...</p>
                <p className="text-sm text-gray-400">Checking routes, timing, and community insights</p>
              </div>
            ) : analysis ? (
              <>
                {/* Simple header with count only */}
                <div className="pb-2 border-b border-gray-200">
                  <p className="text-base text-gray-700">
                    {(() => {
                      // Calculate remaining issues (not all suggestions applied)
                      const remainingIssues = analysis.issues.filter(issue => {
                        const relatedSuggestions = analysis.suggestions.filter(s => s.issueId === issue.id);
                        return !(relatedSuggestions.length > 0 && 
                          relatedSuggestions.every(s => appliedSuggestions.has(s.id)));
                      }).length;
                      
                      return remainingIssues === 0 
                        ? '✨ All suggestions have been applied! Your itinerary is optimized.'
                        : `Found ${remainingIssues} optimization ${remainingIssues === 1 ? 'opportunity' : 'opportunities'}`;
                    })()}
                  </p>
                </div>

                {/* Issues and Suggestions - Left-Right Layout */}
                {analysis.issues.length > 0 ? (
                  <div className="space-y-4">
                    {analysis.issues.map((issue) => {
                      const relatedSuggestions = analysis.suggestions.filter(s => s.issueId === issue.id);
                      
                      // Hide issue if all related suggestions have been applied
                      const allApplied = relatedSuggestions.length > 0 && 
                        relatedSuggestions.every(s => appliedSuggestions.has(s.id));
                      
                      if (allApplied) return null;
                      
                      return (
                        <div key={issue.id} className="border border-gray-200 rounded-lg p-5 bg-white hover:border-blue-300 transition-colors">
                          <div className="flex gap-6">
                            {/* Left Side: UGC Signal / Issue Information */}
                            <div className="flex-1 flex items-center">
                              <div className="w-full">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    Applicable
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">{issue.description}</p>
                              </div>
                            </div>

                            {/* Right Side: Suggested Solutions + Details + Apply */}
                            {relatedSuggestions.length > 0 && (
                              <div className="flex-shrink-0 w-80 border-l border-gray-200 pl-6">
                                <div className="flex items-center gap-2 mb-4">
                                  <Lightbulb className="h-5 w-5 text-amber-500" />
                                  <h5 className="font-semibold text-gray-800">Suggested Solutions</h5>
                                </div>
                                
                                <div className="space-y-3">
                                  {relatedSuggestions.map((suggestion) => {
                                    const isApplied = appliedSuggestions.has(suggestion.id);
                                    
                                    return (
                                      <div key={suggestion.id} className="space-y-2">
                                        {/* Suggestion details */}
                                        <div className="bg-blue-50/50 p-3 rounded-lg">
                                          <p className="text-sm font-medium text-gray-900 mb-1">{suggestion.title}</p>
                                          <p className="text-xs text-gray-600 leading-relaxed">{suggestion.description}</p>
                                        </div>
                                        
                                        {/* Apply button */}
                                        <Button
                                          onClick={() => handleApplySuggestion(suggestion)}
                                          disabled={isApplied}
                                          className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-center"
                                        >
                                          {isApplied ? (
                                            <>
                                              <Check className="h-4 w-4 mr-2" />
                                              Applied
                                            </>
                                          ) : (
                                            <>
                                              <Sparkles className="h-4 w-4 mr-2" />
                                              Apply
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Perfect Itinerary!</h3>
                    <p className="text-gray-600">Your trip is well-planned with optimal routing and timing.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Click "Analyze" to optimize your itinerary
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
