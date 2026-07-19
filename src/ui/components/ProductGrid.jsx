import { ProductCard } from './ProductCard.jsx';
import styles from './ProductGrid.module.css';

export function ProductGrid({ products }) {
  return (
    <ul className={styles.grid} aria-label="Productos">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
