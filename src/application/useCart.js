import { useCallback, useContext, useState } from 'react';
import { CartContext } from './cartContext.js';
import { postCart } from '../infrastructure/api/productApi.js';
import { isValidSelection } from '../domain/services/cartSelection.js';

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  const { count, updateCount } = context;

  const [status, setStatus] = useState('idle');

  const addToCart = useCallback(
    async (selection) => {
      if (!isValidSelection(selection)) {
        setStatus('error');
        return;
      }
      setStatus('loading');
      try {
        const response = await postCart(selection);
        const next = response?.count;
        updateCount(Number.isInteger(next) && next >= 0 ? next : count + 1);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    },
    [count, updateCount],
  );

  return { count, status, addToCart };
}
