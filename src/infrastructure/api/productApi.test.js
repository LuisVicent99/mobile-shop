import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getProducts, getProductById, postCart } from './productApi.js';
import { CACHE_TTL_MS } from '../cache/cache.js';
import { ApiError } from './ApiError.js';

const PRODUCTS = [{ id: 'abc', brand: 'Acer', model: 'Iconia', price: '170' }];
const DETAIL = { id: 'abc', brand: 'Acer', model: 'Iconia', options: { colors: [], storages: [] } };

function mockFetchJson(body, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Server Error',
    json: () => Promise.resolve(body),
  });
}

describe('productApi', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-19T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('getProducts', () => {
    it('fetches from the network on a cold cache and stores the response', async () => {
      const fetchMock = mockFetchJson(PRODUCTS);
      vi.stubGlobal('fetch', fetchMock);

      await expect(getProducts()).resolves.toEqual(PRODUCTS);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toContain('/api/product');
    });

    it('serves a fresh cache entry without fetching', async () => {
      const fetchMock = mockFetchJson(PRODUCTS);
      vi.stubGlobal('fetch', fetchMock);

      await getProducts();
      await expect(getProducts()).resolves.toEqual(PRODUCTS);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('revalidates against the network once the entry expires', async () => {
      const fetchMock = mockFetchJson(PRODUCTS);
      vi.stubGlobal('fetch', fetchMock);

      await getProducts();
      vi.advanceTimersByTime(CACHE_TTL_MS + 1);
      await getProducts();
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('survives a corrupt cache entry by fetching again', async () => {
      localStorage.setItem('products', '{corrupt');
      const fetchMock = mockFetchJson(PRODUCTS);
      vi.stubGlobal('fetch', fetchMock);

      await expect(getProducts()).resolves.toEqual(PRODUCTS);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('does not cache a failed response', async () => {
      vi.stubGlobal('fetch', mockFetchJson(null, false, 500));
      await expect(getProducts()).rejects.toBeInstanceOf(ApiError);

      const fetchMock = mockFetchJson(PRODUCTS);
      vi.stubGlobal('fetch', fetchMock);
      await expect(getProducts()).resolves.toEqual(PRODUCTS);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProductById', () => {
    it('caches each product under its own key', async () => {
      const fetchMock = mockFetchJson(DETAIL);
      vi.stubGlobal('fetch', fetchMock);

      await getProductById('abc');
      await getProductById('abc');
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toContain('/api/product/abc');

      await getProductById('other');
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('rejects with an ApiError carrying the HTTP status on 404', async () => {
      vi.stubGlobal('fetch', mockFetchJson(null, false, 404));
      await expect(getProductById('nope')).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('postCart', () => {
    it('POSTs the selection and returns the count without touching the cache', async () => {
      const fetchMock = mockFetchJson({ count: 3 });
      vi.stubGlobal('fetch', fetchMock);

      await expect(postCart({ id: 'abc', colorCode: 1000, storageCode: 2000 })).resolves.toEqual({
        count: 3,
      });

      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toContain('/api/cart');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body)).toEqual({ id: 'abc', colorCode: 1000, storageCode: 2000 });

      // A second identical call must hit the network again (mutations are never cached).
      await postCart({ id: 'abc', colorCode: 1000, storageCode: 2000 });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('rejects with an ApiError when the POST fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
      await expect(postCart({ id: 'x', colorCode: 1, storageCode: 2 })).rejects.toMatchObject({
        name: 'ApiError',
        status: 0,
      });
    });
  });
});
