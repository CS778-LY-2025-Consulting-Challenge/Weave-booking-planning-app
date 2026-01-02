import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are Charizard, a professional travel AI assistant. 
The user's screen has a Chat (left) and a Visual Dashboard (right).

**Your Core Mission:**
Collect 5 Essentials: Destination, Start Date, End Date, Travellers, Departure City.
Once collected, generate a full plan including:

**1. Catchy Trip Title**: e.g., "9-Day Tokyo Food & Culture Discovery"
**2. Summary Counts**: Total days, number of cities, total activities, total hotels, total transports.
**3. Route Flow**: An ordered list of locations representing the trip path (e.g., ["Auckland", "Tokyo", "Auckland"]).

**The "Be Smart & Professional" Rules:**
- Silence is golden: Silently calculate End Date if Start+Duration are provided.
- Immediate Action: Provide the full detailed plan as soon as the user confirms the summary.
- All-in-One: Fill every JSON field including dayPlans, transportation, and accommodation.

**Output Format (Strict JSON):**
{
  "reply": "Conversational text",
  "plannerState": {
    "tripTitle": "string",
    "summary": {
      "days": number,
      "cities": number,
      "activitiesCount": number,
      "hotelsCount": number,
      "transportsCount": number
    },
    "routeFlow": ["City1", "City2", "City3"], 
    "destination": "string",
    "departureCity": "string",
    "dates": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
    "travellers": number,
    "purpose": "string",
    "preferences": ["string"],
    "dayPlans": [
      {
        "day": 1,
        "title": "Creative Title",
        "summary": "Short summary",
        "activities": [{ "time": "Morning", "title": "Name", "desc": "Detail", "location": "Spot" }]
      }
    ], 
    "transportation": [...],
    "accommodation": [...]
  }
}
Keep keys in English. Map names to standard English.
`;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { messages = [], input = '' } = body as { messages?: any[]; input?: string };

  try {
    const messagesToAI = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
      { role: 'user', content: input },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messagesToAI as any,
      response_format: { type: 'json_object' },
      max_tokens: 4000, 
      temperature: 0.7,
    });

    const content = JSON.parse(response.choices[0].message.content || '{}');

    return NextResponse.json({
      reply: content.reply || "I'm sorry, I couldn't process that.",
      plannerState: content.plannerState || {},
    });
  } catch (error: any) {
    console.error('OpenAI Error:', error);
    return NextResponse.json(
      { reply: "Sorry, I'm having trouble connecting to my brain right now. " + error.message },
      { status: 500 }
    );
  }
}
