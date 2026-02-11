import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

type Coordinates = { lat: number; lng: number };

type Activity = {
  time?: string;
  title: string;
  location?: string;
  coords?: Coordinates;
  type?: 'attraction' | 'food' | 'hotel';
  duration?: string;
  highlights?: string;
};

type DayPlan = {
  day: number;
  date?: string;
  city?: string;
  activities: Activity[];
};

type Issue = {
  id: string;
  type: 'geographic' | 'timing' | 'signal';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  dayIndex?: number;
  activityIndex?: number;
  metadata?: {
    activities?: Array<{
      name: string;
      location?: string;
      imageUrl?: string;
    }>;
    distance?: string;
  };
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

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Check for geographic issues (backtracking, inefficient routing)
function analyzeGeographicIssues(dayPlans: DayPlan[]): { issues: Issue[]; suggestions: Suggestion[] } {
  const issues: Issue[] = [];
  const suggestions: Suggestion[] = [];

  dayPlans.forEach((day, dayIndex) => {
    const activitiesWithCoords = day.activities.filter(a => a.coords);
    
    if (activitiesWithCoords.length < 2) return;

    // Check for backtracking patterns
    for (let i = 0; i < activitiesWithCoords.length - 2; i++) {
      const a1 = activitiesWithCoords[i];
      const a2 = activitiesWithCoords[i + 1];
      const a3 = activitiesWithCoords[i + 2];

      if (!a1.coords || !a2.coords || !a3.coords) continue;

      const dist12 = calculateDistance(a1.coords, a2.coords);
      const dist23 = calculateDistance(a2.coords, a3.coords);
      const dist13 = calculateDistance(a1.coords, a3.coords);

      // Detect backtracking: if going A->B->C, but A->C is much shorter than A->B->C
      if (dist13 < (dist12 + dist23) * 0.5 && dist12 > 2) {
        const issueId = `geo-backtrack-${dayIndex}-${i}`;
        issues.push({
          id: issueId,
          type: 'geographic',
          severity: 'medium',
          title: '🔄 Detected Backtracking',
          description: `Day ${day.day}: The route from "${a1.title}" → "${a2.title}" → "${a3.title}" involves backtracking. Distance could be reduced by ~${Math.round((dist12 + dist23 - dist13) * 10) / 10}km.`,
          dayIndex,
          activityIndex: i,
          metadata: {
            activities: [
              { name: a1.title, location: a1.location },
              { name: a2.title, location: a2.location },
              { name: a3.title, location: a3.location },
            ],
            distance: `${Math.round((dist12 + dist23) * 10) / 10}km`,
          },
        });

        suggestions.push({
          id: `sug-${issueId}`,
          issueId,
          type: 'reorder',
          title: 'Optimize Activity Order',
          description: `Reorder activities to minimize travel distance`,
          action: {
            type: 'reorder_activities',
            payload: {
              dayIndex,
              newOrder: [i, i + 2, i + 1], // Swap middle activity with last
            },
          },
        });
      }
    }

    // Check for long distances between consecutive activities
    for (let i = 0; i < activitiesWithCoords.length - 1; i++) {
      const a1 = activitiesWithCoords[i];
      const a2 = activitiesWithCoords[i + 1];

      if (!a1.coords || !a2.coords) continue;

      const distance = calculateDistance(a1.coords, a2.coords);

      if (distance > 10) { // More than 10km apart
        const issueId = `geo-distance-${dayIndex}-${i}`;
        issues.push({
          id: issueId,
          type: 'geographic',
          severity: distance > 20 ? 'high' : 'medium',
          title: '📍 Long Distance Between Activities',
          description: `Day ${day.day}: "${a1.title}" and "${a2.title}" are ${Math.round(distance * 10) / 10}km apart. Consider adding a transportation note or selecting closer alternatives.`,
          dayIndex,
          activityIndex: i,
          metadata: {
            activities: [
              { name: a1.title, location: a1.location },
              { name: a2.title, location: a2.location },
            ],
            distance: `${Math.round(distance * 10) / 10}km`,
          },
        });

        suggestions.push({
          id: `sug-${issueId}`,
          issueId,
          type: 'add_note',
          title: 'Add Transportation Note',
          description: `Add a note about transportation options (taxi, subway, bus) for this ${Math.round(distance)}km journey`,
          action: {
            type: 'add_highlight',
            payload: {
              dayIndex,
              activityIndex: i,
              highlight: `⚠️ Distance Alert: ${Math.round(distance)}km to next location. Consider taxi or public transport. Estimated travel time: ${Math.round(distance / 30 * 60)} minutes.`,
            },
          },
        });
      }
    }
  });

  return { issues, suggestions };
}

// Match UGC signals to activities and generate suggestions
async function analyzeUGCSignals(dayPlans: DayPlan[], tripId: string): Promise<{ issues: Issue[]; suggestions: Suggestion[] }> {
  const issues: Issue[] = [];
  const suggestions: Suggestion[] = [];

  try {
    // Fetch UGC signals for this trip
    const signals = await prisma.uGCSignal.findMany({
      where: {
        tripId,
        isActive: true,
      },
      orderBy: [
        { priority: 'desc' },
        { confidence: 'desc' },
      ],
    });

    if (signals.length === 0) {
      return { issues, suggestions };
    }

    // Match signals to activities
    dayPlans.forEach((day, dayIndex) => {
      day.activities.forEach((activity, activityIndex) => {
        // Find relevant signals for this activity
        const relevantSignals = signals.filter(signal => {
          const signalContent = signal.content.toLowerCase();
          const activityTitle = activity.title.toLowerCase();
          const activityLocation = activity.location?.toLowerCase() || '';
          
          // Simple keyword matching
          return signalContent.includes(activityTitle) || 
                 activityTitle.includes(signalContent.split(' ')[0]) ||
                 (activityLocation && signalContent.includes(activityLocation));
        });

        relevantSignals.forEach(signal => {
          const issueId = `signal-${signal.id}-${dayIndex}-${activityIndex}`;
          
          // Determine severity based on signal category
          let severity: 'high' | 'medium' | 'low' = 'low';
          if (signal.category === 'warning' || signal.category === 'timing') {
            severity = 'high';
          } else if (signal.category === 'logistics') {
            severity = 'medium';
          }

          issues.push({
            id: issueId,
            type: 'signal',
            severity,
            title: signal.title,
            description: `Day ${day.day}, ${activity.title}: ${signal.content}`,
            dayIndex,
            activityIndex,
          });

          // Generate suggestion based on signal type
          if (signal.actionable) {
            suggestions.push({
              id: `sug-${issueId}`,
              issueId,
              type: 'add_note',
              title: 'Apply Community Insight',
              description: signal.content,
              action: {
                type: 'add_highlight',
                payload: {
                  dayIndex,
                  activityIndex,
                  highlight: `📍 Traveler Tip: ${signal.content}`,
                },
              },
            });
          }
        });
      });
    });

  } catch (error) {
    console.error('[Analyze UGC Signals] Error:', error);
  }

  return { issues, suggestions };
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { dayPlans, tripId } = body;

    if (!dayPlans || !Array.isArray(dayPlans)) {
      return NextResponse.json({ error: 'Invalid dayPlans format' }, { status: 400 });
    }

    console.log('[Planner Analyze] Starting analysis for', dayPlans.length, 'days');

    // Run all analyses
    const geoAnalysis = analyzeGeographicIssues(dayPlans);
    const signalAnalysis = tripId ? await analyzeUGCSignals(dayPlans, tripId) : { issues: [], suggestions: [] };

    // Combine all issues and suggestions
    const allIssues = [...geoAnalysis.issues, ...signalAnalysis.issues];
    const allSuggestions = [...geoAnalysis.suggestions, ...signalAnalysis.suggestions];

    // Sort issues by severity
    allIssues.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    console.log('[Planner Analyze] Found', allIssues.length, 'issues and', allSuggestions.length, 'suggestions');

    return NextResponse.json({
      issues: allIssues,
      suggestions: allSuggestions,
      summary: {
        totalIssues: allIssues.length,
        highSeverity: allIssues.filter(i => i.severity === 'high').length,
        mediumSeverity: allIssues.filter(i => i.severity === 'medium').length,
        lowSeverity: allIssues.filter(i => i.severity === 'low').length,
      },
    });

  } catch (error) {
    console.error('[Planner Analyze] Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze itinerary' },
      { status: 500 }
    );
  }
}
