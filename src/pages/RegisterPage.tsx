import React from 'react';
import { Form, Input, Button, Card, Select } from 'antd';
import { toast } from 'react-toastify';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const { Option } = Select;

const RegisterPage: React.FC = () => {
  const [form] = Form.useForm();  // Создаем инстанс формы
  const navigate = useNavigate();

  const handleRegister = async (values: { username: string; password: string; role: string; phone: string }) => {
    try {
      await api.post('/auth/register', values);
      toast.success('Регистрация прошла успешно! Теперь вы можете войти.');
      navigate('/login');
    } catch {
      toast.error('Ошибка регистрации.');
    }
  };

  return (
    <div className="auth-page">
      <Card title="Регистрация" className="auth-card">
        <Form form={form} onFinish={handleRegister}>
          <Form.Item name="username" rules={[{ required: true, message: 'Введите имя пользователя' }]}>
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

          <Form.Item name="role" rules={[{ required: true, message: 'Выберите роль' }]}>
            <Select placeholder="Выберите роль">
              <Option value="buyer">Покупатель</Option>
              <Option value="seller">Продавец</Option>
            </Select>
          </Form.Item>

          <Form.Item name="phone" rules={[{ required: true, message: 'Введите номер телефона' }]}>
            <Input placeholder="Номер телефона" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Зарегистрироваться
          </Button>
        </Form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <span>Уже есть аккаунт? </span>
          <Link to="/login">Войти</Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
