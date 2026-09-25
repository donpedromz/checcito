import { ISLANDS, type IslandKey } from "./data";

const STORAGE_KEY = "isla-aprender-progress-v1";

export type Stars = Record<IslandKey, number>;

export const EMPTY_STARS: Stars = Object.fromEntries(
  ISLANDS.map((i) => [i.key, 0]),
) as Stars;

const listeners = new Set<() => void>();
let cache: Stars = EMPTY_STARS;
let cacheRaw: string | null = null;

/** Parses at most once per distinct stored value so snapshots stay referentially stable. */
function read(): Stars {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY_STARS; // private mode / storage blocked
  }
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  try {
    cache = raw ? { ...EMPTY_STARS, ...(JSON.parse(raw) as Partial<Stars>) } : EMPTY_STARS;
  } catch {
    cache = EMPTY_STARS;
  }
  return cache;
}

/** localStorage is an external store, so progress is read through a subscription. */
export function subscribeStars(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export const getStars = () => read();
export const getServerStars = () => EMPTY_STARS;

export function saveStars(stars: Stars) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stars));
  } catch {
    return; // progress just won't persist
  }
  cacheRaw = null; // force the next snapshot to re-read
  listeners.forEach((l) => l());
}
