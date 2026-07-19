// Single source of truth for the cache TTL (1 hour).
export const CACHE_TTL_MS = 3_600_000;

export function productDetailKey(id) {
  return `product:${id}`;
}

export const PRODUCTS_KEY = 'products';

// Returns null on miss, expiry, corrupt JSON or unavailable storage.
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

export function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now() }));
  } catch {
    // Best-effort: a failed write only means the next read hits the network.
  }
}
