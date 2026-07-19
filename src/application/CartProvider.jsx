import { useCallback, useMemo, useState } from 'react';
import { CartContext } from './cartContext.js';
import * as cartStorage from '../infrastructure/storage/cartStorage.js';

export function CartProvider({ children }) {
  const [count, setCount] = useState(() => cartStorage.getCount());

  const updateCount = useCallback((next) => {
    setCount(next);
    cartStorage.setCount(next);
  }, []);

  const value = useMemo(() => ({ count, updateCount }), [count, updateCount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
