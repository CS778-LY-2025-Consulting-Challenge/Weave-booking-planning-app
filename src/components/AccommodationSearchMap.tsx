'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Star, MapPin, Hotel } from 'lucide-react';
import { AccommodationSearchResult } from './AccommodationChangePanel';

// IMPORTANT: Keep this token consistent across ALL Mapbox maps in the app.
mapboxgl.accessToken =
  'pk.eyJ1IjoibW9vdmFsIiwiYSI6ImNtazJzYmJ1YzA2aDIzcW9xbWlhMGIxencifQ.HicBjVINhGc-IAZVBnsnwg';

interface AccommodationSearchMapProps {
  results: AccommodationSearchResult[];
  centerCoords?: { lat: number; lng: number };
  selectedResult?: AccommodationSearchResult | null;
  onSelectPlace: (place: AccommodationSearchResult) => void;
}

export default function AccommodationSearchMap({
  results,
  centerCoords,
  selectedResult,
  onSelectPlace,
}: AccommodationSearchMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [hoveredPlace, setHoveredPlace] = useState<AccommodationSearchResult | null>(null);
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
      console.warn('[AccommodationSearchMap] safeResize skipped:', err);
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
      console.log('[AccommodationSearchMap] Initializing map with center:', centerCoords);
      
      // Ensure coordinates are valid numbers
      const center: [number, number] = 
        centerCoords && !isNaN(centerCoords.lng) && !isNaN(centerCoords.lat)
          ? [centerCoords.lng, centerCoords.lat]
          : [139.75, 35.68];

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center,
        zoom: 12,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.on('load', () => {
        console.log('[AccommodationSearchMap] Map loaded successfully');
        setIsMapReady(true);
        safeResize(map);
      });

      mapRef.current = map;

      return () => {
        resizeObserver.disconnect();
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    } catch (error) {
      console.error('[AccommodationSearchMap] Initialization error:', error);
    }
  }, []);

  // Update markers when results or selection changes
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    syncMarkers();
  }, [isMapReady, results, selectedResult]);

  const syncMarkers = () => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (results.length === 0) return;

    console.log('[AccommodationSearchMap] Adding markers for', results.length, 'hotels');

    // Create markers for each hotel
    results.forEach((result, idx) => {
      const markerContainer = document.createElement('div');
      markerContainer.className = 'accommodation-map-marker-container';
      markerContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      `;

      // Price tag (main element)
      const el = document.createElement('div');
      el.className = 'accommodation-search-marker';
      const isSelected = selectedResult?.name === result.name;
      el.style.cssText = `
        background-color: ${isSelected ? '#9333ea' : '#ffffff'};
        border: 2px solid ${isSelected ? '#7c3aed' : '#9333ea'};
        color: ${isSelected ? '#ffffff' : '#9333ea'};
        padding: 6px 10px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 13px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: all 0.2s;
        white-space: nowrap;
        z-index: ${isSelected ? '100' : '10'};
      `;
      el.textContent = result.totalPrice;

      // Hotel name label (shows on hover)
      const nameLabel = document.createElement('div');
      nameLabel.className = 'accommodation-map-marker-label';
      nameLabel.style.cssText = `
        background-color: rgba(255,255,255,0.95);
        backdrop-filter: blur(4px);
        padding: 4px 8px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        color: #1f2937;
        margin-top: 4px;
        max-width: 150px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        opacity: 0;
        transition: all 0.2s;
        transform: translateY(5px);
      `;
      nameLabel.textContent = result.name;

      markerContainer.appendChild(el);
      markerContainer.appendChild(nameLabel);

      // Hover effects
      markerContainer.addEventListener('mouseenter', (e) => {
        el.style.boxShadow = '0 4px 12px rgba(147,51,234,0.4)';
        el.style.transform = 'scale(1.05)';
        nameLabel.style.opacity = '1';
        nameLabel.style.transform = 'translateY(0)';
        setHoveredPlace(result);
        setHoverPosition({ x: e.clientX, y: e.clientY });
      });

      markerContainer.addEventListener('mouseleave', () => {
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        el.style.transform = 'scale(1)';
        nameLabel.style.opacity = '0';
        nameLabel.style.transform = 'translateY(5px)';
        setHoveredPlace(null);
        setHoverPosition(null);
      });

      markerContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectPlace(result);
      });

      const marker = new mapboxgl.Marker({ element: markerContainer })
        .setLngLat([result.coords.lng, result.coords.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Fit bounds to show all hotels
    if (results.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      results.forEach(r => bounds.extend([r.coords.lng, r.coords.lat]));
      map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 800 });
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* Map Container */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Hide Mapbox watermarks */}
      <style jsx global>{`
        .mapboxgl-ctrl-logo,
        .mapboxgl-ctrl-attrib {
          display: none !important;
        }
      `}</style>

      {/* Hover Preview Card */}
      {hoveredPlace && hoverPosition && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: `${hoverPosition.x + 15}px`,
            top: `${hoverPosition.y - 10}px`,
          }}
        >
          <div className="rounded-lg border border-purple-200 bg-white p-3 shadow-xl max-w-xs">
            {/* Hotel Image */}
            {hoveredPlace.imageUrl ? (
              <div className="mb-2 h-32 w-full overflow-hidden rounded-md">
                <img
                  src={hoveredPlace.imageUrl}
                  alt={hoveredPlace.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="mb-2 h-32 w-full flex items-center justify-center bg-purple-50 rounded-md">
                <Hotel className="h-10 w-10 text-purple-300" />
              </div>
            )}

            <h4 className="mb-1 text-sm font-bold text-slate-900 line-clamp-2">
              {hoveredPlace.name}
            </h4>

            {hoveredPlace.rating && (
              <div className="mb-2 flex items-center gap-1">
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
                <span className="text-xs font-semibold text-slate-700">
                  {hoveredPlace.rating}
                </span>
                <span className="text-xs text-slate-500">
                  ({hoveredPlace.reviewCount?.toLocaleString()})
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">From</p>
                <p className="text-base font-bold text-purple-600">{hoveredPlace.totalPrice}</p>
              </div>
              {hoveredPlace.hotelType && (
                <span className="text-xs text-slate-500">{hoveredPlace.hotelType}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

