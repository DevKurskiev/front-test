import React, { useState } from 'react';
import { Button, Input, Form, Card } from 'antd';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', values);
      login(response.data.accessToken, response.data.refreshToken, values);
      toast.success('Вход успешный');
      navigate('/orders');
    } catch (error) {
      toast.error('Неправильный пароль и/или имя пользователя');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card title="Войти" className="auth-card">
        <Form onFinish={handleLogin}>
          <Form.Item name="username" rules={[{ required: true, message: 'Пожалуйста, введите ваше имя пользователя' }]}>
            <Input placeholder="Имя пользователя" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Введите пароль' },
              { min: 6, message: 'Пароль должен быть не менее 6 символов' },
            ]}
          >
            <Input.Password placeholder="Пароль" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Войти
          </Button>
        </Form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <span>У вас нет аккаунта? </span>
          <Link to="/register">Зарегистрироваться</Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
