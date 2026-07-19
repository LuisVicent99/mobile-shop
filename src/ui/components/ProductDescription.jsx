import styles from './ProductDescription.module.css';

const FALLBACK = 'No disponible';

export function ProductDescription({ product }) {
  const rows = [
    ['Marca', product.brand || null],
    ['Modelo', product.model || null],
    ['Precio', product.price],
    ['CPU', product.specs.cpu],
    ['RAM', product.specs.ram],
    ['Sistema operativo', product.specs.os],
    ['Resolución de pantalla', product.specs.displayResolution],
    ['Batería', product.specs.battery],
    ['Cámara principal', product.specs.primaryCamera],
    ['Cámara frontal', product.specs.secondaryCamera],
    ['Dimensiones', product.specs.dimensions],
    ['Peso', product.specs.weight],
  ];

  return (
    <dl className={styles.list}>
      {rows.map(([term, value]) => (
        <div key={term} className={styles.row}>
          <dt className={styles.term}>{term}</dt>
          <dd className={value ? styles.value : styles.missing}>{value ?? FALLBACK}</dd>
        </div>
      ))}
    </dl>
  );
}
