import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

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
  commentIds: string[];
  priority: 'high' | 'medium' | 'low';
  impactArea?: string;
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
    const systemPrompt = `You are a travel insights analyzer. Analyze user comments about a trip and extract actionable insights.

For each significant insight, create a signal with:
- signalType: "positive" (praise/recommendation), "negative" (complaint/issue), or "suggestion" (improvement idea)
- category: "accommodation", "transportation", "food", "activity", "timing", "cost", "safety", or "other"
- title: Short summary (max 50 chars)
- content: Detailed description (1-2 sentences)
- actionable: Specific action that can be taken (optional)
- confidence: 0.0-1.0 (how certain you are about this insight)
- commentIds: Array of comment IDs this insight is based on
- priority: "high", "medium", or "low" based on impact
- impactArea: Which part of trip is affected (e.g., "Day 2 afternoon", "Hotel check-in")

Focus on:
- Recurring themes (mentioned by multiple users)
- Strong emotions (very positive or negative)
- Actionable suggestions
- Safety concerns (always high priority)
- Cost/value issues

Return JSON array of signals. Minimum 3, maximum 10 signals.`;

    const userPrompt = `Trip: ${trip.title} - ${trip.destination}
Duration: ${trip.duration}
Rating: ${trip.rating}/5

User Comments:
${commentsText}

Analyze these comments and extract actionable signals:`;

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

    // 4. Save signals to database
    const savedSignals = await Promise.all(
      signals.map((signal) =>
        prisma.uGCSignal.create({
          data: {
            tripId,
            signalType: signal.signalType,
            category: signal.category,
            title: signal.title,
            content: signal.content,
            actionable: signal.actionable || null,
            confidence: signal.confidence,
            commentCount: signal.commentIds.length,
            commentIds: JSON.stringify(signal.commentIds),
            priority: signal.priority,
            impactArea: signal.impactArea || null,
            isActive: true,
          },
        })
      )
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
    console.error('[UGC Signals] Error:', error);
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
      orderBy: [{ priority: 'desc' }, { confidence: 'desc' }],
    });

    return NextResponse.json({
      signals,
      count: signals.length,
    });
  } catch (error) {
    console.error('[UGC Signals] Error fetching signals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signals' },
      { status: 500 }
    );
  }
}
