'use client';

import { useEffect, useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import CharizardOrb from './CharizardOrb';
import { usePathname, useRouter } from 'next/navigation';

interface ChatMessage {
  type: 'ai' | 'user';
  text: string;
}

export default function AIChat() {
  const pathname = usePathname();
  const router = useRouter();

  const shouldDelayVisibility = pathname === '/';
  const [hasReachedScrollThreshold, setHasReachedScrollThreshold] = useState(!shouldDelayVisibility);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: 'ai',
      text: "Hey, I'm Charizard 🔥 Your AI travel co-pilot. Tell me where you're flying from and the kind of trip you want.",
    },
  ]);
  const [input, setInput] = useState('');

  // Hide the floating assistant on the dedicated AI Planner page and AI Planner Intro page to avoid redundancy
  if (pathname === '/ai-planner' || pathname === '/ai-planner-intro') return null;

  useEffect(() => {
    if (!shouldDelayVisibility) {
      setHasReachedScrollThreshold(true);
      return;
    }

    const SCROLL_TRIGGER = 900; // slightly below TripsSection
    const handleScrollGate = () => {
      const isPastThreshold = window.scrollY > SCROLL_TRIGGER;
      setHasReachedScrollThreshold((prev) =>
        prev !== isPastThreshold ? isPastThreshold : prev
      );
    };

    setHasReachedScrollThreshold(false);
    window.addEventListener('scroll', handleScrollGate, { passive: true });
    handleScrollGate();
    return () => window.removeEventListener('scroll', handleScrollGate);
  }, [shouldDelayVisibility]);

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { type: 'user', text: input }]);

    const responses = [
      'That sounds epic. Share your dates and rough budget and I’ll weave a 5-day journey for you.',
      'Nice! Do you want more nature, nightlife, food, or culture for this trip?',
      'Got it. I can build a day-by-day plan + flights. Prefer relaxed or fast-paced?',
      'Love that idea. Are you travelling solo, with friends, or as a couple?',
    ];
    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];

    setTimeout(
      () =>
        setMessages((prev) => [...prev, { type: 'ai', text: randomResponse }]),
      800
    );

    setInput('');
  };

  if (!hasReachedScrollThreshold) {
    return null;
  }

  /* ───────────── CLOSED STATE (floating pill) ───────────── */
  if (!isOpen) {
    return (
      <motion.button
        type="button"
        onClick={() => router.push('/ai-planner-intro')}
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        aria-label="Open Charizard travel assistant"
      >
        <div className="group flex items-center gap-3 rounded-full bg-slate-950/80 px-2 py-2 pr-5 text-left text-white shadow-[0_25px_60px_rgba(0,0,0,0.7)] backdrop-blur-lg border border-orange-300/40">
          {/* Orb */}
          <div className="relative flex items-center justify-center">
            <CharizardOrb />
            <motion.div
              className="absolute -right-1 bottom-0 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] text-orange-200 border border-orange-300/60"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              AI
            </motion.div>
          </div>

          {/* Text */}
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.26em] text-orange-200/80">
              <Sparkles className="h-3 w-3" />
              Travel Co-Pilot
            </span>
            <span className="text-sm font-semibold">
              Plan trips with Charizard
            </span>
            <span className="text-[11px] text-orange-100/80">
              Tap to ignite a custom itinerary
            </span>
          </div>
        </div>
      </motion.button>
    );
  }

  /* ───────────── OPEN STATE (chat window) ───────────── */
  return (
    <AnimatePresence>
      <motion.div
        key="charizard-chat"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed bottom-6 right-6 z-50 max-w-[90vw]"
      >
        <Card className="flex h-[480px] w-[380px] max-w-full flex-col overflow-hidden rounded-3xl border border-orange-300/40 bg-slate-950/95 shadow-[0_30px_80px_rgba(0,0,0,0.75)] backdrop-blur-xl">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              {/* Orb on the left, not overlapping text */}
              <CharizardOrb />

              <div className="flex flex-col leading-tight">
                <span className="text-[11px] font-semibold tracking-[0.16em] text-white/85">
                  TRAVEL AI AGENT
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-[15px] font-semibold text-white drop-shadow-sm">
                  Charizard
                </span>
                <span className="mt-0.5 text-[11px] text-white/90">
                  Ignite your next itinerary
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="rounded-full text-white hover:bg-white/15"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>



          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-black px-3 py-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-[0_10px_25px_rgba(0,0,0,0.6)] ${message.type === 'user'
                    ? 'rounded-br-sm bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                    : 'rounded-bl-sm bg-white/10 text-slate-50 border border-white/10'
                    }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-white/10 bg-slate-950/95 px-3 py-2">
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-2 py-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tell Charizard your origin, dates & dream trip..."
                className="border-none bg-transparent text-xs text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                onClick={handleSend}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence >
  );
}