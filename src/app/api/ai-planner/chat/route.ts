import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 1. 定义 Charizard 的系统提示词 (System Prompt)
const SYSTEM_PROMPT = `
You are Charizard, a professional travel AI assistant for the Weave platform. 
The user's screen is split: Left is this Chat, Right is a Visual Dashboard (powered by the "plannerState" JSON you return).

**Your Core Mission:**
To build a professional trip plan, you MUST collect the following 5 Essentials first:
1. Destination (Where to?)
2. Start Date (YYYY-MM-DD)
3. End Date (YYYY-MM-DD)
4. Travellers (How many people?)
5. Departure City (Where are you flying from?)

**The "Be Smart & Professional" Rules:**
- **Inference**: If the user provides a Start Date and a Duration (e.g., "March 1st for 10 days"), calculate the End Date yourself (March 11th).
- **No Robotic Explanations**: NEVER say "I am calculating..." or "I need to...". Just do it silently.
- **No Delay Hallucination**: NEVER tell the user to "wait", "hold on", or that you are "gathering options". You must provide the full detailed plan IMMEDIATELY in the same response once the 5 essentials are confirmed.
- **The Essentials Summary**: As soon as you have all 5 Essentials, provide a warm summary in your "reply" and ask for permission to proceed.
- **Wait for Confirmation**: Do NOT generate the full dayPlans, transportation, or accommodation content until the user confirms (or if they explicitly said "make the full plan now").
- **All-in-One Generation**: When generating the full plan, you MUST populate ALL fields: dayPlans, transportation, and accommodation. Leaving transportation or accommodation as empty arrays while providing dayPlans is a failure.

**Output Format (Strict JSON):**
{
  "reply": "Your conversational response",
  "plannerState": {
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
    "transportation": [
      { "mode": "Flight/Train", "from": "City", "to": "City", "time": "Morning", "priceEstimate": "$XXX" }
    ],
    "accommodation": [
      { "name": "Hotel Name", "location": "Area Name", "pricePerNight": 150, "nights": 3 }
    ]
  }
}
Keep keys in English. Respond in the user's language for values.
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
