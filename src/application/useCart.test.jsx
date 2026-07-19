import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { CartProvider } from './CartProvider.jsx';
import { useCart } from './useCart.js';
import { postCart } from '../infrastructure/api/productApi.js';

vi.mock('../infrastructure/api/productApi.js', () => ({
  postCart: vi.fn(),
}));

const SELECTION = { id: 'abc', colorCode: 1000, storageCode: 2000 };

function renderUseCart() {
  return renderHook(() => useCart(), { wrapper: CartProvider });
}

describe('useCart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('starts at zero on a clean storage', () => {
    const { result } = renderUseCart();
    expect(result.current.count).toBe(0);
    expect(result.current.status).toBe('idle');
  });

  it('rehydrates the persisted count on mount', () => {
    localStorage.setItem('cartCount', '5');
    const { result } = renderUseCart();
    expect(result.current.count).toBe(5);
  });

  it('ignores a corrupt persisted count', () => {
    localStorage.setItem('cartCount', 'garbage');
    const { result } = renderUseCart();
    expect(result.current.count).toBe(0);
  });

  it('adds to cart: loading while in flight, then success, count updated and persisted', async () => {
    let resolvePost;
    postCart.mockReturnValue(new Promise((resolve) => (resolvePost = resolve)));
    const { result } = renderUseCart();

    act(() => {
      result.current.addToCart(SELECTION);
    });
    expect(result.current.status).toBe('loading');

    await act(async () => resolvePost({ count: 1 }));

    expect(postCart).toHaveBeenCalledWith(SELECTION);
    expect(result.current.status).toBe('success');
    expect(result.current.count).toBe(1);
    expect(localStorage.getItem('cartCount')).toBe('1');
  });

  it('keeps the count and reports error when the POST fails', async () => {
    localStorage.setItem('cartCount', '2');
    postCart.mockRejectedValue(new Error('network down'));
    const { result } = renderUseCart();

    await act(() => result.current.addToCart(SELECTION));

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.count).toBe(2);
    expect(localStorage.getItem('cartCount')).toBe('2');
  });

  it('rejects an invalid selection without calling the API', async () => {
    const { result } = renderUseCart();

    await act(() => result.current.addToCart({ id: 'abc', colorCode: null, storageCode: 2000 }));

    expect(postCart).not.toHaveBeenCalled();
    expect(result.current.status).toBe('error');
  });

  it('shares the count between consumers of the same provider', async () => {
    postCart.mockResolvedValue({ count: 3 });
    const { result } = renderHook(() => ({ a: useCart(), b: useCart() }), {
      wrapper: CartProvider,
    });

    await act(() => result.current.a.addToCart(SELECTION));

    expect(result.current.b.count).toBe(3);
  });

  it('throws when used outside a CartProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useCart())).toThrow(/CartProvider/);
    spy.mockRestore();
  });
});
