import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useProducts } from './useProducts.js';
import { getProducts } from '../infrastructure/api/productApi.js';

vi.mock('../infrastructure/api/productApi.js', () => ({
  getProducts: vi.fn(),
}));

const RAW = [{ id: '1', brand: 'Acer', model: 'Iconia', price: '170', imgUrl: 'img.jpg' }];

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts loading and resolves with mapped products', async () => {
    getProducts.mockResolvedValue(RAW);
    const { result } = renderHook(() => useProducts());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.products).toEqual([
      { id: '1', brand: 'Acer', model: 'Iconia', price: '170 €', imgUrl: 'img.jpg' },
    ]);
  });

  it('exposes the error and recovers via retry', async () => {
    getProducts.mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.products).toEqual([]);

    getProducts.mockResolvedValue(RAW);
    act(() => result.current.retry());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.products).toHaveLength(1);
  });

  it('treats a non-array payload as an empty list', async () => {
    getProducts.mockResolvedValue({ unexpected: true });
    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
