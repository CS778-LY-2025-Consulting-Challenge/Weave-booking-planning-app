import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import {
  calculateActionabilityScore,
  determineQualityTier,
  deduplicateSignals,
  deduplicateWithAI,
} from '@/lib/signal-quality';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define signal structure for type safety
interface Signal {
  signalType: 'positive' | 'negative' | 'suggestion';
  category: string;
  title: string;
  content: string;
  actionable?: string;
  confidence: number;
  commentIds: string[] | string; // Can be array or JSON string after deduplication
  commentCount?: number; // Added after deduplication
  priority: 'high' | 'medium' | 'low';
  impactArea?: string;
  actionabilityScore?: number; // Added during quality scoring
  qualityTier?: string; // Added during quality scoring
}

/**
 * POST /api/ugc-signals/generate
 * Generate UGC signals by analyzing comments for a community trip
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tripId } = body;

    if (!tripId) {
      return NextResponse.json(
        { error: 'tripId is required' },
        { status: 400 }
      );
    }

    console.log(`[UGC Signals] Generating signals for trip: ${tripId}`);

    // 1. Fetch the community trip
    const trip = await prisma.communityTrip.findUnique({
      where: { id: tripId },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 100, // Limit to recent comments
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (trip.comments.length === 0) {
      console.log('[UGC Signals] No comments to analyze');
      return NextResponse.json({
        message: 'No comments to analyze',
        signals: [],
      });
    }

    // 2. Prepare comments for AI analysis
    const commentsText = trip.comments
      .map(
        (c, idx) =>
          `Comment ${idx + 1} (ID: ${c.id}):\nUser: ${c.userName}\nContent: ${c.content}\n`
      )
      .join('\n---\n');

    console.log(
      `[UGC Signals] Analyzing ${trip.comments.length} comments with AI...`
    );

    // 3. Call OpenAI to analyze comments
    const systemPrompt = `You are a travel insights analyzer. Your job is to extract ONLY highly actionable, practical insights from user comments.

IMPORTANT: Return your response as a JSON object with a "signals" array.

CRITICAL RULES - Only create signals that meet these criteria:

✅ INCLUDE:
- Specific actionable advice (e.g., "take bus instead of driving", "book 2 weeks ahead", "arrive before 10am")
- Warnings with context (e.g., "crowded after 10am", "expensive parking - use public transit")
- Cost-saving tips with numbers (e.g., "save 30% by booking online")
- Safety concerns (ALWAYS include these)
- Timing recommendations (specific hours/days)
- Transportation/logistics issues with solutions

❌ EXCLUDE:
- Generic praise ("great experience", "highly recommended", "amazing museum")
- Simple positive reviews without actionable advice
- Vague statements ("nice place", "worth visiting")
- Obvious information that doesn't help planning

QUALITY CHECKLIST for each signal:
1. Does it help travelers AVOID a problem or OPTIMIZE their experience?
2. Does it suggest a SPECIFIC action with details?
3. Does it mention TIME, COST, LOCATION, or LOGISTICS?
4. Would a traveler change their plans based on this?

If a comment is just praise without details, SKIP IT.

For each actionable insight, create a signal with:
- signalType: "positive" (helpful tip), "negative" (problem/complaint), or "suggestion" (improvement idea)
- category: "accommodation", "transportation", "food", "activity", "timing", "cost", "safety", or "other"
- title: Short, action-oriented summary (max 50 chars, e.g., "Avoid Driving - Use Public Transit")
- content: Detailed description with specifics (1-2 sentences)
- actionable: REQUIRED for suggestions/negatives - specific action to take
- confidence: 0.0-1.0 (how certain you are, based on evidence)
- commentIds: Array of comment IDs supporting this insight
- priority: "high" (safety/cost/major issues), "medium" (convenience/optimization), "low" (nice-to-know)
- impactArea: Which part of trip is affected (e.g., "Museum visit", "Day 2 morning")

Focus on recurring patterns (2+ users) or strong single insights.
Return 3-8 signals maximum. Quality over quantity.`;

    const userPrompt = `Trip: ${trip.title} - ${trip.destination}
Duration: ${trip.duration}
Rating: ${trip.rating}/5

User Comments:
${commentsText}

Extract ONLY actionable, practical signals that will help future travelers:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const aiResponse = completion.choices[0].message.content;
    if (!aiResponse) {
      throw new Error('Empty AI response');
    }

    const parsed = JSON.parse(aiResponse);
    const signals: Signal[] = parsed.signals || [];

    console.log(`[UGC Signals] AI generated ${signals.length} signals`);

    // 4. First pass: Mathematical deduplication (fast, catches obvious duplicates)
    const mathDeduped = deduplicateSignals(signals, 0.65);
    console.log(
      `[UGC Signals] After math deduplication: ${mathDeduped.length} signals`
    );

    // 5. Calculate quality scores BEFORE AI deduplication (needed for best signal selection)
    const signalsWithQuality = mathDeduped.map((signal) => {
      const actionabilityScore = calculateActionabilityScore(signal);
      const qualityTier = determineQualityTier(actionabilityScore);

      return {
        ...signal,
        actionabilityScore,
        qualityTier,
      };
    });

    // 6. Second pass: AI semantic deduplication (catches similar meanings)
    const apiKey = process.env.OPENAI_API_KEY;
    let finalSignals = signalsWithQuality;
    
    if (apiKey && signalsWithQuality.length > 3) {
      // Only use AI if we have multiple signals that might be similar
      try {
        finalSignals = await deduplicateWithAI(signalsWithQuality, apiKey);
        console.log(
          `[UGC Signals] After AI deduplication: ${finalSignals.length} signals`
        );
      } catch (error) {
        console.warn('[UGC Signals] AI deduplication failed, using math results:', error);
      }
    }

    // 7. Filter out low-quality signals
    const qualitySignals = finalSignals.filter(
      (s) => (s.actionabilityScore ?? 0) >= 0.5
    );

    console.log(
      `[UGC Signals] After quality filtering: ${qualitySignals.length} signals`
    );

    // 8. Save signals to database
    console.log('[UGC Signals] Saving to database...');
    const savedSignals = await Promise.all(
      qualitySignals.map(async (signal) => {
        try {
          // Normalize commentIds
          let commentIdsArray: string[] = [];
          
          if (Array.isArray(signal.commentIds)) {
            commentIdsArray = signal.commentIds.map(String);
          } else if (typeof signal.commentIds === 'string') {
            try {
              const parsed = JSON.parse(signal.commentIds);
              commentIdsArray = Array.isArray(parsed) ? parsed.map(String) : [];
            } catch (e) {
              console.warn('[UGC Signals] Failed to parse commentIds string:', signal.commentIds);
              commentIdsArray = [];
            }
          }

          // Ensure strict types for Prisma
          return prisma.uGCSignal.create({
            data: {
              tripId,
              signalType: signal.signalType,
              category: signal.category || 'other',
              title: signal.title || 'Untitled Signal',
              content: signal.content || '',
              actionable: signal.actionable || null,
              confidence: Number(signal.confidence) || 0.5,
              commentCount: commentIdsArray.length,
              commentIds: JSON.stringify(commentIdsArray),
              priority: signal.priority || 'medium',
              impactArea: signal.impactArea || null,
              actionabilityScore: Number(signal.actionabilityScore) || 0.5,
              qualityTier: signal.qualityTier || 'standard',
              isActive: true,
            },
          });
        } catch (dbError) {
          console.error('[UGC Signals] Database save error for signal:', signal.title, dbError);
          throw dbError; // Re-throw to be caught by outer catch
        }
      })
    );

    console.log(
      `[UGC Signals] Successfully saved ${savedSignals.length} signals`
    );

    return NextResponse.json({
      success: true,
      message: `Generated ${savedSignals.length} signals from ${trip.comments.length} comments`,
      signals: savedSignals,
    });
  } catch (error) {
    // Log extended error details to a file for debugging
    const errorLog = `
Timestamp: ${new Date().toISOString()}
Error: ${error instanceof Error ? error.message : String(error)}
Stack: ${error instanceof Error ? error.stack : 'No stack'}
Context: Failed to generate signals
----------------------------------------
`;
    // Try to log to console (server terminal)
    console.error('[UGC Signals] CRITICAL ERROR:', error);
    
    // Return typical error response
    return NextResponse.json(
      {
        error: 'Failed to generate signals',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ugc-signals/generate?tripId=xxx
 * Get existing signals for a trip
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');

    console.log('[UGC Signals GET] Request for tripId:', tripId);

    if (!tripId) {
      return NextResponse.json(
        { error: 'tripId is required' },
        { status: 400 }
      );
    }

    const signals = await prisma.uGCSignal.findMany({
      where: {
        tripId,
        isActive: true,
      },
    });

    console.log(`[UGC Signals GET] Found ${signals.length} signals`);

    // Sort by priority and confidence
    const qualitySignals = signals
      .sort((a, b) => {
        // Sort by priority desc, then confidence desc
        // Priority sorting: high > medium > low
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        if (priorityB !== priorityA) return priorityB - priorityA;

        return b.confidence - a.confidence;
      });

    console.log(`[UGC Signals GET] After filtering: ${qualitySignals.length} signals`);

    // Group by quality tier for easier consumption
    const groupedSignals = {
      critical: qualitySignals.filter((s) => s.qualityTier === 'critical'),
      high: qualitySignals.filter((s) => s.qualityTier === 'high'),
      standard: qualitySignals.filter((s) => s.qualityTier === 'standard'),
      // For backward compatibility, include signals without tier as "standard"
      all: qualitySignals,
    };

    return NextResponse.json({
      signals: groupedSignals.all.slice(0, 10), // Max 10 signals
      grouped: groupedSignals,
      count: qualitySignals.length,
      totalCount: signals.length,
    });
  } catch (error) {
    console.error('[UGC Signals GET] Error fetching signals:', error);
    console.error('[UGC Signals GET] Stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        error: 'Failed to fetch signals',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
