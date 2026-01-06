'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// IMPORTANT: Keep this token consistent across ALL Mapbox maps in the app.
// We intentionally do NOT read from env here because an incorrect `.env.local`
// value would override and break all maps in dev.
mapboxgl.accessToken =
  'pk.eyJ1IjoibW9vdmFsIiwiYSI6ImNtazJzYmJ1YzA2aDIzcW9xbWlhMGIxencifQ.HicBjVINhGc-IAZVBnsnwg';

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

interface ActivitySearchMapProps {
  results: SearchResult[];
  centerCoords?: { lat: number; lng: number };
  selectedResult?: SearchResult | null;
  onSelectPlace: (place: SearchResult) => void;
}

export default function ActivitySearchMap({
  results,
  centerCoords,
  selectedResult,
  onSelectPlace,
}: ActivitySearchMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [hoveredPlace, setHoveredPlace] = useState<SearchResult | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  // Safe resize helper
  const safeResize = (map?: mapboxgl.Map | null) => {
    try {
      const m = map ?? mapRef.current;
      if (!m) return;
      const canvas = m.getCanvas?.();
      if (!canvas) return;
      m.resize();
    } catch (err) {
      console.warn('[ActivitySearchMap] safeResize skipped:', err);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Resize observer to handle Sheet animations
    const resizeObserver = new ResizeObserver(() => {
      safeResize();
    });
    resizeObserver.observe(mapContainerRef.current);

    try {
      console.log('[ActivitySearchMap] Initializing map with center:', centerCoords);
      
      // Ensure coordinates are valid numbers
      const center: [number, number] = 
        centerCoords && !isNaN(centerCoords.lng) && !isNaN(centerCoords.lat)
          ? [centerCoords.lng, centerCoords.lat]
          : [139.75, 35.68];

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: centerCoords ? 12 : 2,
        antialias: true,
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.on('load', () => {
        console.log('[ActivitySearchMap] Map load event fired');
        setIsMapReady(true);
        safeResize(map);
        // Force few more resizes during animation
        setTimeout(() => safeResize(map), 100);
        setTimeout(() => safeResize(map), 500);
      });

      mapRef.current = map;

      return () => {
        console.log('[ActivitySearchMap] Cleaning up map');
        resizeObserver.disconnect();
        setIsMapReady(false);
        map.remove();
        mapRef.current = null;
      };
    } catch (error) {
      console.error('[ActivitySearchMap] Error initializing map:', error);
    }
  }, []); // Only init once

  // Update center when centerCoords changes
  useEffect(() => {
    if (!mapRef.current || !centerCoords || !isMapReady) return;
    
    console.log('[ActivitySearchMap] Flying to new center:', centerCoords);
    mapRef.current.flyTo({
      center: [centerCoords.lng, centerCoords.lat],
      zoom: 12,
      essential: true
    });
  }, [centerCoords, isMapReady]);

  // Update markers when results change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    // Polling check for style load
    const syncMarkers = () => {
      if (!map.isStyleLoaded()) {
        setTimeout(syncMarkers, 100);
        return;
      }

      console.log('[ActivitySearchMap] Syncing markers:', results.length);
      
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers
      results.forEach((result, idx) => {
        const el = document.createElement('div');
        el.className = 'activity-search-marker';
        el.style.cssText = `
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: ${selectedResult?.name === result.name ? '#3b82f6' : '#ffffff'};
          border: 3px solid ${selectedResult?.name === result.name ? '#1e40af' : '#3b82f6'};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: bold;
          font-size: 14px;
          color: ${selectedResult?.name === result.name ? '#ffffff' : '#3b82f6'};
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: all 0.2s;
          z-index: ${selectedResult?.name === result.name ? '100' : '10'};
        `;
        el.textContent = String(idx + 1);

        // Hover effects
        el.addEventListener('mouseenter', (e) => {
          el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
          el.style.borderWidth = '4px';
          setHoveredPlace(result);
          setHoverPosition({ x: e.clientX, y: e.clientY });
        });

        el.addEventListener('mouseleave', () => {
          el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
          el.style.borderWidth = '3px';
          setHoveredPlace(null);
          setHoverPosition(null);
        });

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectPlace(result);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([result.coords.lng, result.coords.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });

      // Fit map to show all markers
      if (results.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        results.forEach(result => {
          bounds.extend([result.coords.lng, result.coords.lat]);
        });
        map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 1500 });
      }
    };

    syncMarkers();
  }, [results, selectedResult, isMapReady, onSelectPlace]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Hover Preview Card */}
      {hoveredPlace && hoverPosition && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: `${hoverPosition.x + 15}px`,
            top: `${hoverPosition.y - 50}px`,
          }}
        >
          <Card className="w-64 shadow-xl">
            <CardContent className="p-3">
              <h4 className="font-bold text-sm text-slate-900 mb-1">
                {hoveredPlace.name}
              </h4>
              {hoveredPlace.rating && (
                <div className="flex items-center gap-1 text-xs mb-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{hoveredPlace.rating}</span>
                  <span className="text-slate-400">({hoveredPlace.reviewCount})</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-slate-600">
                {hoveredPlace.duration && <span>⏱️ {hoveredPlace.duration}</span>}
                {hoveredPlace.price && <span>💰 {hoveredPlace.price}</span>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Selected Place Detail Card */}
      {selectedResult && (
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <Card className="bg-white shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                    <h3 className="font-bold text-base text-slate-900 truncate">
                      {selectedResult.name}
                    </h3>
                  </div>
                  
                  {selectedResult.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-slate-900">
                        {selectedResult.rating}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({selectedResult.reviewCount} reviews)
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                    {selectedResult.highlights}
                  </p>

                  <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                    {selectedResult.duration && (
                      <span className="flex items-center gap-1">
                        ⏱️ {selectedResult.duration}
                      </span>
                    )}
                    {selectedResult.price && (
                      <span className="flex items-center gap-1">
                        💰 {selectedResult.price}
                      </span>
                    )}
                    {selectedResult.distance && (
                      <span className="flex items-center gap-1">
                        📍 {selectedResult.distance}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectPlace(null as any)}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

