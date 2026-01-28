import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface Media {
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  caption: string;
}

interface MediaViewerProps {
  media: Media[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function MediaViewer({
  media,
  initialIndex,
  isOpen,
  onClose,
}: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentMedia = media[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
    setIsPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    const video = document.getElementById(
      'fullscreen-video'
    ) as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!isOpen || !currentMedia) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X className="size-6" />
          </button>

          {/* Navigation Buttons */}
          {media.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="size-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              >
                <ChevronRight className="size-8" />
              </button>
            </>
          )}

          {/* Media Counter */}
          <div className="absolute top-4 left-4 z-10 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-md">
            {currentIndex + 1} / {media.length}
          </div>

          {/* Media Content */}
          <div
            className="relative mx-4 mb-32 flex max-h-[90vh] w-full max-w-7xl flex-col items-center md:mb-28"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center"
              >
                {currentMedia.type === 'photo' ? (
                  <img
                    src={currentMedia.url}
                    alt={currentMedia.caption}
                    className="max-h-[70vh] w-auto rounded-lg object-contain shadow-2xl"
                  />
                ) : (
                  <div className="relative">
                    <video
                      id="fullscreen-video"
                      src={currentMedia.url}
                      controls
                      autoPlay
                      preload="metadata"
                      playsInline
                      className="max-h-[70vh] w-auto rounded-lg shadow-2xl"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onError={(e) => console.error('Video error:', e)}
                      onLoadedMetadata={() => console.log('Video metadata loaded')}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {/* Caption - Improved visibility and spacing */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 w-full max-w-3xl px-4"
                >
                  <div className="rounded-2xl border border-white/20 bg-gradient-to-b from-black/80 to-black/60 px-8 py-5 shadow-xl backdrop-blur-xl">
                    <p className="text-center text-base font-medium leading-relaxed text-white md:text-lg">
                      {currentMedia.caption}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Thumbnail Navigation */}
          {media.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-lg bg-white/10 px-4 py-2 backdrop-blur-md">
              {media.map((item, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                    setIsPlaying(false);
                  }}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    index === currentIndex
                      ? 'scale-110 border-white'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={item.type === 'video' ? item.thumbnail : item.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="size-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}