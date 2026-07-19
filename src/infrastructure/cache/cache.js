// Single source of truth for the cache expiry policy required by the spec (1 hour).
export const CACHE_TTL_MS = 3_600_000;

export function productDetailKey(id) {
  return `product:${id}`;
}

export const PRODUCTS_KEY = 'products';

/**
 * Reads a cached value. Returns `null` on miss, expiry, corrupt JSON,
 * malformed entries or unavailable storage — callers only need to
 * distinguish "usable value" from "go to the network".
 */
export function get(key) {
  let raw;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return null;
  }
  if (!raw) return null;

  let entry;
  try {
    entry = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!entry || typeof entry.timestamp !== 'number' || !('value' in entry)) {
    return null;
  }
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    return null;
  }
  return entry.value;
}

/**
 * Stores a value with the current timestamp. Failures (quota exceeded,
 * storage unavailable) are swallowed: a failed cache write only means
 * the next read will hit the network again.
 */
export function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now() }));
  } catch {
    // Intentionally ignored: caching is best-effort.
  }
}
