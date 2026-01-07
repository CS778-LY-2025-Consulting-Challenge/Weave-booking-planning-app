'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import AttractionDetailPanel from './AttractionDetailPanel';

// IMPORTANT: Keep this token consistent across ALL Mapbox maps in the app.
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
  imageUrl?: string;
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
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<SearchResult | null>(null);

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

      // Add new markers with name labels
      results.forEach((result, idx) => {
        // Create marker container
        const container = document.createElement('div');
        container.className = 'activity-marker-container';
        container.style.cssText = `
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        `;

        // Create circular marker
        const el = document.createElement('div');
        el.className = 'activity-search-marker';
        el.style.cssText = `
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: ${selectedResult?.name === result.name ? '#3b82f6' : '#ffffff'};
          border: 3px solid ${selectedResult?.name === result.name ? '#1e40af' : '#3b82f6'};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: bold;
          font-size: 16px;
          color: ${selectedResult?.name === result.name ? '#ffffff' : '#3b82f6'};
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: all 0.2s;
          margin-bottom: 4px;
        `;
        el.textContent = String(idx + 1);

        // Create name label
        const label = document.createElement('div');
        label.className = 'marker-label';
        label.style.cssText = `
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #1e293b;
          white-space: nowrap;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          text-align: center;
        `;
        label.textContent = result.name;

        container.appendChild(el);
        container.appendChild(label);

        // Hover effects
        container.addEventListener('mouseenter', (e) => {
          el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
          el.style.borderWidth = '4px';
          el.style.transform = 'scale(1.1)';
          label.style.transform = 'scale(1.05)';
          setHoveredPlace(result);
          setHoverPosition({ x: e.clientX, y: e.clientY });
        });

        container.addEventListener('mouseleave', () => {
          el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
          el.style.borderWidth = '3px';
          el.style.transform = 'scale(1)';
          label.style.transform = 'scale(1)';
          setHoveredPlace(null);
          setHoverPosition(null);
        });

        container.addEventListener('click', (e) => {
          e.stopPropagation();
          // Open detail panel instead of selecting
          setSelectedAttraction(result);
          setDetailPanelOpen(true);
        });

        const marker = new mapboxgl.Marker({ element: container, anchor: 'bottom' })
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
  }, [results, selectedResult, isMapReady]);

  return (
    <div className="relative h-full w-full">
      <style dangerouslySetInnerHTML={{__html: `
        .mapboxgl-ctrl-logo {
          display: none !important;
        }
        .mapboxgl-ctrl-attrib {
          display: none !important;
        }
        .marker-label {
          transition: transform 0.2s ease;
        }
        .activity-search-marker {
          transition: all 0.2s ease;
        }
      `}} />
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Enhanced Hover Preview Card with Image */}
      {hoveredPlace && hoverPosition && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: `${hoverPosition.x + 15}px`,
            top: `${hoverPosition.y - 80}px`,
          }}
        >
          <Card className="w-72 shadow-2xl overflow-hidden">
            {/* Image */}
            {hoveredPlace.imageUrl && (
              <div className="relative h-32 w-full bg-slate-200">
                <img
                  src={hoveredPlace.imageUrl}
                  alt={hoveredPlace.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )}
            
            <CardContent className="p-3">
              <h4 className="font-bold text-sm text-slate-900 mb-2 line-clamp-1">
                {hoveredPlace.name}
              </h4>
              {hoveredPlace.rating && (
                <div className="flex items-center gap-1 text-xs mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(hoveredPlace.rating!)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-slate-900">{hoveredPlace.rating}</span>
                  <span className="text-slate-400">({hoveredPlace.reviewCount})</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-slate-600">
                {hoveredPlace.duration && <span>⏱️ {hoveredPlace.duration}</span>}
                {hoveredPlace.price && <span className="font-semibold text-green-700">💰 {hoveredPlace.price}</span>}
              </div>
              <p className="text-xs text-slate-500 mt-2 italic">Click to view details</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attraction Detail Panel */}
      <AttractionDetailPanel
        isOpen={detailPanelOpen}
        onClose={() => setDetailPanelOpen(false)}
        attraction={selectedAttraction}
      />
    </div>
  );
}
