'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Star, MapPin, Phone, Globe, Clock, Loader2 } from 'lucide-react';
import PlaceDetailPanel from './PlaceDetailPanel';

mapboxgl.accessToken =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ??
  'pk.eyJ1IjoibW9vdmFsIiwiYSI6ImNtanlhejZvbzZpNXMzZHB1Y3NmODA4eXQifQ.zRCSDUXg9OT2rpdA8tMOYQ';

interface TripMapProps {
  cityPoints?: Array<{ name: string; lat: number; lng: number }>;
  attractionPoints?: Array<{ name: string; lat: number; lng: number; type?: string; day?: number; rating?: number; reviewCount?: number }>;
  isDetailPanelOpen: boolean;
  setIsDetailPanelOpen: (isOpen: boolean) => void;
  selectedPlace: any;
  setSelectedPlace: (place: any) => void;
}

const TripMap: React.FC<TripMapProps> = ({ 
  cityPoints = [], 
  attractionPoints = [],
  isDetailPanelOpen,
  setIsDetailPanelOpen,
  selectedPlace,
  setSelectedPlace
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const globalBoundsRef = useRef<mapboxgl.LngLatBounds | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const previewCacheRef = useRef<Map<string, any>>(new Map());
  const [isMapReady, setIsMapReady] = useState(false);
  const [hoveredData, setHoveredData] = useState<any>(null);
  const [isHoverLoading, setIsHoverLoading] = useState(false);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });

  // Helper: Extract real place name from activity description
  const extractPlaceName = (activityName: string): string => {
    // Remove common activity prefixes like "Dinner at", "Lunch at", "Visit", etc.
    const patterns = [
      /^(Dinner|Lunch|Breakfast|Brunch|Snack|Coffee|Tea|Drinks)\s+at\s+/i,
      /^(Visit|Explore|Tour|See|Discover|Experience)\s+/i,
      /^(Check[- ]in|Stay|Accommodation)\s+at\s+/i,
      /^(Cruise|Walk|Hike|Drive)\s+(on|through|along|at)\s+/i,
    ];
    
    let cleanedName = activityName;
    for (const pattern of patterns) {
      cleanedName = cleanedName.replace(pattern, '');
    }
    
    console.log('[TripMap] Extracted place name:', cleanedName, 'from:', activityName);
    return cleanedName.trim();
  };

  // Safe resize to avoid "Cannot set properties of undefined (width)"
  const safeResize = (map?: mapboxgl.Map | null) => {
    try {
      const m = map ?? mapRef.current;
      if (!m) return;
      const canvas = m.getCanvas?.();
      if (!canvas) return;
      m.resize();
    } catch (err) {
      console.warn('[TripMap] safeResize skipped:', err);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Resize observer to handle Dialog animations
    const resizeObserver = new ResizeObserver(() => {
      safeResize();
    });
    resizeObserver.observe(mapContainerRef.current);

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: cityPoints[0] ? [cityPoints[0].lng, cityPoints[0].lat] : [139.75, 35.68],
      zoom: cityPoints[0] ? 3 : 1.5,
      projection: { name: 'globe' },
      antialias: true,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

    map.on('style.load', () => {
      map.setFog({
        range: [0.5, 10],
        color: '#dcdefa',
        'horizon-blend': 0.1,
        'high-color': '#245cdf',
        'space-color': '#000000',
        'star-intensity': 0.5,
      });

      if (!map.getSource('mapbox-dem')) {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
      }
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
    });

    map.on('load', () => {
      console.log('[TripMap Init] Map load event fired');
      setIsMapReady(true);
      safeResize(map);
      setTimeout(() => safeResize(map), 200);
      setTimeout(() => safeResize(map), 800);
    });

    return () => {
      console.log('[TripMap Init] Cleanup - resetting state');
      setIsMapReady(false); // Reset ready state on unmount
      
      // Clear hover timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      resizeObserver.disconnect();
      try {
        map.remove();
      } catch (err) {
        console.warn('[TripMap] map.remove error (ignored):', err);
      }
    };
  }, []); // Intentionally empty - only init once on mount

  // Sync markers and route - with forced trigger
  useEffect(() => {
    const map = mapRef.current;
    console.log('[TripMap Sync] Effect triggered', { 
      hasMap: !!map, 
      isMapReady, 
      isStyleLoaded: map?.isStyleLoaded(),
      citiesCount: cityPoints?.length,
      attractionsCount: attractionPoints?.length 
    });

    if (!map || !isMapReady) {
      console.log('[TripMap Sync] Skipping - map not ready');
      return;
    }

    // Wait for style to be fully loaded before syncing
    const syncMarkersAndRoute = () => {
      if (!map.isStyleLoaded()) {
        console.log('[TripMap Sync] Style not loaded yet, waiting...');
        setTimeout(syncMarkersAndRoute, 100);
        return;
      }

      console.log('[TripMap Sync] Starting sync...');

      // Handler for hover effects
      const handleMarkerHover = async (p: any, e: MouseEvent) => {
        console.log('[TripMap] Marker hover triggered for:', p.name, 'at position:', e.clientX, e.clientY);
        
        // Clear any pending hide timeout
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
        
        // Cancel any pending request
        if (abortControllerRef.current) {
          console.log('[TripMap] Canceling previous request');
          abortControllerRef.current.abort();
        }
        
        const isCity = cities.some(cp => cp.name === p.name);
        if (isCity) {
          console.log('[TripMap] Skipping city hover (cities use popup)');
          return; // Skip cities for now, focus on attractions/food/hotels
        }

        // Check cache first
        const cacheKey = `${p.name}-${p.lat}-${p.lng}`;
        const cached = previewCacheRef.current.get(cacheKey);
        if (cached) {
          console.log('[TripMap] Using cached data for:', p.name);
          setPreviewPos({ x: e.clientX, y: e.clientY });
          setHoveredData({ ...p, ...cached, isLoading: false });
          return;
        }

        setPreviewPos({ x: e.clientX, y: e.clientY });
        setHoveredData({ ...p, isLoading: true });
        setIsHoverLoading(true);

        // Create new AbortController for this request
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
          console.log('[TripMap] Fetching place details from API...');
          
          // Extract real place name for better API results
          const realPlaceName = extractPlaceName(p.name);
          
          const res = await fetch(
            `/api/places/search?name=${encodeURIComponent(realPlaceName)}&lat=${p.lat}&lng=${p.lng}`,
            { signal: controller.signal }
          );
          
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          
          const data = await res.json();
          console.log('[TripMap] Place details received:', data);
          
          // Cache the result
          previewCacheRef.current.set(cacheKey, data);
          
          // Only update state if this request wasn't aborted
          if (!controller.signal.aborted) {
            setHoveredData({ ...p, ...data, isLoading: false });
          }
        } catch (err: any) {
          if (err.name === 'AbortError') {
            console.log('[TripMap] Request aborted (user moved to another marker)');
          } else {
            console.error('[TripMap] Hover fetch error:', err);
            if (!controller.signal.aborted) {
              setHoveredData({ ...p, isLoading: false });
            }
          }
        } finally {
          if (!controller.signal.aborted) {
            setIsHoverLoading(false);
          }
        }
      };

      const handleMarkerLeave = () => {
        console.log('[TripMap] Marker hover ended, scheduling preview hide in 800ms...');
        
        // Clear any existing timeout
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
        
        // Delay hiding the preview card by 800ms
        hoverTimeoutRef.current = setTimeout(() => {
          console.log('[TripMap] Preview card hidden');
          setHoveredData(null);
          setIsHoverLoading(false);
          hoverTimeoutRef.current = null;
        }, 800);
      };

      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      const cities = cityPoints || [];
      const attractions = attractionPoints || [];
      console.log('[TripMap Sync] Cities:', cities.length, 'Attractions:', attractions.length);
      
      if (cities.length === 0 && attractions.length === 0) {
        console.log('[TripMap Sync] No points to display');
        return;
      }

      // IMPORTANT: Add attractions FIRST (lower layer), then cities SECOND (top layer)
      const allPoints = [...attractions, ...cities];
      console.log('[TripMap Sync] Adding markers in order: attractions first, cities on top');

      // Build city index map for numbering (excluding departure and return)
      const cityIndexMap = new Map<string, number>();
      let destinationNumber = 1;
      cities.forEach((city, idx) => {
        // Skip first city (departure) and last city if it's same as first (return)
        if (idx === 0) return;
        if (idx === (cities.length - 1) && city.name === cities[0]?.name) return;
        
        // Assign number to destination cities
        if (!cityIndexMap.has(city.name)) {
          cityIndexMap.set(city.name, destinationNumber++);
        }
      });

      // Add Markers
      allPoints.forEach((p, idx) => {
        const isCity = cities.some(cp => cp.name === p.name);
        const isDeparture = p.name === cities[0]?.name;
        const cityNumber = cityIndexMap.get(p.name);
        const isNumberedDestination = cityNumber !== undefined;

        console.log(`[TripMap Sync] Adding marker ${idx}: ${p.name} at [${p.lng}, ${p.lat}] - City:${isCity}, Departure:${isDeparture}, Number:${cityNumber}, Type:${(p as any).type || 'unknown'}`);

        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.cursor = 'pointer';

        if (isDeparture && !isNumberedDestination) {
          // Departure city: Blue dot
          el.style.width = '24px';
          el.style.height = '24px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = '#3b82f6';
          el.style.border = '3px solid white';
          el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
          el.style.zIndex = '1000'; // High priority
          el.style.transition = 'box-shadow 0.2s, border-width 0.2s';

          // Add click event to zoom into the departure city
          el.addEventListener('click', () => {
            console.log(`[TripMap] Zooming to departure city ${p.name} at [${p.lng}, ${p.lat}]`);
            map.flyTo({
              center: [p.lng, p.lat],
              zoom: 10, // City overview level - shows wider area
              duration: 2000,
              essential: true
            });
            
            // Visual feedback: pulse shadow effect
            el.style.boxShadow = '0 0 25px rgba(59,130,246,0.9)';
            setTimeout(() => {
              el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
            }, 300);
          });

          // Add hover effect - only change shadow, no transform
          el.addEventListener('mouseenter', () => {
            el.style.boxShadow = '0 0 20px rgba(59,130,246,0.7)';
            el.style.borderWidth = '4px';
          });
          el.addEventListener('mouseleave', () => {
            el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
            el.style.borderWidth = '3px';
          });
        } else if (isNumberedDestination) {
          // Destination cities: White circle with black number
          el.style.width = '32px';
          el.style.height = '32px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = '#ffffff';
          el.style.border = '3px solid #000000';
          el.style.boxShadow = '0 0 15px rgba(0,0,0,0.4)';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.zIndex = '1000'; // High priority - always on top
          el.style.transition = 'box-shadow 0.2s, border-width 0.2s';
          
          // Add number inside
          const numberSpan = document.createElement('span');
          numberSpan.innerText = cityNumber.toString();
          numberSpan.style.cssText = 'color:#000000;font-size:16px;font-weight:bold;font-family:sans-serif;line-height:1;pointer-events:none;';
          el.appendChild(numberSpan);

          // Add click event to zoom into the city
          el.addEventListener('click', () => {
            console.log(`[TripMap] Zooming to ${p.name} at [${p.lng}, ${p.lat}]`);
            map.flyTo({
              center: [p.lng, p.lat],
              zoom: 10, // City overview level - shows wider area with attractions
              duration: 2000, // 2 seconds smooth animation
              essential: true
            });
            
            // Visual feedback: pulse shadow effect
            el.style.boxShadow = '0 0 30px rgba(0,0,0,0.8)';
            setTimeout(() => {
              el.style.boxShadow = '0 0 15px rgba(0,0,0,0.4)';
            }, 300);
          });

          // Add hover effect - only change shadow, no transform
          el.addEventListener('mouseenter', () => {
            el.style.boxShadow = '0 0 25px rgba(0,0,0,0.6)';
            el.style.borderWidth = '4px';
          });
          el.addEventListener('mouseleave', () => {
            el.style.boxShadow = '0 0 15px rgba(0,0,0,0.4)';
            el.style.borderWidth = '3px';
          });
        } else if (isCity) {
          // Other cities (shouldn't happen normally): Orange dot
          el.style.width = '24px';
          el.style.height = '24px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = '#f97316';
          el.style.border = '3px solid white';
          el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
          el.style.zIndex = '900';
        } else {
          // Attractions: Icon based on type
          const activityType = (p as any).type || 'attraction';
          el.style.width = '28px';
          el.style.height = '28px';
          el.style.borderRadius = '50%';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.boxShadow = '0 0 8px rgba(0,0,0,0.6)';
          el.style.zIndex = '100'; // Low priority - under cities
          el.style.transition = 'box-shadow 0.2s, opacity 0.2s';
          
          // Set color and icon based on type
          let bgColor = '#ffffff';
          let iconSvg = '';
          
          if (activityType === 'hotel' || activityType === 'accommodation') {
            // Hotel: Blue background with bed icon
            bgColor = '#3b82f6';
            el.style.border = '2px solid white';
            iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
            </svg>`;
          } else if (activityType === 'food' || activityType === 'restaurant') {
            // Restaurant: Orange background with fork/knife icon
            bgColor = '#f97316';
            el.style.border = '2px solid white';
            iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
            </svg>`;
          } else {
            // Attraction: Green background with star/landmark icon
            bgColor = '#10b981';
            el.style.border = '2px solid white';
            iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24l-7.19-.61L12 2z"/>
            </svg>`;
          }
          
          el.style.backgroundColor = bgColor;
          el.innerHTML = iconSvg;
          
          // Add hover effect for attractions - no transform, only shadow and border
          el.addEventListener('mouseenter', (e) => {
            el.style.boxShadow = '0 0 20px rgba(0,0,0,0.9)';
            el.style.borderWidth = '3px';
            handleMarkerHover(p, e);
          });
          el.addEventListener('mouseleave', () => {
            el.style.boxShadow = '0 0 8px rgba(0,0,0,0.6)';
            el.style.borderWidth = '2px';
            handleMarkerLeave();
          });
        }

        // Add city name label for cities only
        if (isCity) {
          const labelWrapper = document.createElement('div');
          labelWrapper.style.cssText = 'position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:4px;pointer-events:none;';
          
          const label = document.createElement('span');
          label.innerText = p.name;
          label.style.cssText = 'background:rgba(0,0,0,0.7);color:white;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;white-space:nowrap;display:inline-block;';
          
          labelWrapper.appendChild(label);
          el.appendChild(labelWrapper);
        }

        // Build popup content based on marker type
        let popupContent = '';
        const activityType = (p as any).type || 'attraction';
        const dayInfo = (p as any).day;
        
        if (isCity) {
          // City popup - simple and elegant
          popupContent = `
            <div style="padding:8px 12px;font-family:sans-serif;">
              <div style="font-size:14px;font-weight:bold;color:#1e293b;margin-bottom:4px;">${p.name}</div>
              ${isNumberedDestination ? `<div style="font-size:11px;color:#64748b;">Destination ${cityNumber}</div>` : ''}
              ${isDeparture ? `<div style="font-size:11px;color:#64748b;">Departure City</div>` : ''}
            </div>
          `;
        } else {
          // Activity popup - with type icon and info
          let typeIcon = '⭐';
          let typeLabel = 'Attraction';
          let bgColor = '#10b981';
          
          if (activityType === 'hotel' || activityType === 'accommodation') {
            typeIcon = '🛏️';
            typeLabel = 'Accommodation';
            bgColor = '#3b82f6';
          } else if (activityType === 'food' || activityType === 'restaurant') {
            typeIcon = '🍴';
            typeLabel = 'Restaurant';
            bgColor = '#f97316';
          }
          
          popupContent = `
            <div style="min-width:180px;font-family:sans-serif;">
              <div style="background:${bgColor};color:white;padding:8px 12px;border-radius:6px 6px 0 0;margin:-15px -15px 8px -15px;">
                <div style="font-size:12px;font-weight:600;margin-bottom:2px;">${typeIcon} ${typeLabel}</div>
                <div style="font-size:14px;font-weight:bold;">${p.name}</div>
              </div>
              ${dayInfo ? `<div style="font-size:11px;color:#64748b;padding:0 12px 8px 12px;">📅 Day ${dayInfo}</div>` : ''}
            </div>
          `;
        }

        const markerSize = isNumberedDestination ? 32 : (isCity ? 24 : 28);
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'center' // Ensure marker is centered on coordinates
        })
          .setLngLat([p.lng, p.lat]);
        
        // Only add popup for cities, attractions use hover preview card
        if (isCity) {
          marker.setPopup(
            new mapboxgl.Popup({ 
              closeButton: false, 
              offset: markerSize/2,
              className: 'custom-popup'
            }).setHTML(popupContent)
          );
        }
        
        marker.addTo(map);
        markersRef.current.push(marker);
        console.log(`[TripMap Sync] Marker added at [${p.lng}, ${p.lat}]`);
      });

      // Add Route Line
      if (cities && cities.length >= 2) {
        console.log('[TripMap Sync] Adding route line...');
        const sourceId = 'route-source';
        // Remove existing route layers and source
        if (map.getLayer('route-line')) {
          console.log('[TripMap Sync] Removing existing route line');
          map.removeLayer('route-line');
        }
        if (map.getSource(sourceId)) {
          console.log('[TripMap Sync] Removing existing route source');
          map.removeSource(sourceId);
        }

        try {
          map.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: cities.map(p => [p.lng, p.lat])
              }
            }
          });
          console.log('[TripMap Sync] Route source added');

          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: sourceId,
            paint: { 
              'line-color': '#ffffff', 
              'line-width': 3, 
              'line-dasharray': [2, 2], 
              'line-opacity': 0.9 
            }
          });
          console.log('[TripMap Sync] Route layer added');

          // Add plane icons at the midpoint of each route segment
          // Calculate midpoints and bearings for each city-to-city segment
          for (let i = 0; i < cities.length - 1; i++) {
            const from = cities[i];
            const to = cities[i + 1];
            
            // Calculate midpoint
            const midLng = (from.lng + to.lng) / 2;
            const midLat = (from.lat + to.lat) / 2;
            
            // Calculate bearing (angle) from 'from' to 'to'
            const dLng = to.lng - from.lng;
            const dLat = to.lat - from.lat;
            const bearing = Math.atan2(dLng, dLat) * (180 / Math.PI);
            
            console.log(`[TripMap Sync] Adding plane between ${from.name} → ${to.name}, bearing: ${bearing.toFixed(1)}°`);
            
            // Create plane element with background circle
            const planeEl = document.createElement('div');
            planeEl.className = 'plane-marker';
            planeEl.innerHTML = `
              <div style="
                width: 36px;
                height: 36px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                border: 2px solid rgba(30, 41, 59, 0.8);
              ">
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${bearing}deg);">
                  <path fill="#1e293b" d="M21,16v-2l-8-5V3.5C13,2.67,12.33,2,11.5,2S10,2.67,10,3.5V9l-8,5v2l8-2.5V19l-2,1.5V22l3.5-1l3.5,1v-1.5L13,19v-5.5L21,16z"/>
                </svg>
              </div>
            `;
            planeEl.style.width = '36px';
            planeEl.style.height = '36px';
            
            // Create marker with popup
            const planeMarker = new mapboxgl.Marker({
              element: planeEl,
              anchor: 'center',
              rotationAlignment: 'map',
              pitchAlignment: 'map'
            })
              .setLngLat([midLng, midLat])
              .setPopup(
                new mapboxgl.Popup({ 
                  closeButton: false, 
                  offset: 20,
                  className: 'flight-popup'
                }).setHTML(`
                  <div style="padding:8px 12px;font-family:sans-serif;min-width:140px;">
                    <div style="font-size:11px;color:#64748b;margin-bottom:4px;font-weight:600;">✈️ Flight Route</div>
                    <div style="font-size:13px;font-weight:bold;color:#1e293b;">${from.name} → ${to.name}</div>
                  </div>
                `)
              )
              .addTo(map);
            
            // Make plane clickable to show popup
            planeEl.style.pointerEvents = 'auto';
            planeEl.style.cursor = 'pointer';
            
            markersRef.current.push(planeMarker);
            console.log(`[TripMap Sync] Plane marker added at midpoint [${midLng.toFixed(2)}, ${midLat.toFixed(2)}]`);
          }

        } catch (err) {
          console.error('[TripMap Sync] Error adding route:', err);
        }
      }

      // Fit bounds
      const bounds = new mapboxgl.LngLatBounds();
      allPoints.forEach(p => bounds.extend([p.lng, p.lat]));
      console.log('[TripMap Sync] Fitting bounds...');
      
      // Save global bounds for "Reset View" button
      globalBoundsRef.current = bounds;
      
      map.fitBounds(bounds, { padding: 80, duration: 2000 });
    };

    syncMarkersAndRoute();

  }, [cityPoints, attractionPoints, isMapReady]);

  // Handle reset to global view
  const handleResetView = () => {
    const map = mapRef.current;
    if (!map || !globalBoundsRef.current) return;
    
    console.log('[TripMap] Resetting to global view');
    map.fitBounds(globalBoundsRef.current, { 
      padding: 80, 
      duration: 2000,
      essential: true 
    });
  };

  return (
    <div className="relative h-full w-full bg-slate-950">
      <style dangerouslySetInnerHTML={{__html: `
        .mapboxgl-ctrl-logo {
          display: none !important;
        }
        .mapboxgl-ctrl-attrib {
          display: none !important;
        }
        .custom-popup .mapboxgl-popup-content {
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .custom-popup .mapboxgl-popup-tip {
          border-top-color: #10b981;
        }
        .flight-popup .mapboxgl-popup-content {
          padding: 0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .flight-popup .mapboxgl-popup-tip {
          border-top-color: #ffffff;
        }
      `}} />
      <div 
        ref={mapContainerRef} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      />
      
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm" style={{ zIndex: 10 }}>
          <div className="flex flex-col items-center gap-2 text-white">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
            <span className="text-sm font-medium">Loading 3D Globe...</span>
          </div>
        </div>
      )}

      {/* Reset View Button - Bottom Left */}
      <button
        onClick={handleResetView}
        className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-black/70 px-3 py-2 text-xs font-medium text-white backdrop-blur transition-all hover:bg-black/80 hover:shadow-lg active:scale-95"
        style={{ zIndex: 10 }}
        title="Return to global trip view"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
        <span>Reset View</span>
      </button>

      <div className="absolute top-4 right-14 flex flex-col gap-1 text-[10px] text-white" style={{ zIndex: 10 }}>
        <div className="flex items-center gap-2 rounded bg-black/60 px-2 py-1 backdrop-blur">
          <div className="h-3.5 w-3.5 rounded-full bg-green-500 border border-white flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24l-7.19-.61L12 2z"/>
            </svg>
          </div>
          <span>Attraction</span>
        </div>
        <div className="flex items-center gap-2 rounded bg-black/60 px-2 py-1 backdrop-blur">
          <div className="h-3.5 w-3.5 rounded-full bg-orange-500 border border-white flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
              <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
            </svg>
          </div>
          <span>Food</span>
        </div>
        <div className="flex items-center gap-2 rounded bg-black/60 px-2 py-1 backdrop-blur">
          <div className="h-3.5 w-3.5 rounded-full bg-blue-500 border border-white flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
              <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
            </svg>
          </div>
          <span>Hotel</span>
        </div>
      </div>

      {/* Hover Preview Card - Rendered via Portal to escape Dialog stacking context */}
      {hoveredData && typeof window !== 'undefined' && createPortal(
        <div 
          className="pointer-events-auto fixed z-[9999] w-64 overflow-hidden rounded-xl bg-white shadow-2xl transition-all duration-200"
          style={{
            left: `${previewPos.x + 20}px`,
            top: `${previewPos.y - 120}px`,
          }}
          onMouseEnter={() => {
            console.log('[TripMap] Mouse entered preview card, canceling hide');
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            console.log('[TripMap] Mouse left preview card, scheduling hide in 500ms');
            hoverTimeoutRef.current = setTimeout(() => {
              console.log('[TripMap] Preview card hidden');
              setHoveredData(null);
              setIsHoverLoading(false);
              hoverTimeoutRef.current = null;
            }, 500);
          }}
        >
          {/* Main Image */}
          <div className="relative h-32 w-full bg-slate-200">
            {hoveredData.isLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <img 
                src={hoveredData.photoUrl} 
                alt={hoveredData.name}
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute top-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              {hoveredData.category || 'Sightseeing'}
            </div>
          </div>

          <div className="p-3">
            <h3 className="mb-1 text-sm font-bold text-slate-900 line-clamp-1">{hoveredData.name}</h3>
            
            <div className="mb-2 flex items-center gap-1">
              <div className="flex text-orange-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3 w-3 ${i < Math.floor(hoveredData.rating || 4.5) ? 'fill-current' : 'text-slate-200'}`} 
                  />
                ))}
              </div>
              <span className="text-[11px] font-bold text-slate-700">{hoveredData.rating || '4.5'}</span>
              <span className="text-[10px] text-slate-400">({hoveredData.reviewCount || '1.2k'} reviews)</span>
            </div>

            <div className="space-y-1.5 border-t border-slate-100 pt-2">
              <div className="flex items-start gap-1.5 text-[10px] text-slate-600">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                <span className="line-clamp-2">{hoveredData.address || 'Loading address...'}</span>
              </div>
              
              {!hoveredData.isLoading && (
                <>
                  {hoveredData.hours && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                      <Clock className="h-3 w-3 shrink-0 text-slate-400" />
                      <span className="line-clamp-1">{hoveredData.hours}</span>
                    </div>
                  )}
                  {hoveredData.phone && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                      <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                      <span>{hoveredData.phone}</span>
                    </div>
                  )}
                  {hoveredData.website && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                      <Globe className="h-3 w-3 shrink-0 text-slate-400" />
                      <span className="line-clamp-1 text-blue-500">{hoveredData.website.replace(/^https?:\/\//, '')}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <button 
                className="flex-1 rounded-lg bg-blue-600 py-1.5 text-[10px] font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('[TripMap] Opening detail panel for:', hoveredData.name);
                  setSelectedPlace(hoveredData);
                  setIsDetailPanelOpen(true);
                  setHoveredData(null); // Close preview card when opening detail panel
                }}
              >
                View Details
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TripMap;
