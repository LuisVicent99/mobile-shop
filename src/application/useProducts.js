import { useCallback, useEffect, useState } from 'react';
import { getProducts } from '../infrastructure/api/productApi.js';
import { mapProductListItem } from '../domain/models/product.js';

/**
 * Loads the product list through the cached repository and exposes the
 * screen states the PLP needs. `loading` is derived: while there is no
 * result yet the hook is loading. `retry` clears the result and bumps a
 * version to re-run the effect after a failure.
 */
export function useProducts() {
  const [result, setResult] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    getProducts()
      .then((data) => {
        if (!active) return;
        const products = Array.isArray(data) ? data.map(mapProductListItem) : [];
        setResult({ products, error: null });
      })
      .catch((error) => {
        if (active) setResult({ products: [], error });
      });
    return () => {
      active = false;
    };
  }, [version]);

  const retry = useCallback(() => {
    setResult(null);
    setVersion((v) => v + 1);
  }, []);

  return {
    products: result?.products ?? [],
    loading: result === null,
    error: result?.error ?? null,
    retry,
  };
}
