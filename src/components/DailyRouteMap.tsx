'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Activity {
  name: string;
  lat: number;
  lng: number;
  type?: string;
  imageUrl?: string;
}

interface DailyRouteMapProps {
  activities: Activity[];
  dayNumber: number;
  dayTitle: string;
  onClose: () => void;
  onActivitiesReorder?: (reorderedActivities: Activity[]) => void;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

// Sortable Activity Card Component
function SortableActivityCard({ 
  activity, 
  index, 
  routeColor, 
  onCardClick 
}: { 
  activity: Activity & { id: string }; 
  index: number; 
  routeColor: string;
  onCardClick: () => void;
}) {
  // Local image state: prefer activity.imageUrl if provided, otherwise lazy-load from Unsplash
  const [imageUrl, setImageUrl] = useState<string | null>(activity.imageUrl || null);
  const [isLoadingImage, setIsLoadingImage] = useState(!activity.imageUrl);

  useEffect(() => {
    // If parent already provided an image, just use it
    if (activity.imageUrl) {
      setImageUrl(activity.imageUrl);
      setIsLoadingImage(false);
      return;
    }

    const fetchImage = async () => {
      try {
        if (!activity.name || typeof activity.name !== 'string') {
          setIsLoadingImage(false);
          return;
        }

        // Reuse the same title-cleaning logic as ActivityCard
        let query = activity.name;
        const prefixPatterns = [
          /^(Dinner|Lunch|Breakfast|Brunch)\s+at\s+/i,
          /^(Visit|Explore|Tour|See|Discover|Experience)\s+/i,
          /\+.*$/, // Remove everything after "+"
          /\s*\(.*\)$/ // Remove content in parentheses
        ];

        for (const pattern of prefixPatterns) {
          query = query.replace(pattern, '');
        }

        query = query.split(/[-,]/)[0].trim();
        const words = query.split(' ').slice(0, 4).join(' ');

        console.log('[DailyRouteMap] Searching background image for activity card:', {
          name: activity.name,
          cleanedQuery: words,
        });

        const res = await fetch(`/api/unsplash/search?city=${encodeURIComponent(words)}`);
        const data = await res.json();
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      } catch (err) {
        console.error('[DailyRouteMap] Error fetching activity background image:', err);
      } finally {
        setIsLoadingImage(false);
      }
    };

    fetchImage();
  }, [activity.name, activity.imageUrl]);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Generate gradient background based on activity type (fallback)
  const getGradientBackground = () => {
    const gradients = {
      attraction: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      food: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      hotel: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      default: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    return gradients[activity.type as keyof typeof gradients] || gradients.default;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-lg shadow-sm border-2 overflow-hidden ${
        isDragging ? 'border-blue-400 shadow-lg' : 'border-transparent'
      }`}
    >
      {/* Background Image or Gradient */}
      {imageUrl ? (
        <>
          {/* Real Image Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${imageUrl})`,
            }}
          />
        </>
      ) : (
        <>
          {/* Gradient Background Fallback */}
          <div 
            className="absolute inset-0"
            style={{ 
              background: getGradientBackground(),
              opacity: 0.15
            }}
          />
          {/* Pattern overlay for texture */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              opacity: 0.3
            }}
          />
        </>
      )}
      
      {/* Content */}
      <div className="relative flex items-center gap-3 p-3 bg-gradient-to-t from-white/90 via-white/70 to-transparent">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-800"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Number Badge - Pure Number */}
        <div
          className="flex items-center justify-center w-8 h-8 text-2xl font-bold flex-shrink-0"
          style={{ color: routeColor }}
        >
          {index + 1}
        </div>

        {/* Activity Info - Clickable */}
        <button
          onClick={onCardClick}
          className="flex-1 text-left hover:bg-white/40 rounded p-2 transition-colors"
        >
          <p className="text-sm font-semibold text-slate-900">{activity.name}</p>
          {activity.type && (
            <p className="text-xs text-slate-600 capitalize mt-0.5 font-medium">{activity.type}</p>
          )}
        </button>
      </div>

      {/* Optional loading veil when fetching background image */}
      {isLoadingImage && (
        <div className="absolute inset-0 pointer-events-none bg-white/30" />
      )}
    </div>
  );
}

export default function DailyRouteMap({
  activities: initialActivities,
  dayNumber,
  dayTitle,
  onClose,
  onActivitiesReorder,
}: DailyRouteMapProps) {
  // Add unique IDs to activities for drag-and-drop
  const [activities, setActivities] = useState(() =>
    initialActivities.map((act, idx) => ({ ...act, id: `activity-${idx}` }))
  );
  
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Color scheme for day numbers
  const dayColors = [
    '#ef4444', // Red - Day 1
    '#f59e0b', // Amber - Day 2
    '#10b981', // Emerald - Day 3
    '#3b82f6', // Blue - Day 4
    '#8b5cf6', // Purple - Day 5
    '#ec4899', // Pink - Day 6
    '#06b6d4', // Cyan - Day 7
  ];
  
  const routeColor = dayColors[(dayNumber - 1) % dayColors.length];

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setActivities((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Notify parent component of the new order asynchronously to avoid rendering conflicts
        if (onActivitiesReorder) {
          // Use queueMicrotask to defer the callback until after the current render cycle
          queueMicrotask(() => {
            // Remove the temporary 'id' field before passing back
            const cleanedActivities = newOrder.map(({ id, ...activity }) => activity);
            onActivitiesReorder(cleanedActivities);
          });
        }
        
        return newOrder;
      });
    }
  };

  // Function to calculate route
  const calculateRoute = () => {
    if (!directionsServiceRef.current || activities.length < 2) {
      setIsLoading(false);
      setIsRecalculating(false);
      return;
    }

    console.log('[DailyRouteMap] Calculating route for', activities.length, 'activities');

    // Clear previous route before calculating new one
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] });
    }

    const origin = { lat: activities[0].lat, lng: activities[0].lng };
    const destination = { lat: activities[activities.length - 1].lat, lng: activities[activities.length - 1].lng };
    
    // Waypoints are all activities except first and last
    const waypoints = activities.slice(1, -1).map(activity => ({
      location: { lat: activity.lat, lng: activity.lng },
      stopover: true,
    }));

    console.log('[DailyRouteMap] Route request:', { origin, destination, waypoints: waypoints.length });

    const request = {
      origin: origin,
      destination: destination,
      waypoints: waypoints,
      travelMode: window.google.maps.TravelMode.DRIVING,
      optimizeWaypoints: false, // Keep original order
      avoidHighways: false,
      avoidTolls: false,
    };

    directionsServiceRef.current.route(request, (result: any, status: any) => {
      console.log('[DailyRouteMap] Route response status:', status);
      
      if (status === 'OK') {
        directionsRendererRef.current.setDirections(result);
        
        // Extract route info
        const route = result.routes[0];
        let totalDistance = 0;
        let totalDuration = 0;
        
        route.legs.forEach((leg: any) => {
          totalDistance += leg.distance.value;
          totalDuration += leg.duration.value;
        });
        
        const distanceKm = (totalDistance / 1000).toFixed(1);
        const durationMin = Math.round(totalDuration / 60);
        const durationHours = Math.floor(durationMin / 60);
        const durationMinutes = durationMin % 60;
        
        let durationText = '';
        if (durationHours > 0) {
          durationText = `${durationHours}h ${durationMinutes}m`;
        } else {
          durationText = `${durationMinutes}m`;
        }
        
        setRouteInfo({
          distance: `${distanceKm} km`,
          duration: durationText,
        });
        
        console.log('[DailyRouteMap] Route calculated successfully');
        setIsLoading(false);
        setIsRecalculating(false);
      } else {
        console.error('Directions request failed:', status);
        setError(`Could not calculate route: ${status}`);
        setIsLoading(false);
        setIsRecalculating(false);
      }
    });
  };

  // Function to update markers and recalculate route
  const updateMapMarkersAndRoute = () => {
    if (!googleMapRef.current || !window.google) return;

    console.log('[DailyRouteMap] Updating markers and recalculating route...');

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Clear existing route
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] });
    }

    // Add new markers with updated numbers
    activities.forEach((activity, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: activity.lat, lng: activity.lng },
        map: googleMapRef.current,
        label: {
          text: `${index + 1}`,
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 18,
          fillColor: routeColor,
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 3,
        },
        title: activity.name,
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 4px 0; color: #1e293b;">
              Stop ${index + 1}
            </h3>
            <p style="font-size: 13px; margin: 0; color: #475569;">
              ${activity.name}
            </p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(googleMapRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Recalculate route
    if (activities.length >= 2) {
      calculateRoute();
    } else {
      setIsRecalculating(false);
    }
  };

  // Watch for activity order changes
  useEffect(() => {
    if (googleMapRef.current && activities.length >= 2 && !isLoading) {
      setIsRecalculating(true);
      updateMapMarkersAndRoute();
    }
  }, [activities]);

  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        console.log('[DailyRouteMap] Google Maps already loaded, initializing map...');
        initMap();
        return;
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        console.log('[DailyRouteMap] Google Maps script loading in progress...');
        window.initGoogleMaps = initMap;
        return;
      }

      // Check if API key exists
      if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        console.error('[DailyRouteMap] Google Maps API key not configured');
        setError('Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.');
        setIsLoading(false);
        return;
      }

      console.log('[DailyRouteMap] Loading Google Maps script...');

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      window.initGoogleMaps = initMap;
      script.onload = () => {
        console.log('[DailyRouteMap] Google Maps script loaded successfully');
        if (window.google && window.google.maps) {
          initMap();
        }
      };
      script.onerror = () => {
        console.error('[DailyRouteMap] Failed to load Google Maps script');
        setError('Failed to load Google Maps. Please check your API key.');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current || !window.google) return;

      // Check if there are activities with valid coordinates
      if (!activities || activities.length === 0) {
        setError('No activities with valid coordinates found for this day.');
        setIsLoading(false);
        return;
      }

      console.log('[DailyRouteMap] Initializing map with activities:', activities);

      try {
        // Calculate center point
        const centerLat = activities.reduce((sum, a) => sum + a.lat, 0) / activities.length;
        const centerLng = activities.reduce((sum, a) => sum + a.lng, 0) / activities.length;

        console.log('[DailyRouteMap] Map center:', { lat: centerLat, lng: centerLng });

        // Initialize map
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: 13,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
        });

        googleMapRef.current = map;

        // Initialize directions service and renderer
        directionsServiceRef.current = new window.google.maps.DirectionsService();
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          map: map,
          suppressMarkers: true, // We'll add custom markers
          polylineOptions: {
            strokeColor: '#4285F4', // Google Maps blue color
            strokeWeight: 6,
            strokeOpacity: 1.0,
            // Add a darker border for better visibility
            icons: [{
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 0
              },
              offset: '0',
              repeat: '10px'
            }],
          },
          // Customize the route line to match Google Maps style
          preserveViewport: false,
        });

        // Add numbered markers for each activity
        activities.forEach((activity, index) => {
          const marker = new window.google.maps.Marker({
            position: { lat: activity.lat, lng: activity.lng },
            map: map,
            label: {
              text: `${index + 1}`,
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 18,
              fillColor: routeColor,
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 3,
            },
            title: activity.name,
          });

          // Add info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 4px 0; color: #1e293b;">
                  Stop ${index + 1}
                </h3>
                <p style="font-size: 13px; margin: 0; color: #475569;">
                  ${activity.name}
                </p>
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          markersRef.current.push(marker);
        });

        // Calculate and display route
        if (activities.length >= 2) {
          calculateRoute();
        } else {
          // If only 1 activity, no route needed - just show the map
          console.log('[DailyRouteMap] Only 1 activity, showing map without route');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map');
        setIsLoading(false);
      }
    };

    loadGoogleMaps();

    // Cleanup
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, [activities, dayNumber, routeColor]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-7xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ backgroundColor: `${routeColor}15` }}
        >
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Day {dayNumber} Route: {dayTitle}
            </h2>
            {routeInfo && (
              <p className="text-sm text-slate-600 mt-1">
                📍 {activities.length} stops • � {routeInfo.distance} • ⏱️ {routeInfo.duration} driving
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Content - Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Draggable Activity Cards */}
          <div className="w-[35%] border-r bg-slate-50 overflow-y-auto p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">
                Drag to reorder activities
              </h3>
              {isRecalculating && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Updating...</span>
                </div>
              )}
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activities.map(a => a.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <SortableActivityCard
                      key={activity.id}
                      activity={activity}
                      index={index}
                      routeColor={routeColor}
                      onCardClick={() => {
                        if (googleMapRef.current) {
                          const map = googleMapRef.current;
                          const targetPosition = { lat: activity.lat, lng: activity.lng };
                          map.panTo(targetPosition);
                          const currentZoom = map.getZoom();
                          const targetZoom = 17;
                          if (currentZoom < targetZoom) {
                            let zoom = currentZoom;
                            const zoomInterval = setInterval(() => {
                              zoom += 0.5;
                              if (zoom >= targetZoom) {
                                map.setZoom(targetZoom);
                                clearInterval(zoomInterval);
                              } else {
                                map.setZoom(zoom);
                              }
                            }, 100);
                          } else {
                            map.setZoom(targetZoom);
                          }
                        }
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Right Side - Map */}
          <div className="flex-1 relative">
            <div ref={mapRef} className="absolute inset-0" />
            
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Calculating route...</p>
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {error && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                  <div className="text-red-500 text-4xl mb-2">⚠️</div>
                  <p className="text-sm text-slate-600 mb-4">{error}</p>
                  <Button onClick={onClose} variant="outline">
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
