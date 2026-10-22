/**
 * Centralized Mapbox configuration for Weave.
 * Supports NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN from .env.local,
 * with a reliable fallback token so maps never break if the env variable is empty.
 */

export const MAPBOX_ACCESS_TOKEN =
  (process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN && process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.trim().length > 0
    ? process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.trim()
    : null) ||
  (process.env.NEXT_PUBLIC_MAPBOX_TOKEN && process.env.NEXT_PUBLIC_MAPBOX_TOKEN.trim().length > 0
    ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN.trim()
    : null) ||
  'pk.eyJ1IjoibW9vdmFsIiwiYSI6ImNtazJzYmJ1YzA2aDIzcW9xbWlhMGIxencifQ.HicBjVINhGc-IAZVBnsnwg';
