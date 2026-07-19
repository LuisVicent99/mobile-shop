import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get, set, CACHE_TTL_MS, PRODUCTS_KEY, productDetailKey } from './cache.js';

describe('cache', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-19T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a fresh entry', () => {
    set('products', [{ id: '1' }]);
    expect(get('products')).toEqual([{ id: '1' }]);
  });

  it('returns null on a missing key', () => {
    expect(get('missing')).toBeNull();
  });

  it('still serves an entry right at the TTL boundary', () => {
    set('products', 'value');
    vi.advanceTimersByTime(CACHE_TTL_MS);
    expect(get('products')).toBe('value');
  });

  it('expires an entry after the 1-hour TTL', () => {
    set('products', 'value');
    vi.advanceTimersByTime(CACHE_TTL_MS + 1);
    expect(get('products')).toBeNull();
  });

  it('treats corrupt JSON as a miss without throwing', () => {
    localStorage.setItem('products', 'not-json{');
    expect(() => get('products')).not.toThrow();
    expect(get('products')).toBeNull();
  });

  it('treats a malformed entry (no timestamp) as a miss', () => {
    localStorage.setItem('products', JSON.stringify({ value: 'x' }));
    expect(get('products')).toBeNull();
  });

  it('treats a non-object entry as a miss', () => {
    localStorage.setItem('products', JSON.stringify('just a string'));
    expect(get('products')).toBeNull();
  });

  it('stores falsy values and serves them back', () => {
    set('count', 0);
    expect(get('count')).toBe(0);
  });

  it('overwrites an expired entry on the next set', () => {
    set('products', 'old');
    vi.advanceTimersByTime(CACHE_TTL_MS + 1);
    set('products', 'new');
    expect(get('products')).toBe('new');
  });

  it('does not throw when localStorage.setItem fails (quota)', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => set('products', 'value')).not.toThrow();
    spy.mockRestore();
  });

  it('builds namespaced keys for product details', () => {
    expect(PRODUCTS_KEY).toBe('products');
    expect(productDetailKey('abc123')).toBe('product:abc123');
  });
});
