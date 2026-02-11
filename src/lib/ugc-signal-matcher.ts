/**
 * UGC Signal Matching Utility
 * Matches UGC signals to specific locations/activities in trip itineraries
 */

export interface UGCSignal {
  id: string;
  tripId: string;
  signalType: string;
  category: string;
  title: string;
  content: string;
  actionable?: string | null;
  confidence: number;
  priority: string;
  impactArea?: string | null;
  actionabilityScore?: number;
  qualityTier?: string;
}

export interface Activity {
  title: string;
  location?: string;
  type?: string;
  time?: string;
}

export interface SignalMatch {
  signal: UGCSignal;
  matchScore: number;
  matchReason: string;
}

/**
 * Calculate similarity between two strings using Jaccard similarity
 */
function calculateJaccardSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

/**
 * Extract location keywords from impactArea field
 * Examples: "Museum visit" -> ["museum"], "Day 2 morning" -> []
 */
function extractLocationKeywords(impactArea?: string | null): string[] {
  if (!impactArea) return [];
  
  // Remove common time/day references
  const cleaned = impactArea
    .toLowerCase()
    .replace(/day \d+/g, '')
    .replace(/morning|afternoon|evening|night/g, '')
    .trim();
  
  // Extract meaningful location words (>3 chars)
  return cleaned.split(/\s+/).filter(word => word.length > 3);
}

/**
 * Match signals to a specific activity
 * Returns array of matching signals sorted by relevance
 */
export function matchSignalsToActivity(
  signals: UGCSignal[],
  activity: Activity
): SignalMatch[] {
  const matches: SignalMatch[] = [];
  
  const activityText = `${activity.title} ${activity.location || ''}`.toLowerCase();
  
  for (const signal of signals) {
    let matchScore = 0;
    const matchReasons: string[] = [];
    
    // 1. Direct title/location matching (highest weight: 0.5)
    const signalText = `${signal.title} ${signal.content}`.toLowerCase();
    const titleSimilarity = calculateJaccardSimilarity(signal.title.toLowerCase(), activity.title.toLowerCase());
    
    if (titleSimilarity > 0.3) {
      matchScore += titleSimilarity * 0.5;
      matchReasons.push('title_match');
    }
    
    // 2. Category matching (weight: 0.2)
    if (signal.category) {
      if (activity.type === 'food' && signal.category === 'food') {
        matchScore += 0.2;
        matchReasons.push('category_food');
      } else if (activity.type === 'hotel' && signal.category === 'accommodation') {
        matchScore += 0.2;
        matchReasons.push('category_accommodation');
      } else if (activity.type === 'attraction' && ['activity', 'timing', 'other'].includes(signal.category)) {
        matchScore += 0.1;
        matchReasons.push('category_activity');
      }
    }
    
    // 3. Impact area keyword matching (weight: 0.3)
    const impactKeywords = extractLocationKeywords(signal.impactArea);
    if (impactKeywords.length > 0) {
      const keywordMatches = impactKeywords.filter(keyword => 
        activityText.includes(keyword)
      );
      
      if (keywordMatches.length > 0) {
        matchScore += (keywordMatches.length / impactKeywords.length) * 0.3;
        matchReasons.push('impact_area_match');
      }
    }
    
    // 4. General content relevance (weight: 0.2)
    const contentWords = signalText.split(/\s+/).filter(w => w.length > 4);
    const relevantWords = contentWords.filter(word => activityText.includes(word));
    
    if (relevantWords.length > 0 && contentWords.length > 0) {
      matchScore += Math.min(relevantWords.length / contentWords.length, 1) * 0.2;
      matchReasons.push('content_relevance');
    }
    
    // Only include signals with meaningful match score
    if (matchScore > 0.2) {
      matches.push({
        signal,
        matchScore,
        matchReason: matchReasons.join(', '),
      });
    }
  }
  
  // Sort by match score (descending) and actionability
  return matches.sort((a, b) => {
    const scoreA = a.matchScore * (a.signal.actionabilityScore || 0.5);
    const scoreB = b.matchScore * (b.signal.actionabilityScore || 0.5);
    return scoreB - scoreA;
  });
}

/**
 * Match signals to an entire trip's day plans
 * Returns a map of dayNumber -> activityIndex -> signals[]
 */
export function matchSignalsToDayPlans(
  signals: UGCSignal[],
  dayPlans: Array<{
    day: number;
    activities: Activity[];
  }>
): Map<string, SignalMatch[]> {
  const matchMap = new Map<string, SignalMatch[]>();
  
  for (const dayPlan of dayPlans) {
    for (let activityIndex = 0; activityIndex < dayPlan.activities.length; activityIndex++) {
      const activity = dayPlan.activities[activityIndex];
      const matches = matchSignalsToActivity(signals, activity);
      
      if (matches.length > 0) {
        const key = `${dayPlan.day}-${activityIndex}`;
        matchMap.set(key, matches);
      }
    }
  }
  
  return matchMap;
}

/**
 * Get top N signals for a destination (general trip-level signals)
 */
export function getTopSignalsForDestination(
  signals: UGCSignal[],
  limit: number = 5
): UGCSignal[] {
  return signals
    .filter(s => s.priority === 'high' || (s.actionabilityScore || 0) >= 0.6)
    .sort((a, b) => {
      // Sort by priority first (high > medium > low)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      
      if (priorityA !== priorityB) return priorityB - priorityA;
      
      // Then by actionability score
      const scoreA = a.actionabilityScore || 0.5;
      const scoreB = b.actionabilityScore || 0.5;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}
