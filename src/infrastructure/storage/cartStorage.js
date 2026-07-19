// Cart count persistence. Deliberately separate from the TTL cache:
// the counter must survive indefinitely, it never expires.
const CART_COUNT_KEY = 'cartCount';

export function getCount() {
  let raw;
  try {
    raw = localStorage.getItem(CART_COUNT_KEY);
  } catch {
    return 0;
  }
  const count = Number(raw);
  return Number.isInteger(count) && count >= 0 ? count : 0;
}

export function setCount(count) {
  if (!Number.isInteger(count) || count < 0) return;
  try {
    localStorage.setItem(CART_COUNT_KEY, String(count));
  } catch {
    // Best-effort: an unpersisted counter only affects the next reload.
  }
}
