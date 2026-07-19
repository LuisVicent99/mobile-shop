import { request } from './httpClient.js';
import * as cache from '../cache/cache.js';
import { PRODUCTS_KEY, productDetailKey } from '../cache/cache.js';

/**
 * Repository over the three API endpoints. GET responses are cached raw
 * (as returned by the wire) so domain mappers can evolve without ever
 * invalidating stored entries; while an entry is fresh no request is made.
 */
export async function getProducts() {
  const cached = cache.get(PRODUCTS_KEY);
  if (cached) return cached;

  const data = await request('/api/product');
  cache.set(PRODUCTS_KEY, data);
  return data;
}

export async function getProductById(id) {
  const key = productDetailKey(id);
  const cached = cache.get(key);
  if (cached) return cached;

  const data = await request(`/api/product/${encodeURIComponent(id)}`);
  cache.set(key, data);
  return data;
}

export async function postCart({ id, colorCode, storageCode }) {
  return request('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, colorCode, storageCode }),
  });
}
