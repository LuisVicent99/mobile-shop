import { useCallback, useEffect, useState } from 'react';
import { getProductById } from '../infrastructure/api/productApi.js';
import { mapProductDetail } from '../domain/models/product.js';

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
