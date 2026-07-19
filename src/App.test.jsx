import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.jsx';

vi.mock('./infrastructure/api/productApi.js', () => ({
  getProducts: vi.fn().mockResolvedValue([]),
  getProductById: vi.fn(),
  postCart: vi.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('renders the header with the cart counter and the list page', async () => {
    render(<App />);

    expect(screen.getByRole('link', { name: /mobile shop/i })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Artículos en la cesta: 0' })).toBeInTheDocument();
    expect(
      await screen.findByText('No hay productos disponibles en este momento.'),
    ).toBeInTheDocument();
  });
});
