import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { destination, dates } = body;

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }

    console.log('[Travel Safety] Analyzing safety for:', destination);

    // Check cache first
    const cacheKey = `safety-${destination.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('[Travel Safety] Returning cached data');
      return NextResponse.json(cached.data);
    }

    const NEWS_API_KEY = process.env.NEWS_API_KEY || 'f22e38b5f1ff4d99bf741eb616de3660';

    // Calculate date range (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const fromDate = sevenDaysAgo.toISOString().split('T')[0];

    // Construct search query with safety-related keywords
    const searchQuery = `${destination} (safety OR crime OR protest OR disaster OR "travel advisory" OR warning OR terrorism OR violence OR unrest)`;
    
    console.log('[Travel Safety] Fetching news from:', fromDate);
    console.log('[Travel Safety] Search query:', searchQuery);

    // Fetch news from NewsAPI
    const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&from=${fromDate}&language=en&sortBy=relevancy&pageSize=15&apiKey=${NEWS_API_KEY}`;
    
    const newsResponse = await fetch(newsUrl);
    const newsData = await newsResponse.json();

    console.log('[Travel Safety] NewsAPI response status:', newsData.status);
    console.log('[Travel Safety] Articles found:', newsData.totalResults);

    if (newsData.status !== 'ok') {
      console.error('[Travel Safety] NewsAPI error:', newsData);
      return NextResponse.json(
        { error: 'Failed to fetch news: ' + (newsData.message || 'Unknown error') },
        { status: 500 }
      );
    }

    // If no articles found, return safe default
    if (!newsData.articles || newsData.articles.length === 0) {
      const safeResponse = {
        riskLevel: 'low',
        summary: `No recent safety concerns reported for ${destination}. The destination appears to be safe for travel.`,
        newsItems: [
          'No significant safety incidents reported',
          'Standard travel precautions recommended',
          'Monitor local news for updates'
        ],
        lastUpdated: new Date().toISOString(),
        articlesAnalyzed: 0,
      };

      // Cache the result
      cache.set(cacheKey, { data: safeResponse, timestamp: Date.now() });

      return NextResponse.json(safeResponse);
    }

    // Prepare articles for AI analysis
    const articlesForAI = newsData.articles.slice(0, 10).map((article: any) => ({
      title: article.title,
      description: article.description,
      source: article.source.name,
      publishedAt: article.publishedAt,
      url: article.url,
    }));

    console.log('[Travel Safety] Analyzing', articlesForAI.length, 'articles with AI');

    // Use OpenAI to analyze news for safety concerns
    const aiPrompt = `
You are a travel safety analyst. Analyze these recent news articles about ${destination} and assess travel safety for typical urban travelers.

News Articles:
${JSON.stringify(articlesForAI, null, 2)}

**CRITICAL RISK LEVEL GUIDELINES - Be conservative and accurate:**

1. **riskLevel**: Choose ONE of: "low", "medium", "high", "critical"
   - **low**: DEFAULT for most destinations. Use when:
     * No recent serious incidents affecting urban areas
     * Normal city operations, minor isolated incidents
     * Positive or neutral news
     * Rural/remote area incidents that don't affect typical tourist areas
   - **medium**: Use ONLY when there are:
     * Specific safety concerns affecting tourist areas (not just rural areas)
     * Active ongoing issues in the city (protests, significant crime increase)
     * Natural disasters affecting major tourist areas
   - **high**: Use ONLY when there are:
     * Widespread safety issues affecting the city
     * Government travel warnings
     * Major ongoing security threats in urban areas
   - **critical**: Use ONLY when there are:
     * Active conflict, war, or extreme danger
     * Government evacuation orders
     * Widespread violence or terrorism

2. **summary**: 1-2 concise sentences. Be factual and balanced. If safe, say so clearly.

3. **newsItems**: 2-3 bullet points of KEY information ONLY relevant to typical travelers
   - Focus on URBAN areas and common tourist activities
   - Ignore isolated rural/remote incidents unless they affect tourist routes
   - Be specific: "Heavy snow expected Jan 12-13 in Tokyo" not vague warnings
   - Mention dates if relevant
   - Keep each item concise (max 80 characters)

4. **sources**: List 1-2 most relevant article titles

Return ONLY valid JSON in this exact format:
{
  "riskLevel": "low|medium|high|critical",
  "summary": "string",
  "newsItems": ["item1", "item2", "item3"],
  "sources": ["source1", "source2"]
}

**IMPORTANT RULES:**
- DEFAULT to "low" unless there are clear, specific safety concerns in urban/tourist areas
- Isolated incidents in rural areas = LOW risk (don't penalize entire city)
- Crime statistics or general warnings without specific incidents = LOW risk
- Natural disasters affecting remote areas only = LOW risk
- Only raise risk level if issues directly affect typical tourist experience
- Be conservative - when in doubt, choose "low"
`;

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a travel safety analyst. Always respond with valid JSON only.' },
        { role: 'user', content: aiPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const analysis = JSON.parse(aiResponse.choices[0].message.content || '{}');
    console.log('[Travel Safety] AI analysis completed:', analysis.riskLevel);

    const response = {
      riskLevel: analysis.riskLevel || 'low',
      summary: analysis.summary || `Based on recent news, ${destination} appears safe for travel.`,
      newsItems: analysis.newsItems || ['No significant safety concerns identified'],
      sources: analysis.sources || [],
      lastUpdated: new Date().toISOString(),
      articlesAnalyzed: articlesForAI.length,
    };

    // Cache the result
    cache.set(cacheKey, { data: response, timestamp: Date.now() });

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[Travel Safety] Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze travel safety: ' + error.message },
      { status: 500 }
    );
  }
}

