import styles from './SearchBar.module.css';

export function SearchBar({ value, onChange }) {
  return (
    <div className={styles.searchBar}>
      <label className="visually-hidden" htmlFor="product-search">
        Buscar por marca o modelo
      </label>
      <input
        id="product-search"
        className={styles.input}
        type="search"
        placeholder="Buscar por marca o modelo…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
