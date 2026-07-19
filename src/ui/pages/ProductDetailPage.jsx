import { Link, useParams } from 'react-router-dom';
import { useProductDetail } from '../../application/useProductDetail.js';
import { useCart } from '../../application/useCart.js';
import { Header } from '../components/Header.jsx';
import { ProductImage } from '../components/ProductImage.jsx';
import { ProductDescription } from '../components/ProductDescription.jsx';
import { ProductActions } from '../components/ProductActions.jsx';
import { Loader } from '../components/Loader.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import styles from './ProductDetailPage.module.css';

export function ProductDetailPage() {
  const { id } = useParams();
  const { product, loading, error, retry } = useProductDetail(id);
  const { status, addToCart } = useCart();

  // The API answers 500 (not 404) for unknown ids, so both are treated as
  // "product not found"; anything else is a recoverable API error.
  const notFound = error !== null && (error.status === 404 || error.status === 500);

  const breadcrumbs = [{ label: 'Home', to: '/' }];
  if (product) breadcrumbs.push({ label: `${product.brand} ${product.model}`.trim() });

  return (
    <>
      <Header breadcrumbs={breadcrumbs} />
      <main className={styles.main}>
        <Link className={styles.back} to="/">
          <span aria-hidden="true">←</span> Volver al listado
        </Link>

        {loading && <Loader label="Cargando producto…" />}

        {notFound && (
          <div className={styles.notFound}>
            <p>El producto que buscas no existe o ya no está disponible.</p>
            <Link to="/">Volver al listado de productos</Link>
          </div>
        )}
        {error && !notFound && (
          <ErrorMessage message="No se ha podido cargar el producto." onRetry={retry} />
        )}

        {product && (
          <article className={styles.layout}>
            <div className={styles.imageColumn}>
              <ProductImage src={product.imgUrl} alt={`${product.brand} ${product.model}`} />
            </div>
            <div className={styles.infoColumn}>
              <header className={styles.titleBlock}>
                <h1 className={styles.title}>
                  {product.brand} {product.model}
                </h1>
                <p className={styles.price}>{product.price ?? 'Precio no disponible'}</p>
              </header>

              <section aria-label="Descripción del producto">
                <h2 className={styles.sectionTitle}>Características</h2>
                <ProductDescription product={product} />
              </section>

              <section aria-label="Acciones de compra">
                <h2 className={styles.sectionTitle}>Configura tu compra</h2>
                <ProductActions
                  colors={product.colors}
                  storages={product.storages}
                  status={status}
                  onAdd={(selection) => addToCart({ id: product.id, ...selection })}
                />
              </section>
            </div>
          </article>
        )}
      </main>
    </>
  );
}
