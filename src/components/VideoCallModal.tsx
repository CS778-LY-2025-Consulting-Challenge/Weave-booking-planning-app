'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface VideoCallModalProps {
  open: boolean;
  onClose: () => void;
  roomID?: string;
}

declare global {
  interface Window {
    ZegoUIKitPrebuilt: any;
  }
}

export function VideoCallModal({ open, onClose, roomID }: VideoCallModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const zegoInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!open || !containerRef.current) return;

    // Dynamically load Zego script if not already loaded
    const loadZegoScript = () => {
      return new Promise((resolve) => {
        if (window.ZegoUIKitPrebuilt) {
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js';
        script.onload = () => {
          resolve(true);
        };
        document.head.appendChild(script);
      });
    };

    const initializeZego = async () => {
      await loadZegoScript();

      if (!window.ZegoUIKitPrebuilt) return;

      // Generate room and user IDs
      const generatedRoomID = roomID || (Math.floor(Math.random() * 10000) + '');
      const userID = Math.floor(Math.random() * 10000) + '';
      const userName = 'userName' + userID;
      const appID = 324852437;
      const serverSecret = '8899e857ac94dc08dd04f69e0900cfc5';

      // Generate token
      const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        generatedRoomID,
        userID,
        userName
      );

      // Create Zego instance
      try {
        zegoInstanceRef.current = window.ZegoUIKitPrebuilt.create(kitToken);
        zegoInstanceRef.current.joinRoom({
          container: containerRef.current,
          sharedLinks: [
            {
              name: 'Personal link',
              url: `${window.location.origin}${window.location.pathname}?roomID=${generatedRoomID}`,
            },
          ],
          scenario: {
            mode: window.ZegoUIKitPrebuilt.VideoConference,
          },
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: true,
          showTextChat: true,
          showUserList: true,
          maxUsers: 50,
          layout: 'Auto',
          showLayoutButton: true,
        });
      } catch (error) {
        console.error('Error initializing Zego:', error);
      }
    };

    initializeZego();

    return () => {
      // Cleanup Zego instance
      if (zegoInstanceRef.current) {
        try {
          zegoInstanceRef.current.destroy();
        } catch (error) {
          console.error('Error destroying Zego instance:', error);
        }
      }
    };
  }, [open, roomID]);

  if (!open) return null;

  return (
    <>
      {/* Full Screen Video Call Container */}
      <div className="fixed inset-0 z-50 w-screen h-screen bg-black overflow-hidden flex flex-col">
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 bg-white/80 hover:bg-white text-gray-900 rounded-full shadow-lg"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Video Call Container - Full Screen */}
        <div
          ref={containerRef}
          className="flex-1 w-full h-full"
          style={{
            minHeight: '100vh',
          }}
        />
      </div>
    </>
  );
}
