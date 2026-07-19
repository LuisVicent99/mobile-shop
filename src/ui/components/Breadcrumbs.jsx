import { Link } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

/**
 * items: [{ label, to? }] — the last item is the current page. Items with
 * a `to` render as links (Home stays navigable even on the list view).
 */
export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Ruta de navegación">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={item.label} className={styles.item}>
              {item.to ? (
                <Link
                  className={isCurrent ? styles.current : styles.link}
                  to={item.to}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={styles.current} aria-current={isCurrent ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
