import { Link } from 'react-router-dom';
import { ProductImage } from './ProductImage.jsx';
import styles from './ProductCard.module.css';

export function ProductCard({ product }) {
  return (
    <Link className={styles.card} to={`/product/${product.id}`}>
      <span className={styles.imageWrap}>
        <ProductImage src={product.imgUrl} alt={`${product.brand} ${product.model}`} />
      </span>
      <span className={styles.brand}>{product.brand}</span>
      <span className={styles.model}>{product.model}</span>
      <span className={styles.price}>{product.price ?? '—'}</span>
    </Link>
  );
}
