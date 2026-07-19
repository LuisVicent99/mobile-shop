import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './application/CartProvider.jsx';
import { AppRouter } from './ui/router/AppRouter.jsx';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
