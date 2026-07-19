import { Link } from 'react-router-dom';
import { Header } from '../components/Header.jsx';

// Placeholder route target so the PLP navigation works end to end; the
// full detail view is built on top of this in the next iteration.
export function ProductDetailPage() {
  return (
    <>
      <Header breadcrumbs={[{ label: 'Home', to: '/' }]} />
      <main>
        <Link to="/">Volver al listado</Link>
      </main>
    </>
  );
}
