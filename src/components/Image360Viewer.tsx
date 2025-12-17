import { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface Image360ViewerProps {
  imageUrl: string;
  width?: string;
  height?: string;
}

export function Image360Viewer({ imageUrl, width = '100%', height = '70vh' }: Image360ViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 180 });
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.src = imageUrl;
  }, [imageUrl]);

  // Draw panorama
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawFrame = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate visible portion of the panorama
      const imageWidth = image.width;
      const imageHeight = image.height;
      
      // Map rotation to image position (panorama wraps horizontally)
      const sourceX = ((rotation.y % 360) / 360) * imageWidth;
      const sourceY = Math.max(0, Math.min(imageHeight, (rotation.x / 180) * imageHeight * 0.5 + imageHeight * 0.25));
      
      // Calculate view width based on zoom
      const viewWidth = imageWidth / (zoom * 3);
      const viewHeight = imageHeight / (zoom * 2);

      // Draw the visible portion, wrapping if necessary
      const drawPortion = (offsetX: number) => {
        try {
          ctx.drawImage(
            image,
            (sourceX + offsetX) % imageWidth,
            Math.max(0, sourceY - viewHeight / 2),
            Math.min(viewWidth, imageWidth - sourceX),
            Math.min(viewHeight, imageHeight),
            offsetX === 0 ? 0 : canvas.width - (canvas.width * 0.3),
            0,
            canvas.width * (offsetX === 0 ? 1 : 0.3),
            canvas.height
          );
        } catch (e) {
          // Handle edge cases
        }
      };

      drawPortion(0);
      
      // Wrap around if at edge
      if (sourceX + viewWidth > imageWidth) {
        drawPortion(imageWidth - sourceX);
      }
    };

    drawFrame();
    
    // Auto-rotation
    const autoRotate = () => {
      if (!isDragging) {
        setRotation(prev => ({ ...prev, y: prev.y - 0.1 }));
      }
      animationRef.current = requestAnimationFrame(autoRotate);
    };
    
    animationRef.current = requestAnimationFrame(autoRotate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [image, rotation, zoom, isDragging]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastPos.x;
    const deltaY = e.clientY - lastPos.y;

    setRotation(prev => ({
      x: Math.max(-90, Math.min(90, prev.x + deltaY * 0.5)),
      y: prev.y - deltaX * 0.5
    }));

    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setLastPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - lastPos.x;
    const deltaY = e.touches[0].clientY - lastPos.y;

    setRotation(prev => ({
      x: Math.max(-90, Math.min(90, prev.x + deltaY * 0.5)),
      y: prev.y - deltaX * 0.5
    }));

    setLastPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.5, Math.min(3, prev + (e.deltaY > 0 ? -0.1 : 0.1))));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(3, prev + 0.2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.5, prev - 0.2));
  };

  const handleFullscreen = () => {
    if (canvasRef.current?.parentElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        canvasRef.current.parentElement.requestFullscreen();
      }
    }
  };

  return (
    <div className="relative" style={{ width, height }}>
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className={`w-full h-full bg-black ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      />
      
      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="size-5 text-slate-700" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="size-5 text-slate-700" />
        </button>
        <button
          onClick={handleFullscreen}
          className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-colors"
          title="Fullscreen"
        >
          <Maximize className="size-5 text-slate-700" />
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
        <p>🖱️ Drag to look around • Scroll to zoom</p>
      </div>

      {/* Loading state */}
      {!image && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading 360° panorama...</p>
          </div>
        </div>
      )}
    </div>
  );
}