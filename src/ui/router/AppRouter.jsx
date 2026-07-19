import { Routes, Route } from 'react-router-dom';
import { ProductListPage } from '../pages/ProductListPage.jsx';
import { ProductDetailPage } from '../pages/ProductDetailPage.jsx';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<ProductListPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
    </Routes>
  );
}
