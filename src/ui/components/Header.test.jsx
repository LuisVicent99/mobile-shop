import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../../application/CartProvider.jsx';
import { Header } from './Header.jsx';

function renderHeader(props) {
  return render(
    <MemoryRouter>
      <CartProvider>
        <Header {...props} />
      </CartProvider>
    </MemoryRouter>,
  );
}

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('links the app title to the home view', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /mobile shop/i })).toHaveAttribute('href', '/');
  });

  it('shows the cart counter at zero by default', () => {
    renderHeader();
    expect(screen.getByRole('status', { name: 'Artículos en la cesta: 0' })).toBeInTheDocument();
  });

  it('shows the persisted cart count', () => {
    localStorage.setItem('cartCount', '4');
    renderHeader();
    expect(screen.getByRole('status', { name: 'Artículos en la cesta: 4' })).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders the breadcrumbs it receives', () => {
    renderHeader({
      breadcrumbs: [{ label: 'Home', to: '/' }, { label: 'Acer Iconia Talk S' }],
    });
    const nav = screen.getByRole('navigation', { name: 'Ruta de navegación' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByText('Acer Iconia Talk S')).toHaveAttribute('aria-current', 'page');
  });

  it('renders no breadcrumb nav when none are passed', () => {
    renderHeader();
    expect(
      screen.queryByRole('navigation', { name: 'Ruta de navegación' }),
    ).not.toBeInTheDocument();
  });
});
