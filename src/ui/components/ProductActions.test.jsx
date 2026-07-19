import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductActions } from './ProductActions.jsx';

const COLORS = [
  { code: 1000, name: 'Black' },
  { code: 1001, name: 'White' },
];
const STORAGES = [
  { code: 2000, name: '16 GB' },
  { code: 2001, name: '32 GB' },
];

function renderActions(props = {}) {
  const onAdd = vi.fn();
  render(
    <ProductActions colors={COLORS} storages={STORAGES} status="idle" onAdd={onAdd} {...props} />,
  );
  return { onAdd };
}

describe('ProductActions', () => {
  it('preselects the first option of each selector by default', () => {
    renderActions();
    expect(screen.getByLabelText('Almacenamiento')).toHaveValue('2000');
    expect(screen.getByLabelText('Color')).toHaveValue('1000');
  });

  it('still renders the selector when there is a single option, preselected', () => {
    renderActions({
      colors: [{ code: 1000, name: 'Black' }],
      storages: [{ code: 2000, name: '32 GB' }],
    });
    const storage = screen.getByLabelText('Almacenamiento');
    expect(storage).toBeInTheDocument();
    expect(storage).toHaveValue('2000');
    expect(screen.getByLabelText('Color')).toHaveValue('1000');
  });

  it('emits the selected codes when adding', async () => {
    const { onAdd } = renderActions();

    await userEvent.selectOptions(screen.getByLabelText('Almacenamiento'), '32 GB');
    await userEvent.selectOptions(screen.getByLabelText('Color'), 'White');
    await userEvent.click(screen.getByRole('button', { name: 'Añadir a la cesta' }));

    expect(onAdd).toHaveBeenCalledWith({ colorCode: 1001, storageCode: 2001 });
  });

  it('disables the button and shows progress while the request is in flight', () => {
    renderActions({ status: 'loading' });
    expect(screen.getByRole('button', { name: 'Añadiendo…' })).toBeDisabled();
  });

  it('shows the success feedback', () => {
    renderActions({ status: 'success' });
    expect(screen.getByRole('status')).toHaveTextContent('Producto añadido a la cesta.');
  });

  it('shows the error feedback', () => {
    renderActions({ status: 'error' });
    expect(screen.getByRole('alert')).toHaveTextContent('No se ha podido añadir el producto.');
  });
});
