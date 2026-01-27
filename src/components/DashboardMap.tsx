'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

interface DashboardMapProps {
  destinations?: Array<{
    name: string;
    lat: number;
    lng: number;
  }>;
  height?: number;
}

export default function DashboardMap({ destinations = [], height = 500 }: DashboardMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        console.log('[DashboardMap] Google Maps already loaded, initializing map...');
        initMap();
        return;
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        console.log('[DashboardMap] Google Maps script loading in progress...');
        window.initGoogleMaps = initMap;
        return;
      }

      // Check if API key exists
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('[DashboardMap] Google Maps API key not configured');
        setMapError(true);
        return;
      }

      console.log('[DashboardMap] Loading Google Maps script...');

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      window.initGoogleMaps = initMap;
      script.onload = () => {
        console.log('[DashboardMap] Google Maps script loaded successfully');
        if (window.google && window.google.maps) {
          initMap();
        }
      };
      script.onerror = () => {
        console.error('[DashboardMap] Failed to load Google Maps script');
        setMapError(true);
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapContainerRef.current || !window.google) return;

      try {
        console.log('[DashboardMap] Initializing Google Maps...');

        // Create the map
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: { lat: 20, lng: 20 },
          zoom: 2,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
        });

        mapRef.current = map;

        console.log('[DashboardMap] Map initialized successfully');
        setIsMapReady(true);
        setMapError(false);

        // Add markers for destinations
        if (destinations.length > 0) {
          addMarkers(map);
        }
      } catch (error) {
        console.error('[DashboardMap] Error initializing map:', error);
        setMapError(true);
      }
    };

    const addMarkers = (map: any) => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      const bounds = new window.google.maps.LatLngBounds();

      destinations.forEach((dest) => {
        const position = { lat: dest.lat, lng: dest.lng };

        // Create custom marker with gradient background
        const marker = new window.google.maps.Marker({
          position,
          map,
          title: dest.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="padding:8px;font-family:sans-serif;">
            <div style="font-size:14px;font-weight:bold;color:#1e293b;">${dest.name}</div>
          </div>`,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
        bounds.extend(position);
      });

      // Fit map to show all markers
      if (destinations.length > 1) {
        map.fitBounds(bounds);
      } else if (destinations.length === 1) {
        map.setCenter(bounds.getCenter());
        map.setZoom(5);
      }
    };

    loadGoogleMaps();

    // Cleanup
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [destinations]);

  // Show placeholder if map fails to load
  if (mapError) {
    return (
      <div 
        className="relative w-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center rounded-lg"
        style={{ height: `${height}px` }}
      >
        <div className="text-center px-4">
          <MapPin className="size-16 text-blue-600 mx-auto mb-4 opacity-50" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">World Map</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Your interactive world map will appear here once the API is configured.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden" style={{ height: `${height}px` }}>
      <div ref={mapContainerRef} className="absolute inset-0" />
      
      {!isMapReady && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading World Map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
