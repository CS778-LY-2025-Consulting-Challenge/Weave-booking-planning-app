'use client';

import { VideoCall } from '@/components/VideoCall';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface VideoCallModalProps {
  open: boolean;
  onClose: () => void;
  roomID?: string;
}

export function VideoCallModal({ open, onClose, roomID }: VideoCallModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col overflow-hidden bg-black">
      <div className="absolute right-4 top-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-10 w-10 rounded-full bg-white/80 text-gray-900 shadow-lg hover:bg-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <VideoCall roomID={roomID} />
    </div>
  );
}
