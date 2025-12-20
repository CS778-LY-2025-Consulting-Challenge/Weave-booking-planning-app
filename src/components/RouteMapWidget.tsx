"use client";

import { useEffect, useMemo, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

export type Coordinates = [number, number];

export interface RouteStop {
  name: string;
  coords: Coordinates;
  note?: string;
  isSecondary?: boolean;
}

interface RouteMapWidgetProps {
  title?: string;
  stops: RouteStop[];
  mainPath: Coordinates[];
  secondaryPath?: Coordinates[];
  center?: Coordinates;
  zoom?: number;
  height?: number; // in pixels, defaults to 256
}

// Simple, scroll-safe route map built on MapLibre. Scroll zoom is disabled by default.
export default function RouteMapWidget({
  title = "Route Map",
  stops,
  mainPath,
  secondaryPath = [],
  center,
  zoom = 4,
  height = 256,
}: RouteMapWidgetProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const derivedCenter = useMemo<Coordinates>(() => {
    if (center) return center;
    if (mainPath.length > 0) return mainPath[0];
    if (stops.length > 0) return stops[0].coords;
    return [0, 0];
  }, [center, mainPath, stops]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const initMap = async () => {
      const maplibregl = await import("maplibre-gl");
      const { Map, Popup, LngLatBounds, NavigationControl } = maplibregl;

      if (!mapContainerRef.current) return;

      const map = new Map({
        container: mapContainerRef.current,
        style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
        center: derivedCenter,
        zoom,
        attributionControl: false,
      });

      map.doubleClickZoom.disable();
      map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();
      map.addControl(new NavigationControl({ showCompass: false }), "top-right");

      let activePopup: InstanceType<typeof Popup> | null = null;

      map.on("load", () => {
        const stopsGeojson = {
          type: "FeatureCollection",
          features: stops.map((stop) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: stop.coords,
            },
            properties: {
              name: stop.name,
              note: stop.note,
              isSecondary: stop.isSecondary ?? false,
            },
          })),
        } as const;

        const allCoords = [
          ...mainPath,
          ...secondaryPath,
          ...stops.map((stop) => stop.coords),
        ];

        if (mainPath.length > 1) {
          map.addSource("route-main", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: mainPath,
                  },
                  properties: {},
                },
              ],
            },
          });

          map.addLayer({
            id: "route-main-line",
            type: "line",
            source: "route-main",
            paint: {
              "line-color": "#7c3aed",
              "line-width": 4,
            },
            layout: {
              "line-cap": "round",
              "line-join": "round",
            },
          });
        }

        if (secondaryPath.length > 1) {
          map.addSource("route-secondary", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: secondaryPath,
                  },
                  properties: {},
                },
              ],
            },
          });

          map.addLayer({
            id: "route-secondary-line",
            type: "line",
            source: "route-secondary",
            paint: {
              "line-color": "#a855f7",
              "line-width": 3,
              "line-dasharray": [1.5, 1.5],
            },
            layout: {
              "line-cap": "round",
              "line-join": "round",
            },
          });
        }

        if (stops.length > 1) {
          map.addSource("route-dotted-stops", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: stops.map((s) => s.coords),
                  },
                  properties: {},
                },
              ],
            },
          });

          map.addLayer({
            id: "route-dotted-stops-line",
            type: "line",
            source: "route-dotted-stops",
            paint: {
              "line-color": "#7c3aed",
              "line-width": 2.5,
              "line-dasharray": [0.5, 1.2],
              "line-opacity": 0.9,
            },
            layout: {
              "line-sort-key": 1,
              "line-cap": "round",
              "line-join": "round",
            },
          });
        }

        map.addSource("route-stops", {
          type: "geojson",
          data: stopsGeojson as any,
        });

        map.addLayer({
          id: "route-stops-circles",
          type: "circle",
          source: "route-stops",
          paint: {
            "circle-radius": 7,
            "circle-color": "#7c3aed",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ede9fe",
            "circle-opacity": 0.95,
          },
        });

        map.addLayer({
          id: "route-stops-labels",
          type: "symbol",
          source: "route-stops",
          layout: {
            "text-field": ["get", "name"],
            "text-size": 12,
            "text-offset": [0, 1.4],
            "text-anchor": "top",
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          },
          paint: {
            "text-color": "#312e81",
            "text-halo-color": "#ffffff",
            "text-halo-width": 0.75,
          },
        });

        if (allCoords.length > 1) {
          const bounds = allCoords.reduce((acc, coord) => acc.extend(coord), new LngLatBounds(allCoords[0], allCoords[0]));
          map.fitBounds(bounds, {
            padding: 48,
            maxZoom: Math.max(zoom + 1.5, 6),
            duration: 900,
            easing: (t) => 1 - Math.pow(1 - t, 3),
          });
        }
      });

      map.on("mouseenter", "route-stops-circles", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "route-stops-circles", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", "route-stops-circles", (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const [lng, lat] = (feature.geometry as any).coordinates as Coordinates;
        const { name, note } = feature.properties as { name: string; note?: string };

        activePopup?.remove();
        activePopup = new Popup({ closeButton: false })
          .setLngLat([lng, lat])
          .setHTML(
            `<div style="font-size:12px;font-weight:600;color:#1f2937;">${name}</div>` +
              (note ? `<div style="font-size:11px;color:#4b5563;margin-top:2px;">${note}</div>` : "")
          )
          .addTo(map);
      });

      cleanup = () => {
        activePopup?.remove();
        map.remove();
      };
    };

    initMap();

    return () => cleanup?.();
  }, [derivedCenter, mainPath, secondaryPath, stops, zoom]);

  return (
    <div className="overflow-hidden rounded-xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 shadow-sm">
      <div className="px-4 pt-4">
        <p className="text-xs uppercase tracking-[0.12em] text-purple-500">Route</p>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-4 pb-5">
        <div
          ref={mapContainerRef}
          className="w-full overflow-hidden rounded-lg"
          style={{ height }}
          aria-label="Interactive route map"
        />
      </div>
    </div>
  );
}
