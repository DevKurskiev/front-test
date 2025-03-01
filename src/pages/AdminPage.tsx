import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, Popconfirm, notification } from 'antd';
import { LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

interface User {
  id: number;
  username: string;
  phone: string;
  passwordHash: string;
  verified: boolean;
}

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const isAdmin = user?.role === "admin"

    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersResponse, ordersResponse, transactionsResponse] = await Promise.all([
          api.get('/users'),
          api.get('/orders'),
          api.get('/transactions')
        ]);

        setUsers(usersResponse.data);
        setOrders(ordersResponse.data.data);
        setTransactions(transactionsResponse.data.data);
      } catch (error) {
        notification.error({ message: 'Не удалось загрузить данные' });
      } finally {
        setLoading(false);
      }
    };
    
    if(isAdmin) {
      fetchData()
    } else {
      toast.error("Ар вал сих")
    }
  }, [user]);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      setLoading(true);
      await api.put(`/users/${editingUser.id}`, editingUser); // Патч запроса для обновления пользователя
      notification.success({ message: 'Данные пользователя обновлены' });
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === editingUser.id ? editingUser : user))
      );
      setEditingUser(null);
    } catch (error) {
      notification.error({ message: 'Ошибка при обновлении данных' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await api.delete(`/users/${userId}`); // Запрос на удаление пользователя
      notification.success({ message: 'Пользователь удален' });
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      notification.error({ message: 'Ошибка при удалении пользователя' });
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    try {
      await api.delete(`/orders/${orderId}`);
      notification.success({ message: 'Ордер удален' });
      // @ts-ignore
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (error) {
      notification.error({ message: 'Ошибка при удалении ордера' });
    }
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    try {
      await api.delete(`/transactions/${transactionId}`);
      notification.success({ message: 'Транзакция удалена' });
      // @ts-ignore
      setTransactions(transactions.filter(transaction => transaction.id !== transactionId));
    } catch (error) {
      notification.error({ message: 'Ошибка при удалении транзакции' });
    }
  };

  const orderColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Валютная пара',
      dataIndex: 'currencyPair',
      key: 'currencyPair',
    },
    {
      title: 'Тип операции',
      dataIndex: 'operationType',
      key: 'operationType',
    },
    {
      title: 'Курс обмена',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Продавец',
      dataIndex: ['seller', 'username'],
      key: 'seller',
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: any) => (
        <Popconfirm
          title="Вы уверены, что хотите удалить этот ордер?"
          onConfirm={() => handleDeleteOrder(record.id)}
          okText="Да"
          cancelText="Нет"
        >
          <Button type="link" danger>
            Удалить
          </Button>
        </Popconfirm>
      ),
    },
  ];  

  const transactionColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Покупатель',
      dataIndex: ['buyer', 'username'],
      key: 'buyer',
    },
    {
      title: 'Курс обмена',
      dataIndex: 'exchangeRate',
      key: 'exchangeRate',
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Продавец',
      dataIndex: ['seller', 'username'],
      key: 'seller',
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: any) => (
        <Popconfirm
          title="Вы уверены, что хотите удалить эту транзакцию?"
          onConfirm={() => handleDeleteTransaction(record.id)}
          okText="Да"
          cancelText="Нет"
        >
          <Button type="link" danger>
            Удалить
          </Button>
        </Popconfirm>
      ),
    },
  ];  

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: User) => (
        <Input
          value={editingUser?.id === record.id ? editingUser.username : text}
          onChange={(e) => setEditingUser({ ...record, username: e.target.value })}
        />
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string, record: User) => (
        <Input
          value={editingUser?.id === record.id ? editingUser.phone : text}
          onChange={(e) => setEditingUser({ ...record, phone: e.target.value })}
          prefix={<PhoneOutlined />}
        />
      ),
    },
    {
      title: 'Password Hash',
      dataIndex: 'passwordHash',
      key: 'passwordHash',
      render: (text: string, record: User) => (
        <Input
          value={editingUser?.id === record.id ? editingUser.passwordHash : text}
          onChange={(e) =>
            setEditingUser({ ...record, passwordHash: e.target.value })
          }
          prefix={<LockOutlined />}
        />
      ),
    },
    {
      title: 'Verified',
      dataIndex: 'verified',
      key: 'verified',
      render: (text: boolean, record: User) => (
        <Input
          type="checkbox"
          checked={editingUser?.id === record.id ? editingUser.verified : text}
          onChange={(e) =>
            setEditingUser({ ...record, verified: e.target.checked })
          }
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: User) => (
        <span>
          <Button onClick={() => handleEditUser(record)} type="link">
            Edit
          </Button>
          <Popconfirm
            title="Вы уверены, что хотите удалить этого пользователя?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div>
      <h1>Админская панель</h1>
      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
      />
      <h2>Ордера</h2>
      <Table
        dataSource={orders || []}
        columns={orderColumns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        bordered
      />

      <h2>Транзакции</h2>
      <Table
        dataSource={transactions || []}
        columns={transactionColumns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        bordered
      />
      {editingUser && (
        <Modal
          title="Редактирование пользователя"
          visible={!!editingUser}
          onOk={handleSaveUser}
          onCancel={() => setEditingUser(null)}
        >
          <Input
            value={editingUser.username}
            onChange={(e) =>
              setEditingUser({ ...editingUser, username: e.target.value })
            }
            placeholder="Username"
            style={{ marginBottom: 8 }}
          />
          <Input
            value={editingUser.phone}
            onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
            placeholder="Phone"
            prefix={<PhoneOutlined />}
            style={{ marginBottom: 8 }}
          />
          <Input
            value={editingUser.passwordHash}
            onChange={(e) =>
              setEditingUser({ ...editingUser, passwordHash: e.target.value })
            }
            placeholder="Password Hash"
            prefix={<LockOutlined />}
            style={{ marginBottom: 8 }}
          />
          <Input
            type="checkbox"
            checked={editingUser.verified}
            onChange={(e) => setEditingUser({ ...editingUser, verified: e.target.checked })}
            placeholder="Verified"
            style={{ marginBottom: 8 }}
          />
        </Modal>
      )}
    </div>
  );
};

export default AdminPage;
