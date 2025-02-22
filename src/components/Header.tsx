import React, { useState } from 'react';
import { Layout, Menu, Button, Drawer, Grid } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { useBreakpoint } = Grid;

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  return (
    <AntHeader className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {/* Меню для десктопной версии */}
      {!isMobile && (
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={[location.pathname]}
          selectedKeys={[location.pathname]}
          style={{ flex: 1 }}
        >
          <Menu.Item key="/orders">
            <Link to="/orders">Ордеры</Link>
          </Menu.Item>
          <Menu.Item key="/transactions">
            <Link to="/transactions">Мои транзакции</Link>
          </Menu.Item>
        </Menu>
      )}

      {/* Иконка меню для мобильной версии */}
      {isMobile && (
        <Button
          type="text"
          icon={<MenuOutlined style={{ fontSize: '20px', color: '#fff' }} />}
          onClick={toggleDrawer}
          style={{ display: 'block', marginBottom: 'none' }}
        />
      )}

      {/* Drawer для мобильного меню */}
      <Drawer
        title="Меню"
        placement="right"
        closable
        onClose={toggleDrawer}
        visible={drawerVisible}
      >
        <Menu
          mode="vertical"
          defaultSelectedKeys={[location.pathname]}
          selectedKeys={[location.pathname]}
          onClick={() => setDrawerVisible(false)}
        >
          <Menu.Item key="/orders">
            <Link to="/orders">Ордеры</Link>
          </Menu.Item>
          <Menu.Item key="/transactions">
            <Link to="/transactions">Мои транзакции</Link>
          </Menu.Item>
        </Menu>
      </Drawer>

      {/* Пользователь и кнопка выхода */}
      <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
        <span style={{ color: '#fff', marginRight: '16px' }}>
          Добро пожаловать, {user?.username || 'Гость'}
        </span>
        <Button onClick={handleLogout} type="primary">
          Выйти
        </Button>
      </div>
    </AntHeader>
  );
};

export default Header;
