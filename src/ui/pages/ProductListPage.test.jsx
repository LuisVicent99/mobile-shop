import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../../application/CartProvider.jsx';
import { ProductListPage } from './ProductListPage.jsx';
import { getProducts } from '../../infrastructure/api/productApi.js';

vi.mock('../../infrastructure/api/productApi.js', () => ({
  getProducts: vi.fn(),
  postCart: vi.fn(),
}));

const RAW = [
  { id: '1', brand: 'Acer', model: 'Iconia Talk S', price: '170', imgUrl: 'a.jpg' },
  { id: '2', brand: 'Acer', model: 'Liquid Z6', price: '120', imgUrl: 'b.jpg' },
  { id: '3', brand: 'Samsung', model: 'Galaxy S8', price: '', imgUrl: 'c.jpg' },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <CartProvider>
        <ProductListPage />
      </CartProvider>
    </MemoryRouter>,
  );
}

const findGrid = () => screen.findByRole('list', { name: 'Productos' });
const queryGrid = () => screen.queryByRole('list', { name: 'Productos' });

describe('ProductListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('shows a loader and then the full grid', async () => {
    getProducts.mockResolvedValue(RAW);
    renderPage();

    expect(screen.getByText('Cargando productos…')).toBeInTheDocument();

    const grid = await findGrid();
    expect(within(grid).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('3 productos')).toBeInTheDocument();
    // Empty price renders the fallback, never undefined/NaN.
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('filters in real time by brand', async () => {
    getProducts.mockResolvedValue(RAW);
    renderPage();
    await findGrid();

    await userEvent.type(screen.getByRole('searchbox'), 'samsung');

    expect(within(queryGrid()).getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('Galaxy S8')).toBeInTheDocument();
    expect(screen.queryByText('Iconia Talk S')).not.toBeInTheDocument();
  });

  it('filters in real time by model, case-insensitively', async () => {
    getProducts.mockResolvedValue(RAW);
    renderPage();
    await findGrid();

    await userEvent.type(screen.getByRole('searchbox'), 'LIQUID');

    expect(within(queryGrid()).getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('Liquid Z6')).toBeInTheDocument();
  });

  it('shows the empty state when the search has no results', async () => {
    getProducts.mockResolvedValue(RAW);
    renderPage();
    await findGrid();

    await userEvent.type(screen.getByRole('searchbox'), 'nokia');

    expect(queryGrid()).not.toBeInTheDocument();
    expect(screen.getByText('No hay resultados para «nokia».')).toBeInTheDocument();
  });

  it('shows an empty state when the API returns no products', async () => {
    getProducts.mockResolvedValue([]);
    renderPage();

    expect(
      await screen.findByText('No hay productos disponibles en este momento.'),
    ).toBeInTheDocument();
  });

  it('shows the API error state and recovers on retry', async () => {
    getProducts.mockRejectedValueOnce(new Error('down'));
    renderPage();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No se han podido cargar los productos.');

    getProducts.mockResolvedValue(RAW);
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await findGrid()).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
