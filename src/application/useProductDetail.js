import { useCallback, useEffect, useState } from 'react';
import { getProductById } from '../infrastructure/api/productApi.js';
import { mapProductDetail } from '../domain/models/product.js';

/**
 * Loads one product detail through the cached repository. The result is
 * tagged with the id it belongs to, so navigating to another product
 * derives `loading` again instead of showing stale data. A 404 (invalid
 * id in the URL) surfaces as `error.status === 404` so the PDP can render
 * "product not found" with a link back to the list.
 */
export function useProductDetail(id) {
  const [result, setResult] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    getProductById(id)
      .then((data) => {
        if (active) setResult({ id, product: mapProductDetail(data), error: null });
      })
      .catch((error) => {
        if (active) setResult({ id, product: null, error });
      });
    return () => {
      active = false;
    };
  }, [id, version]);

  const retry = useCallback(() => {
    setResult(null);
    setVersion((v) => v + 1);
  }, []);

  const current = result?.id === id ? result : null;

  return {
    product: current?.product ?? null,
    loading: current === null,
    error: current?.error ?? null,
    retry,
  };
}
