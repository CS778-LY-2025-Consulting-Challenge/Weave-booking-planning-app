'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Globe2 } from 'lucide-react';

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

// Google Maps "Night" theme style
const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#b0975a' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }, { weight: 0.5 }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];

export default function DashboardMap({ destinations = [], height = 500 }: DashboardMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const overlaysRef = useRef<any[]>([]);
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

        // Create the map with elegant dark style
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: { lat: 25, lng: 20 },
          zoom: 2,
          minZoom: 2,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_CENTER,
          },
          styles: MAP_STYLES,
          backgroundColor: '#17263c',
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
      // Clear existing markers & overlays
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      overlaysRef.current.forEach(overlay => overlay.setMap(null));
      overlaysRef.current = [];

      const bounds = new window.google.maps.LatLngBounds();
      let activeInfoWindow: any = null;

      destinations.forEach((dest, index) => {
        const position = { lat: dest.lat, lng: dest.lng };

        // Animated pulse ring (outer glow)
        const pulseCircle = new window.google.maps.Circle({
          center: position,
          radius: 120000,
          map,
          fillColor: '#38bdf8',
          fillOpacity: 0.12,
          strokeColor: '#38bdf8',
          strokeOpacity: 0.25,
          strokeWeight: 1,
          clickable: false,
        });

        overlaysRef.current.push(pulseCircle);

        // Create marker with custom SVG icon
        const markerSvg = {
          path: 'M12 0C5.372 0 0 5.372 0 12c0 9 12 20 12 20s12-11 12-20c0-6.628-5.372-12-12-12zm0 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10z',
          fillColor: '#38bdf8',
          fillOpacity: 1,
          strokeColor: '#0c4a6e',
          strokeWeight: 1.5,
          scale: 1.4,
          anchor: new window.google.maps.Point(12, 32),
          labelOrigin: new window.google.maps.Point(12, 12),
        };

        const marker = new window.google.maps.Marker({
          position,
          map,
          title: dest.name,
          icon: markerSvg,
          animation: window.google.maps.Animation.DROP,
          zIndex: 100 + index,
        });

        // Styled info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="
              padding: 12px 16px;
              font-family: 'Inter', system-ui, sans-serif;
              min-width: 140px;
            ">
              <div style="
                display: flex;
                align-items: center;
                gap: 8px;
              ">
                <div style="
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  background: linear-gradient(135deg, #38bdf8, #818cf8);
                  flex-shrink: 0;
                "></div>
                <span style="
                  font-size: 14px;
                  font-weight: 600;
                  color: #0f172a;
                  letter-spacing: -0.01em;
                ">${dest.name}</span>
              </div>
            </div>
          `,
          maxWidth: 280,
        });

        marker.addListener('click', () => {
          if (activeInfoWindow) activeInfoWindow.close();
          infoWindow.open(map, marker);
          activeInfoWindow = infoWindow;
          // Bounce briefly on click
          marker.setAnimation(window.google.maps.Animation.BOUNCE);
          setTimeout(() => marker.setAnimation(null), 700);
        });

        // Hover effect: scale marker on mouseover
        marker.addListener('mouseover', () => {
          marker.setIcon({
            ...markerSvg,
            scale: 1.8,
            fillColor: '#818cf8',
          });
        });
        marker.addListener('mouseout', () => {
          marker.setIcon(markerSvg);
        });

        markersRef.current.push(marker);
        bounds.extend(position);
      });

      // Fit map to show all markers
      if (destinations.length > 1) {
        map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
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
      overlaysRef.current.forEach(overlay => overlay.setMap(null));
      overlaysRef.current = [];
    };
  }, [destinations]);

  // Show placeholder if map fails to load
  if (mapError) {
    return (
      <div 
        className="relative w-full bg-gradient-to-br from-[#242f3e] via-[#17263c] to-[#242f3e] flex items-center justify-center rounded-2xl"
        style={{ height: `${height}px` }}
      >
        <div className="text-center px-4">
          <div className="relative mx-auto mb-5 w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-sky-400/20 animate-ping" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-sky-400/10 border border-sky-400/30">
              <Globe2 className="size-10 text-sky-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">World Map</h2>
          <p className="text-sky-200/60 max-w-md mx-auto text-sm">
            Your interactive world map will appear here once the API is configured.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden group" style={{ height: `${height}px` }}>
      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0" />
      
      {/* Top gradient overlay for depth */}
      {isMapReady && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/20 to-transparent z-[1]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent z-[1]" />
        </>
      )}

      {/* Destination count badge */}
      {isMapReady && destinations.length > 0 && (
        <div className="absolute top-4 left-4 z-[2] flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-xl">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-400" />
          </div>
          <span className="text-sm font-medium text-white/90">
            {destinations.length} {destinations.length === 1 ? 'destination' : 'destinations'}
          </span>
        </div>
      )}
      
      {/* Loading state */}
      {!isMapReady && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#242f3e] via-[#17263c] to-[#242f3e] flex items-center justify-center">
          <div className="text-center">
            <div className="relative mx-auto mb-5 w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-sky-400/20" />
              <div className="absolute inset-0 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-indigo-400/30 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <Globe2 className="absolute inset-0 m-auto size-6 text-sky-400" />
            </div>
            <p className="text-sky-200/70 font-medium text-sm">Loading World Map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
