'use client';

import { useState } from 'react';
import { Send, Loader2, MapPin, Star, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  name: string;
  type: 'attraction' | 'food' | 'hotel';
  coords: { lat: number; lng: number };
  rating?: number;
  reviewCount?: number;
  duration?: string;
  price?: string;
  highlights?: string;
  address?: string;
  distance?: string;
}

interface Message {
  type: 'user' | 'ai';
  text: string;
}

interface ActivitySearchChatProps {
  city?: string;
  coords?: { lat: number; lng: number };
  onResultsUpdate: (results: SearchResult[]) => void;
  onSelectResult: (result: SearchResult) => void;
  selectedResult?: SearchResult | null;
}

export default function ActivitySearchChat({
  city,
  coords,
  onResultsUpdate,
  onSelectResult,
  selectedResult,
}: ActivitySearchChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'ai',
      text: `Hi! I can help you find alternative activities${city ? ` in ${city}` : ''}. Try searching for:\n• "Must-see landmarks"\n• "Best restaurants for dinner"\n• "Family-friendly activities"`,
    },
  ]);
  const [input, setInput] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!input.trim() || isSearching) return;

    const userQuery = input.trim();
    setInput('');
    setIsSearching(true);

    // Add user message
    setMessages((prev) => [...prev, { type: 'user', text: userQuery }]);

    try {
      const response = await fetch('/api/ai-planner/search-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userQuery,
          city,
          coords,
          context: {},
        }),
      });

      const data = await response.json();

      // Add AI reply
      setMessages((prev) => [...prev, { type: 'ai', text: data.reply || 'Here are some options:' }]);

      // Update results
      if (data.results && data.results.length > 0) {
        setResults(data.results);
        onResultsUpdate(data.results);
      } else {
        setMessages((prev) => [
          ...prev,
          { type: 'ai', text: "I couldn't find any activities matching your search. Try a different query!" },
        ]);
      }
    } catch (error) {
      console.error('[ActivitySearchChat] Error:', error);
      setMessages((prev) => [
        ...prev,
        { type: 'ai', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Message History */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                msg.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-900'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isSearching && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </div>
          </div>
        )}
      </div>

      {/* Search Results List */}
      {results.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            {results.length} Results Found
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((result, idx) => (
              <Card
                key={`${result.name}-${idx}`}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedResult?.name === result.name
                    ? 'border-2 border-blue-500 bg-blue-50'
                    : 'border border-slate-200 bg-white'
                }`}
                onClick={() => onSelectResult(result)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 mb-1 truncate">
                        {result.name}
                      </h4>
                      {result.rating && (
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-semibold text-slate-700">
                            {result.rating}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({result.reviewCount})
                          </span>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 text-xs">
                        {result.type && (
                          <Badge variant="secondary" className="text-xs">
                            {result.type}
                          </Badge>
                        )}
                        {result.duration && (
                          <span className="text-slate-600 flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {result.duration}
                          </span>
                        )}
                        {result.price && (
                          <span className="text-slate-600">
                            {result.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="border-t border-slate-200 bg-white p-4">
        <div className="flex gap-2">
          <Input
            placeholder={`Search activities${city ? ` in ${city}` : ''}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSearching}
            className="flex-1"
          />
          <Button
            onClick={handleSearch}
            disabled={!input.trim() || isSearching}
            size="icon"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

