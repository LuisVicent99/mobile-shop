import { useMemo, useState } from 'react';
import { useProducts } from '../../application/useProducts.js';
import { filterProducts } from '../../domain/services/filterProducts.js';
import { Header } from '../components/Header.jsx';
import { SearchBar } from '../components/SearchBar.jsx';
import { ProductGrid } from '../components/ProductGrid.jsx';
import { Loader } from '../components/Loader.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import styles from './ProductListPage.module.css';

export function ProductListPage() {
  const { products, loading, error, retry } = useProducts();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => filterProducts(products, query), [products, query]);
  const ready = !loading && !error;

  return (
    <>
      <Header breadcrumbs={[{ label: 'Home', to: '/' }]} />
      <main className={styles.main}>
        <div className={styles.toolbar}>
          <h1 className={styles.title}>Catálogo de móviles</h1>
          <SearchBar value={query} onChange={setQuery} />
        </div>

        {loading && <Loader label="Cargando productos…" />}
        {error && <ErrorMessage message="No se han podido cargar los productos." onRetry={retry} />}

        {ready && (
          <p className={styles.resultCount} role="status">
            {filtered.length === 1 ? '1 producto' : `${filtered.length} productos`}
          </p>
        )}
        {ready && filtered.length > 0 && <ProductGrid products={filtered} />}
        {ready && products.length === 0 && (
          <EmptyState message="No hay productos disponibles en este momento." />
        )}
        {ready && products.length > 0 && filtered.length === 0 && (
          <EmptyState message={`No hay resultados para «${query.trim()}».`} />
        )}
      </main>
    </>
  );
}
