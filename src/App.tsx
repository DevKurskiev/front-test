import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Layout } from 'antd';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import OrdersPage from './pages/OrdersPage';
import TransactionsPage from './pages/TransactionsPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import SupportFooter from './components/SupportFooter';
import AccountVerificationModal from './components/AccountVerificationModal';

const { Content } = Layout;

function App() {
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    // @ts-ignore
    if (user?.verified !== undefined) setIsVerified(user.verified);
  }, [user]);
  
  return (
    <Layout style={{ height: '100vh' }}>
      <ToastContainer />
      <AccountVerificationModal isVerified={isVerified} />
      {user && <Header />}
      <Content style={{ padding: '24px', backgroundColor: '#fff' }}>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/" element={<Navigate to="/orders" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminPage />} />

          {/* Защищённые маршруты */}
          <Route element={<ProtectedRoute />}>
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
          </Route>
        </Routes>
      </Content>
      {window.location.pathname !== "/admin" && <SupportFooter />}
    </Layout>
  );
}

export default App;
