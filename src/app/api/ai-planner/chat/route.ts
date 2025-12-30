import { NextResponse } from 'next/server';

interface Message {
  type: 'user' | 'ai';
  text: string;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { messages = [], input = '' } = body as { messages?: Message[]; input?: string };

  const replyPool = [
    'Great! Share your dates, travellers, and budget so I can shape a plan.',
    'Noted. Do you prefer more food, culture, or nightlife?',
    'Got it. I can add flights and a day-by-day plan. Relaxed or packed days?',
    'Nice choice. Any must-see spots or allergies I should know?',
  ];
  const reply = replyPool[Math.floor(Math.random() * replyPool.length)];

  // Return a tiny mocked planner state update (optional)
  const plannerState = {
    destination: 'Tokyo',
    travellers: 2,
    dates: { durationDays: 14 },
    preferences: ['food', 'culture'],
  };

  return NextResponse.json({
    reply,
    echo: input,
    messages,
    plannerState,
  });
}


