import { createContext } from 'react';

// Holds { count, updateCount }. Lives in its own file so the provider
// component and the hook can share it without breaking Fast Refresh.
export const CartContext = createContext(null);
