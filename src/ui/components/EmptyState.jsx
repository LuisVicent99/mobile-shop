import styles from './EmptyState.module.css';

export function EmptyState({ message }) {
  return (
    <div className={styles.empty}>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
