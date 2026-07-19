import { test, expect } from '@playwright/test';

const PRODUCTS = [
  { id: 'p1', brand: 'Acer', model: 'Iconia Talk S', price: '170', imgUrl: '/images/p1.jpg' },
  { id: 'p2', brand: 'Acer', model: 'Liquid Z6', price: '120', imgUrl: '/images/p2.jpg' },
  { id: 'p3', brand: 'Samsung', model: 'Galaxy S8', price: '', imgUrl: '/images/p3.jpg' },
];

const DETAIL = {
  ...PRODUCTS[0],
  cpu: 'Quad-core 1.3 GHz Cortex-A53',
  ram: '2 GB RAM',
  os: 'Android 6.0 (Marshmallow)',
  displayResolution: '7.0 inches',
  battery: 'Li-Ion 3400 mAh',
  primaryCamera: ['13 MP', 'autofocus'],
  secondaryCmera: '2 MP',
  dimentions: '191.7 x 101 x 9.4 mm',
  weight: '260',
  options: {
    colors: [
      { code: 1000, name: 'Black' },
      { code: 1001, name: 'White' },
    ],
    storages: [
      { code: 2000, name: '16 GB' },
      { code: 2001, name: '32 GB' },
    ],
  },
};

async function mockApi(page, { failList = false } = {}) {
  await page.route('**/api/product', (route) =>
    failList
      ? route.fulfill({ status: 500, json: { error: 'down' } })
      : route.fulfill({ json: PRODUCTS }),
  );
  await page.route('**/api/product/*', (route) => route.fulfill({ json: DETAIL }));
  await page.route('**/api/cart', (route) => route.fulfill({ json: { count: 1 } }));
  await page.route('**/images/**', (route) => route.fulfill({ status: 404, body: '' }));
}

const grid = (page) => page.getByRole('list', { name: 'Productos' });
const search = (page) => page.getByRole('searchbox');
const cartCounter = (page, count) =>
  page.getByRole('status', { name: `Artículos en la cesta: ${count}` });

test('carga la PLP y renderiza el grid de productos', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');

  await expect(grid(page)).toBeVisible();
  await expect(grid(page).getByRole('listitem')).toHaveCount(3);
  await expect(page.getByText('Iconia Talk S')).toBeVisible();
  await expect(page.getByText('170 €')).toBeVisible();
  await expect(cartCounter(page, 0)).toBeVisible();
});

test('la búsqueda filtra en tiempo real por marca y por modelo', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  await expect(grid(page).getByRole('listitem')).toHaveCount(3);

  await search(page).fill('samsung');
  await expect(grid(page).getByRole('listitem')).toHaveCount(1);
  await expect(page.getByText('Galaxy S8')).toBeVisible();

  await search(page).fill('liquid');
  await expect(grid(page).getByRole('listitem')).toHaveCount(1);
  await expect(page.getByText('Liquid Z6')).toBeVisible();

  await search(page).fill('nokia');
  await expect(grid(page)).toBeHidden();
  await expect(page.getByText('No hay resultados para «nokia».')).toBeVisible();
});

test('navega de la PLP a la PDP y vuelve con el enlace', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');

  await page.getByRole('link', { name: /Acer Iconia Talk S/ }).click();
  await expect(page).toHaveURL('/product/p1');
  await expect(page.getByRole('heading', { name: 'Acer Iconia Talk S' })).toBeVisible();
  await expect(page.getByLabel('Almacenamiento')).toHaveValue('2000');
  await expect(page.getByLabel('Color')).toHaveValue('1000');

  await page.getByRole('link', { name: 'Volver al listado' }).click();
  await expect(page).toHaveURL('/');
  await expect(grid(page)).toBeVisible();
});

test('añade a la cesta, el contador del header se actualiza y persiste tras recargar', async ({
  page,
}) => {
  await mockApi(page);
  await page.goto('/product/p1');
  await expect(cartCounter(page, 0)).toBeVisible();

  await page.getByLabel('Almacenamiento').selectOption('2001');
  await page.getByLabel('Color').selectOption('1001');

  const postRequest = page.waitForRequest(
    (request) => request.url().includes('/api/cart') && request.method() === 'POST',
  );
  await page.getByRole('button', { name: 'Añadir a la cesta' }).click();

  const request = await postRequest;
  expect(request.postDataJSON()).toEqual({ id: 'p1', colorCode: 1001, storageCode: 2001 });

  await expect(cartCounter(page, 1)).toBeVisible();
  await expect(page.getByText('Producto añadido a la cesta.')).toBeVisible();

  await page.reload();
  await expect(cartCounter(page, 1)).toBeVisible();
});

test('muestra el estado de error cuando el API falla', async ({ page }) => {
  await mockApi(page, { failList: true });
  await page.goto('/');

  await expect(page.getByRole('alert')).toContainText('No se han podido cargar los productos.');
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
});
