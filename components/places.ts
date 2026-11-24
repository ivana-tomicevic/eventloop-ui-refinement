/**
 * Where things are, for the "Close to you" row on Explore. Demo only: rough centre points of the
 * pilot neighbourhoods and three universities. Distances are used to sort, never shown (CLAUDE.md).
 */
export type Place = { label: string; lat: number; lng: number };

export const NEIGHBOURHOOD_PLACES: Place[] = [
  { label: "Lavapiés", lat: 40.4086, lng: -3.7013 },
  { label: "Malasaña", lat: 40.4256, lng: -3.7036 },
  { label: "La Latina", lat: 40.4115, lng: -3.7086 },
  { label: "Chueca", lat: 40.4226, lng: -3.6975 },
  { label: "Retiro", lat: 40.4153, lng: -3.6844 },
  { label: "Chamberí", lat: 40.435, lng: -3.7034 },
];
export const UNIVERSITY_PLACES: Place[] = [
  { label: "Complutense", lat: 40.4491, lng: -3.727 },
  { label: "Carlos III", lat: 40.3317, lng: -3.7655 },
  { label: "Autónoma", lat: 40.5445, lng: -3.6934 },
];
/** Neighbourhoods an event can be in, including "Centro", which is not in the picker. */
const EVENT_AREAS: Place[] = [
  ...NEIGHBOURHOOD_PLACES,
  { label: "Centro", lat: 40.4168, lng: -3.7038 },
];

const NEAR_KEY = "eventloop-near";
export function readNear(): Place | null {
  try {
    const p = JSON.parse(sessionStorage.getItem(NEAR_KEY) || "null");
    return p && typeof p.lat === "number" && typeof p.lng === "number" && p.label
      ? (p as Place)
      : null;
  } catch {
    return null;
  }
}
/** Session only, like the vibe: closing the tab forgets it. */
export function saveNear(p: Place | null) {
  try {
    if (p) sessionStorage.setItem(NEAR_KEY, JSON.stringify(p));
    else sessionStorage.removeItem(NEAR_KEY);
  } catch {}
}

const rad = (d: number) => (d * Math.PI) / 180;
/** Straight-line distance in km (for sorting only). */
function distance(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
/** How far the event's neighbourhood is from `from`; unknown areas sort last. */
export function distanceTo(
  from: { lat: number; lng: number },
  neighbourhood?: string,
) {
  const area = EVENT_AREAS.find((a) => a.label === neighbourhood);
  return area ? distance(from, area) : Number.POSITIVE_INFINITY;
}
