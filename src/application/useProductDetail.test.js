import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useProductDetail } from './useProductDetail.js';
import { getProductById } from '../infrastructure/api/productApi.js';
import { ApiError } from '../infrastructure/api/ApiError.js';

vi.mock('../infrastructure/api/productApi.js', () => ({
  getProductById: vi.fn(),
}));

const RAW = {
  id: 'abc',
  brand: 'Acer',
  model: 'Iconia',
  price: '170',
  options: { colors: [{ code: 1000, name: 'Black' }], storages: [{ code: 2000, name: '16 GB' }] },
};

describe('useProductDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and maps the detail for the given id', async () => {
    getProductById.mockResolvedValue(RAW);
    const { result } = renderHook(() => useProductDetail('abc'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getProductById).toHaveBeenCalledWith('abc');
    expect(result.current.product.brand).toBe('Acer');
    expect(result.current.product.colors).toEqual([{ code: 1000, name: 'Black' }]);
  });

  it('surfaces a 404 so the page can render "product not found"', async () => {
    getProductById.mockRejectedValue(new ApiError('Not Found', 404));
    const { result } = renderHook(() => useProductDetail('bad-id'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.product).toBeNull();
    expect(result.current.error.status).toBe(404);
  });

  it('reloads when the id changes', async () => {
    getProductById.mockResolvedValue(RAW);
    const { result, rerender } = renderHook(({ id }) => useProductDetail(id), {
      initialProps: { id: 'abc' },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    getProductById.mockResolvedValue({ ...RAW, id: 'other', brand: 'Samsung' });
    rerender({ id: 'other' });

    await waitFor(() => expect(result.current.product?.brand).toBe('Samsung'));
    expect(getProductById).toHaveBeenLastCalledWith('other');
  });

  it('recovers from a failure via retry', async () => {
    getProductById.mockRejectedValueOnce(new ApiError('Server Error', 500));
    const { result } = renderHook(() => useProductDetail('abc'));
    await waitFor(() => expect(result.current.error).not.toBeNull());

    getProductById.mockResolvedValue(RAW);
    act(() => result.current.retry());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.product.id).toBe('abc');
  });
});
