
import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import ProductDashboard from './components/ProductDashboard';
import Calculator from './components/Calculator';
import AdminDashboard from './components/AdminDashboard';

type AppState = 'login' | 'dashboard' | 'calculator' | 'admin';

const App: React.FC = () => {
  const [view, setView] = useState<AppState>('login');
  const [userEmail, setUserEmail] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUserEmail('');
    setView('login');
  };

  const handleSelectProduct = (productId: string) => {
    if (productId === 'admin') {
        setView('admin');
        return;
    }

    setSelectedProduct(productId);
    if (productId === 'uv2025') {
      setView('calculator');
    } else {
      alert('Sản phẩm này đang được cập nhật.');
    }
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedProduct('');
  };

  return (
    <>
      {view === 'login' && (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}

      {view === 'dashboard' && (
        <ProductDashboard 
          userEmail={userEmail}
          onSelectProduct={handleSelectProduct}
          onLogout={handleLogout}
        />
      )}

      {view === 'calculator' && (
        <Calculator 
          userEmail={userEmail}
          onBack={handleBackToDashboard} 
        />
      )}

      {view === 'admin' && (
        <AdminDashboard 
          onBack={handleBackToDashboard} 
        />
      )}
    </>
  );
};

export default App;
