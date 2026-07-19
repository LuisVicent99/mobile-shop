import { useState } from 'react';
import styles from './ProductImage.module.css';

/**
 * Product photo with a graceful fallback: when there is no URL or the
 * image fails to load, a placeholder with the same footprint is shown so
 * the layout never breaks.
 */
export function ProductImage({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className={styles.fallback} role="img" aria-label={alt}>
        <svg
          viewBox="0 0 24 24"
          width="48"
          height="48"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <rect x="7" y="2.5" width="10" height="19" rx="2" />
          <line x1="10.5" y1="18.5" x2="13.5" y2="18.5" />
        </svg>
        <span className={styles.fallbackText}>Imagen no disponible</span>
      </span>
    );
  }

  return (
    <img
      className={styles.image}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
