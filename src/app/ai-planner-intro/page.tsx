'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Mic, Send, Plane } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function AIPlannerIntro() {
  const router = useRouter();
  const { user } = useUser();
  const [inputValue, setInputValue] = useState('');
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);
  const [mouseY, setMouseY] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const handlePlanTrip = () => {
    if (inputValue.trim()) {
      // Navigate to AI planner with initial message as URL parameter
      router.push(`/ai-planner?initialMessage=${encodeURIComponent(inputValue)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      handlePlanTrip();
    }
  };

  // Get user's first name or default to a friendly greeting
  const userName = user?.firstName || user?.username || 'Traveler';

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle mouse movement to show/hide navbar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
      // Show navbar when mouse is in top 80px of screen
      setIsNavbarVisible(e.clientY < 80);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/images/new zealand video.mp4" type="video/mp4" />
        <source src="/images/andrea-1.mp4" type="video/mp4" />
      </video>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Navbar with hover-to-show behavior - Only render on client */}
      {isMounted && (
        <div
          className={`fixed left-0 right-0 top-0 z-50 transition-transform duration-300 ${
            isNavbarVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <Navbar />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header with Logo - Hidden as per requirement */}
        <header className="hidden items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Weave</span>
            </div>
          </div>

          {/* Currency and Settings (optional) */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            >
              NZ$
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-24">
          <div className="w-full max-w-4xl space-y-8 text-center">
            {/* Greeting */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                Hey {userName}, where are we going today?
              </h1>
              <p className="text-lg text-white/90 md:text-xl">
                Tell me your style and budget, and I'll design a trip for you.
              </p>
            </div>

            {/* Input Box */}
            <div className="relative mx-auto max-w-3xl">
              <div className="rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Best way to explore London in 4 days without missing top sights"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 border-none bg-transparent text-lg outline-none placeholder:text-gray-400"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <Mic className="size-5" />
                  </Button>
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:bg-gray-100"
                  >
                    📎 Attach
                  </Button>
                  <Button
                    onClick={handlePlanTrip}
                    disabled={!inputValue.trim()}
                    className="gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="size-5" />
                    Plan my trip
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                className="rounded-full border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                onClick={() => setInputValue('Create a new trip')}
              >
                Create a new trip
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                onClick={() => setInputValue('Inspire me where to go')}
              >
                Inspire me where to go
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                onClick={() => setInputValue('Plan a road trip')}
              >
                Plan a road trip
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                onClick={() => setInputValue('Plan a last-minute escape')}
              >
                Plan a last-minute escape
              </Button>
            </div>

            {/* See how I can help you */}
            <div className="pt-8">
              <button className="text-white/80 transition-colors hover:text-white">
                See how I can help you ↓
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
