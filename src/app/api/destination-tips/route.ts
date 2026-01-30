import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours (tips don't change as frequently as safety alerts)

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { destination, userOrigin, forceRefresh } = body;

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }

    console.log('[Destination Tips] Generating tips for:', destination, forceRefresh ? '(force refresh)' : '');

    // Check cache first (unless force refresh is requested)
    const cacheKey = `tips-${destination.toLowerCase()}-${(userOrigin || 'global').toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('[Destination Tips] Returning cached data');
      return NextResponse.json(cached.data);
    }

    // Use OpenAI to generate comprehensive destination tips
    const aiPrompt = `
You are a knowledgeable travel advisor. Generate comprehensive, practical travel tips for ${destination}${userOrigin ? ` for travelers from ${userOrigin}` : ''}.

Create detailed, honest advice that travelers MUST know before arriving. Be specific and direct about challenges. Format like a travel guide with rich details.

Provide 5-8 categories with the following structure:

Categories to include (adjust importance and content to the destination):
1. **Internet & Communication**
   - Decide importance based on internet freedom:
     - Use <strong>Critical</strong> ONLY for heavily restricted/censored destinations (e.g., China, Iran, North Korea, Turkmenistan).
     - Use <strong>Important</strong> for partially restricted or costly roaming contexts.
     - Use <strong>Good to Know</strong> for open internet destinations (e.g., US, EU, AU/NZ), focusing on SIM/eSIM, WiFi quality, speed, roaming costs.
   - Include tips on local SIM/eSIM, best networks, expected speeds, WiFi reliability, and roaming cost traps.
2. **Visa & Entry Requirements** - Visa types, visa-on-arrival, entry restrictions, passport validity  
3. **Currency & Payment Systems** - Local currency, card acceptance, mobile payments, ATM tips, cashless vs cash culture
4. **Language & Translation** - English proficiency levels, essential phrases, which translation apps work
5. **Cultural Etiquette & Social Norms** - Dress codes, tipping culture, religious/cultural taboos, social customs
6. **Transportation & Getting Around** - Public transit, ride-hailing apps, IC cards, taxi situations, platform etiquette
7. **Health & Safety Essentials** - Vaccinations, tap water safety, pharmacy access, medical insurance needs
8. **Climate & Seasonal Considerations** - Best travel times, weather patterns, what to pack, major festivals/holidays

Format your response as JSON with this EXACT structure:
{
  "destination": "${destination}",
  "categories": [
    {
      "category": "<Category name>",
      "emoji": "<Emoji>",
      "importance": "<Critical|Important|Good to Know based on destination context>",
      "subtitle": "<Short subtitle>",
      "tips": ["<tip1>", "<tip2>", "<tip3>"]
    }
  ],
  "lastUpdated": "${new Date().toISOString()}"
}

IMPORTANT formatting rules:
- Use <strong>bold text</strong> for key phrases and critical information
- Each tip should be a complete, detailed sentence or statement
- Include specific examples, numbers, app names, recommendations
- Use em dashes (—) for explanatory additions
- Be conversational but informative
- Prioritize "Critical" for trip-breaking issues, "Important" for significant inconveniences, "Good to Know" for helpful context
- Provide 3-5 detailed tips per category
- Don't hold back on honest challenges (e.g., "China is increasingly cashless (opposite of Japan)!")

Respond ONLY with valid JSON, no markdown formatting.`;

    console.log('[Destination Tips] Calling OpenAI API...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a travel expert who provides practical, honest, and actionable destination advice. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: aiPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();

    if (!responseText) {
      throw new Error('Empty response from OpenAI');
    }

    console.log('[Destination Tips] Raw AI response:', responseText.substring(0, 200) + '...');

    // Parse the JSON response
    let tipsData;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      
      tipsData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('[Destination Tips] JSON parse error:', parseError);
      console.error('[Destination Tips] Response was:', responseText);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate the response structure
    if (!tipsData.categories || !Array.isArray(tipsData.categories)) {
      throw new Error('Invalid tips data structure from AI');
    }

    // Post-process Internet & Communication for open internet destinations
    const restrictiveInternetDestinations = [
      'china', 'people\'s republic of china', 'prc', 'mainland china',
      'iran', 'islamic republic of iran',
      'north korea', 'dprk',
      'turkmenistan',
      'cuba',
      'russia',
      'united arab emirates', 'uae', 'united arab emirates (uae)',
      'oman',
      'qatar'
    ];

    const destinationLc = destination.toLowerCase();
    const isRestrictive = restrictiveInternetDestinations.some((d) => destinationLc.includes(d));

    const openInternetDefaultTips = [
      '<strong>Pick up a local SIM or eSIM</strong> (e.g., airport kiosks or convenience stores) for cheaper data and better coverage than roaming.',
      '<strong>Check typical speeds and coverage</strong> of major carriers before you buy—dense urban areas are fast, but rural/coastal regions may be slower.',
      '<strong>WiFi is widely available</strong> in cafes, hotels, and public spaces, but avoid sensitive work on open networks—use a password-protected network or personal hotspot.'
    ];

    tipsData.categories = tipsData.categories.map((cat: any) => {
      if (cat.category?.toLowerCase() === 'internet & communication' && !isRestrictive) {
        // For open internet destinations, downshift importance and remove censorship/VPN-specific messaging
        const filteredTips = (cat.tips || []).filter(
          (tip: string) => !/(blocked|vpn|firewall|censorship|wechat|restricted|ban|filter)/i.test(tip)
        );

        const mergedTips = [...filteredTips, ...openInternetDefaultTips].slice(0, 5);

        return {
          ...cat,
          importance: cat.importance === 'Critical' ? 'Important' : (cat.importance || 'Important'),
          subtitle: 'Stay connected with local SIM/eSIM and reliable WiFi',
          emoji: cat.emoji || '📶',
          tips: mergedTips,
        };
      }
      return cat;
    });

    console.log('[Destination Tips] Generated', tipsData.categories.length, 'categories');

    // Cache the result
    cache.set(cacheKey, { data: tipsData, timestamp: Date.now() });

    return NextResponse.json(tipsData);

  } catch (error: any) {
    console.error('[Destination Tips] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate destination tips',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
