'use client';

import { useEffect, useRef } from 'react';

interface VideoCallProps {
  roomID?: string;
  className?: string;
}

declare global {
  interface Window {
    ZegoUIKitPrebuilt?: any;
  }
}

export function VideoCall({ roomID, className }: VideoCallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const zegoInstanceRef = useRef<any>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let isMounted = true;

    const loadZegoScript = () =>
      new Promise<void>((resolve) => {
        if (window.ZegoUIKitPrebuilt) {
          resolve();
          return;
        }

        const existingScript = document.getElementById('zego-uikit-prebuilt');
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve());
          return;
        }

        const script = document.createElement('script');
        script.id = 'zego-uikit-prebuilt';
        script.src = 'https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js';
        script.async = true;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });

    const initializeZego = async () => {
      await loadZegoScript();
      if (!window.ZegoUIKitPrebuilt || !isMounted) return;

      const resolvedRoomID = roomID && roomID.trim() !== ''
        ? roomID
        : `${Math.floor(Math.random() * 10000)}`;
      const userID = `${Math.floor(Math.random() * 10000)}`;
      const userName = `userName${userID}`;
      const appID = 324852437;
      const serverSecret = '8899e857ac94dc08dd04f69e0900cfc5';

      const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        resolvedRoomID,
        userID,
        userName
      );

      try {
        zegoInstanceRef.current = window.ZegoUIKitPrebuilt.create(kitToken);
        zegoInstanceRef.current.joinRoom({
          container,
          sharedLinks: [
            {
              name: 'Personal link',
              url: `${window.location.origin}${window.location.pathname}?roomID=${resolvedRoomID}`,
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
      isMounted = false;
      if (zegoInstanceRef.current) {
        try {
          zegoInstanceRef.current.destroy();
        } catch (error) {
          console.error('Error destroying Zego instance:', error);
        }
      }
    };
  }, [roomID]);

  const containerClassName = ['flex-1', 'w-full', 'h-full', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={{ minHeight: '100vh' }}
    />
  );
}
