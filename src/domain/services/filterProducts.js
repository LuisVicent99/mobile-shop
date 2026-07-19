/**
 * Real-time client-side search. Matches the query against the combined
 * "brand model" label case-insensitively, which covers matches on the
 * brand alone, the model alone, or a query spanning both ("acer liquid").
 */
export function filterProducts(products, query) {
  const term = (query ?? '').trim().toLowerCase();
  if (!term) return products;
  return products.filter((product) =>
    `${product.brand} ${product.model}`.toLowerCase().includes(term),
  );
}
