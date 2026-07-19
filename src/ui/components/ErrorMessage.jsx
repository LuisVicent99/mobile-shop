import styles from './ErrorMessage.module.css';

export function ErrorMessage({ message = 'Algo ha ido mal al cargar los datos.', onRetry }) {
  return (
    <div className={styles.error} role="alert">
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
