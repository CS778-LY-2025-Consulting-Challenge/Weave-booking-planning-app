import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { matchSignalsToActivity, type Activity, type SignalMatch } from '@/lib/ugc-signal-matcher';

/**
 * GET /api/planner/signals
 * Fetch UGC signals for a destination and optionally match to specific activity
 * 
 * Query params:
 * - destination: string (required) - destination to search for
 * - activityTitle: string (optional) - specific activity to match signals to
 * - activityLocation: string (optional) - location of the activity
 * - activityType: string (optional) - type of activity (attraction/food/hotel)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination');
    const activityTitle = searchParams.get('activityTitle');
    const activityLocation = searchParams.get('activityLocation');
    const activityType = searchParams.get('activityType');
    
    if (!destination) {
      return NextResponse.json(
        { error: 'Destination parameter is required' },
        { status: 400 }
      );
    }
    
    console.log('[Planner Signals] Fetching signals for destination:', destination);
    
    // Find community trips matching this destination
    const trips = await prisma.communityTrip.findMany({
      where: {
        destination: {
          contains: destination,
        },
        isPublished: true,
      },
      select: {
        id: true,
        destination: true,
        rating: true,
      },
      orderBy: {
        rating: 'desc',
      },
      take: 10, // Get top 10 trips by rating
    });
    
    if (trips.length === 0) {
      console.log('[Planner Signals] No trips found for destination:', destination);
      return NextResponse.json({
        success: true,
        destination,
        signals: [],
        matches: [],
        message: 'No community insights available for this destination yet',
      });
    }
    
    console.log('[Planner Signals] Found', trips.length, 'trips for', destination);
    
    // Fetch signals from all these trips
    const tripIds = trips.map(t => t.id);
    const signals = await prisma.uGCSignal.findMany({
      where: {
        tripId: {
          in: tripIds,
        },
        isActive: true,
      },
      orderBy: [
        { priority: 'desc' },
        { confidence: 'desc' },
      ],
    });
    
    console.log('[Planner Signals] Found', signals.length, 'signals');
    
    // If activity details provided, match signals to it
    if (activityTitle) {
      const activity: Activity = {
        title: activityTitle,
        location: activityLocation || undefined,
        type: activityType || undefined,
      };
      
      const matches = matchSignalsToActivity(signals, activity);
      
      console.log('[Planner Signals] Matched', matches.length, 'signals to activity:', activityTitle);
      
      return NextResponse.json({
        success: true,
        destination,
        activityTitle,
        signals: signals.slice(0, 20), // Return top 20 general signals
        matches: matches.slice(0, 5), // Return top 5 matched signals
        totalMatches: matches.length,
      });
    }
    
    // Return general signals for the destination
    return NextResponse.json({
      success: true,
      destination,
      signals: signals.slice(0, 20),
      totalSignals: signals.length,
    });
    
  } catch (error) {
    console.error('[Planner Signals] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch signals',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
