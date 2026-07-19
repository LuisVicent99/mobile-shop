import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from '../../application/CartProvider.jsx';
import { ProductDetailPage } from './ProductDetailPage.jsx';
import { getProductById, postCart } from '../../infrastructure/api/productApi.js';
import { ApiError } from '../../infrastructure/api/ApiError.js';

vi.mock('../../infrastructure/api/productApi.js', () => ({
  getProductById: vi.fn(),
  postCart: vi.fn(),
}));

const RAW = {
  id: 'abc',
  brand: 'Acer',
  model: 'Iconia Talk S',
  price: '170',
  imgUrl: 'https://example.com/img.jpg',
  cpu: 'Quad-core 1.3 GHz',
  ram: '2 GB RAM',
  os: 'Android 6.0',
  displayResolution: '7.0 inches',
  battery: 'Li-Ion 3400 mAh',
  primaryCamera: ['13 MP', 'autofocus'],
  secondaryCmera: '2 MP',
  dimentions: '191.7 x 101 x 9.4 mm',
  weight: '260',
  options: {
    colors: [{ code: 1000, name: 'Black' }],
    storages: [
      { code: 2000, name: '16 GB' },
      { code: 2001, name: '32 GB' },
    ],
  },
};

function renderPage(id = 'abc') {
  return render(
    <MemoryRouter initialEntries={[`/product/${id}`]}>
      <CartProvider>
        <Routes>
          <Route path="/product/:id" element={<ProductDetailPage />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  );
}

describe('ProductDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('shows a loader and then the two-column detail', async () => {
    getProductById.mockResolvedValue(RAW);
    renderPage();

    expect(screen.getByText('Cargando producto…')).toBeInTheDocument();

    expect(await screen.findByRole('heading', { name: 'Acer Iconia Talk S' })).toBeInTheDocument();
    // The price shows twice on purpose: highlighted next to the title and in the spec sheet.
    expect(screen.getAllByText('170 €')).toHaveLength(2);
    expect(screen.getByText('Quad-core 1.3 GHz')).toBeInTheDocument();
    expect(screen.getByText('13 MP, autofocus')).toBeInTheDocument();
    expect(screen.getByText('191.7 x 101 x 9.4 mm')).toBeInTheDocument();
    expect(screen.getByText('260 g')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver al listado/i })).toHaveAttribute('href', '/');
  });

  it('renders elegant fallbacks for empty fields', async () => {
    getProductById.mockResolvedValue({ ...RAW, price: '', cpu: '', battery: undefined });
    renderPage();

    await screen.findByRole('heading', { name: 'Acer Iconia Talk S' });
    expect(screen.getByText('Precio no disponible')).toBeInTheDocument();
    expect(screen.getAllByText('No disponible').length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText(/undefined|NaN/)).not.toBeInTheDocument();
  });

  it('shows brand and model in the breadcrumbs', async () => {
    getProductById.mockResolvedValue(RAW);
    renderPage();

    await screen.findByRole('heading', { name: 'Acer Iconia Talk S' });
    const nav = screen.getByRole('navigation', { name: 'Ruta de navegación' });
    expect(nav).toHaveTextContent('Home');
    expect(nav).toHaveTextContent('Acer Iconia Talk S');
  });

  it('shows "product not found" with a link back for an invalid id', async () => {
    getProductById.mockRejectedValue(new ApiError('Internal Server Error', 500));
    renderPage('invalid-id');

    expect(
      await screen.findByText('El producto que buscas no existe o ya no está disponible.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al listado de productos' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });

  it('shows a recoverable error state for network failures', async () => {
    getProductById.mockRejectedValueOnce(new ApiError('Network error', 0));
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se ha podido cargar el producto.',
    );

    getProductById.mockResolvedValue(RAW);
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('heading', { name: 'Acer Iconia Talk S' })).toBeInTheDocument();
  });

  it('adds to cart with the selected codes and updates and persists the header counter', async () => {
    getProductById.mockResolvedValue(RAW);
    postCart.mockResolvedValue({ count: 1 });
    renderPage();

    await screen.findByRole('heading', { name: 'Acer Iconia Talk S' });
    expect(screen.getByRole('status', { name: 'Artículos en la cesta: 0' })).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Almacenamiento'), '32 GB');
    await userEvent.click(screen.getByRole('button', { name: 'Añadir a la cesta' }));

    expect(postCart).toHaveBeenCalledWith({ id: 'abc', colorCode: 1000, storageCode: 2001 });
    expect(
      await screen.findByRole('status', { name: 'Artículos en la cesta: 1' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Producto añadido a la cesta.')).toBeInTheDocument();
    expect(localStorage.getItem('cartCount')).toBe('1');
  });

  it('keeps the counter and shows an error when the POST fails', async () => {
    localStorage.setItem('cartCount', '2');
    getProductById.mockResolvedValue(RAW);
    postCart.mockRejectedValue(new ApiError('Server Error', 500));
    renderPage();

    await screen.findByRole('heading', { name: 'Acer Iconia Talk S' });
    await userEvent.click(screen.getByRole('button', { name: 'Añadir a la cesta' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se ha podido añadir el producto.',
    );
    expect(screen.getByRole('status', { name: 'Artículos en la cesta: 2' })).toBeInTheDocument();
    expect(localStorage.getItem('cartCount')).toBe('2');
  });
});
