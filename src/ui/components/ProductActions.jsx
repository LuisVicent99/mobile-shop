import { useState } from 'react';
import { getDefaultCode } from '../../domain/services/cartSelection.js';
import styles from './ProductActions.module.css';

export function ProductActions({ colors, storages, status, onAdd }) {
  const [colorCode, setColorCode] = useState(() => getDefaultCode(colors));
  const [storageCode, setStorageCode] = useState(() => getDefaultCode(storages));

  const adding = status === 'loading';
  const canAdd = !adding && colorCode !== null && storageCode !== null;

  return (
    <form
      className={styles.actions}
      onSubmit={(event) => {
        event.preventDefault();
        onAdd({ colorCode, storageCode });
      }}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor="storage-select">
          Almacenamiento
        </label>
        <select
          id="storage-select"
          className={styles.select}
          value={storageCode ?? ''}
          onChange={(event) => setStorageCode(Number(event.target.value))}
        >
          {storages.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="color-select">
          Color
        </label>
        <select
          id="color-select"
          className={styles.select}
          value={colorCode ?? ''}
          onChange={(event) => setColorCode(Number(event.target.value))}
        >
          {colors.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <button className={styles.add} type="submit" disabled={!canAdd}>
        {adding ? 'Añadiendo…' : 'Añadir a la cesta'}
      </button>

      {status === 'success' && (
        <p className={styles.success} role="status">
          Producto añadido a la cesta.
        </p>
      )}
      {status === 'error' && (
        <p className={styles.error} role="alert">
          No se ha podido añadir el producto. Inténtalo de nuevo.
        </p>
      )}
    </form>
  );
}
