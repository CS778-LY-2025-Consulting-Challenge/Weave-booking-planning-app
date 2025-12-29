"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { format } from 'date-fns';

interface Guide {
  id: number;
  name: string;
  country: string;
  image: string;
}

interface VideoCallPopoutProps {
  open: boolean;
  onClose: () => void;
  guide: Guide;
  appointmentDate?: Date;
  appointmentTime?: string;
}

export function VideoCallPopout({
  open,
  onClose,
  guide,
  appointmentDate,
  appointmentTime,
}: VideoCallPopoutProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    if (!open) {
      setCallDuration(0);
      setIsConnecting(true);
      return;
    }

    // Simulate connection delay
    const connectTimer = setTimeout(() => {
      setIsConnecting(false);
    }, 2000);

    // Call duration counter
    const durationInterval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(durationInterval);
    };
  }, [open]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    onClose();
    setCallDuration(0);
    setIsConnecting(true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        className={`relative flex flex-col overflow-hidden rounded-2xl bg-gray-900 shadow-2xl transition-all ${
          isFullscreen
            ? 'h-full w-full'
            : 'h-[600px] w-full max-w-5xl'
        }`}
      >
        {/* Header Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 animate-pulse rounded-full bg-green-500/50 blur-sm" />
                <div className="relative h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  Live session with {guide.name}
                </div>
                <div className="text-xs text-white/70">
                  {isConnecting ? 'Connecting...' : formatDuration(callDuration)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-9 w-9 text-white hover:bg-white/10"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Video Area */}
        <div className="relative flex-1">
          {/* Guide's "video" (placeholder with avatar) */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800">
            {isConnecting ? (
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-white" />
                </div>
                <p className="text-lg text-white">Connecting to {guide.name}...</p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <Avatar className="mx-auto mb-4 h-32 w-32 border-4 border-white/20">
                    <AvatarImage src={guide.image} alt={guide.name} />
                    <AvatarFallback className="text-4xl">{guide.name[0]}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-2xl font-semibold text-white">{guide.name}</h3>
                  <p className="mt-1 text-white/70">Local expert from {guide.country}</p>
                </div>

                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/4 left-1/4 h-64 w-64 animate-pulse rounded-full bg-white/10 blur-3xl" />
                  <div className="absolute bottom-1/4 right-1/4 h-64 w-64 animate-pulse rounded-full bg-white/10 blur-3xl animation-delay-1000" />
                </div>
              </>
            )}
          </div>

          {/* User's video (small picture-in-picture) */}
          {!isConnecting && (
            <div className="absolute bottom-6 right-6 h-32 w-40 overflow-hidden rounded-xl border-2 border-white/20 bg-gray-800 shadow-xl sm:h-40 sm:w-52">
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                {isVideoOn ? (
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-600">
                      <span className="text-lg font-semibold text-white">You</span>
                    </div>
                    <p className="text-xs text-white/60">Your camera</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <VideoOff className="mx-auto mb-2 h-8 w-8 text-white/60" />
                    <p className="text-xs text-white/60">Camera off</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Control Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-6 py-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setIsMuted(!isMuted)}
              className={`h-14 w-14 rounded-full ${
                isMuted
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isMuted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`h-14 w-14 rounded-full ${
                !isVideoOn
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isVideoOn ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={handleEndCall}
              className="h-14 w-14 rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              <Phone className="h-5 w-5 rotate-135" />
            </Button>
          </div>

          {appointmentDate && appointmentTime && (
            <div className="mt-4 text-center">
              <p className="text-xs text-white/50">
                Scheduled: {format(appointmentDate, 'MMM d')} at {appointmentTime}
              </p>
            </div>
          )}
        </div>

        {/* Connection quality indicator */}
        {!isConnecting && (
          <div className="absolute top-20 right-6 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                <div className="h-3 w-1 rounded-full bg-green-500" />
                <div className="h-3 w-1 rounded-full bg-green-500" />
                <div className="h-3 w-1 rounded-full bg-green-500" />
                <div className="h-3 w-1 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-white/90">HD</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
