import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from './ProductCard.jsx';

const PRODUCT = {
  id: 'abc123',
  brand: 'Acer',
  model: 'Iconia Talk S',
  price: '170 €',
  imgUrl: 'https://example.com/img.jpg',
};

function renderCard(product = PRODUCT) {
  return render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>,
  );
}

describe('ProductCard', () => {
  it('shows image, brand, model and price', () => {
    renderCard();
    expect(screen.getByRole('img', { name: 'Acer Iconia Talk S' })).toHaveAttribute(
      'src',
      PRODUCT.imgUrl,
    );
    expect(screen.getByText('Acer')).toBeInTheDocument();
    expect(screen.getByText('Iconia Talk S')).toBeInTheDocument();
    expect(screen.getByText('170 €')).toBeInTheDocument();
  });

  it('links to the product detail route', () => {
    renderCard();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/product/abc123');
  });

  it('renders a dash when the price is missing', () => {
    renderCard({ ...PRODUCT, price: null });
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText(/undefined|NaN/)).not.toBeInTheDocument();
  });

  it('falls back to a placeholder when the image fails to load', () => {
    renderCard();
    fireEvent.error(screen.getByRole('img', { name: 'Acer Iconia Talk S' }));
    const fallback = screen.getByRole('img', { name: 'Acer Iconia Talk S' });
    expect(fallback.tagName).not.toBe('IMG');
    expect(screen.getByText('Imagen no disponible')).toBeInTheDocument();
  });

  it('shows the placeholder directly when there is no image URL', () => {
    renderCard({ ...PRODUCT, imgUrl: null });
    expect(screen.getByRole('img', { name: 'Acer Iconia Talk S' }).tagName).not.toBe('IMG');
  });
});
