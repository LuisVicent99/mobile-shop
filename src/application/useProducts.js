import { useCallback, useEffect, useState } from 'react';
import { getProducts } from '../infrastructure/api/productApi.js';
import { mapProductListItem } from '../domain/models/product.js';

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
