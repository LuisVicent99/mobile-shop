import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCount, setCount } from './cartStorage.js';

describe('cartStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to 0 when nothing is stored', () => {
    expect(getCount()).toBe(0);
  });

  it('persists and rehydrates the count', () => {
    setCount(5);
    expect(getCount()).toBe(5);
    expect(localStorage.getItem('cartCount')).toBe('5');
  });

  it('accepts 0 as a valid count', () => {
    setCount(3);
    setCount(0);
    expect(getCount()).toBe(0);
  });

  it('returns 0 for corrupt stored values', () => {
    localStorage.setItem('cartCount', 'garbage');
    expect(getCount()).toBe(0);
  });

  it('returns 0 for negative or fractional stored values', () => {
    localStorage.setItem('cartCount', '-2');
    expect(getCount()).toBe(0);
    localStorage.setItem('cartCount', '1.5');
    expect(getCount()).toBe(0);
  });

  it('ignores invalid writes', () => {
    setCount(4);
    setCount(-1);
    setCount(NaN);
    setCount('7');
    expect(getCount()).toBe(4);
  });

  it('does not throw when localStorage is unavailable', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('unavailable');
    });
    expect(() => setCount(2)).not.toThrow();
    spy.mockRestore();
  });
});
