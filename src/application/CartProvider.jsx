import { useCallback, useMemo, useState } from 'react';
import { CartContext } from './cartContext.js';
import * as cartStorage from '../infrastructure/storage/cartStorage.js';

/**
 * Rehydrates the cart counter from localStorage on mount and persists
 * every update, so the Header shows the same count on any view and
 * after a full reload.
 */
export function CartProvider({ children }) {
  const [count, setCount] = useState(() => cartStorage.getCount());

  const updateCount = useCallback((next) => {
    setCount(next);
    cartStorage.setCount(next);
  }, []);

  const value = useMemo(() => ({ count, updateCount }), [count, updateCount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
