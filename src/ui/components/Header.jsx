import { Link } from 'react-router-dom';
import { useCart } from '../../application/useCart.js';
import { Breadcrumbs } from './Breadcrumbs.jsx';
import styles from './Header.module.css';

export function Header({ breadcrumbs = [] }) {
  const { count } = useCart();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.logo} to="/">
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <rect x="7" y="2.5" width="10" height="19" rx="2" />
            <line x1="10.5" y1="18.5" x2="13.5" y2="18.5" />
          </svg>
          Mobile Shop
        </Link>
        {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
        <span className={styles.cart} role="status" aria-label={`Artículos en la cesta: ${count}`}>
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="17" cy="20" r="1.5" />
            <path d="M3 4h2l2.6 11.6a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20.5 8H6" />
          </svg>
          <span className={styles.count} aria-hidden="true">
            {count}
          </span>
        </span>
      </div>
    </header>
  );
}
