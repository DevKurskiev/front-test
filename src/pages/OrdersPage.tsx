import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, InputNumber, Form, Select, Input } from 'antd';
import { toast } from 'react-toastify';
import CreateOrderModal from '../components/CreateOrderModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [editForm] = Form.useForm();
  const { user } = useAuth();

  const fetchOrders = async (page = 1, sortField?: string, sortOrder?: string) => {
    setLoading(true);
    try {
      const response = await api.get('/orders', {
        params: {
          page,
          limit: pagination.pageSize,
          sortField,
          sortOrder: sortOrder === 'ascend' ? 'ASC' : 'DESC',
        },
      });

      const { data, total } = response.data;
      setOrders(data);
      setPagination((prev) => ({
        ...prev,
        current: page,
        total,
      }));
    } catch (error) {
      toast.error('Ошибка при загрузке ордеров');
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShowConfirmModal = (order: any) => {
    setSelectedOrder(order);
    setAmount(null);
    setConfirmModalVisible(true);
  };

  const handleEditClick = (order: any) => {
    setSelectedOrder(order);
    editForm.setFieldsValue(order);
    setEditModalVisible(true);
  };
  
  const handleDeleteClick = async (order: any) => {
    await api.delete(`/orders/${order.id}`);
      toast.error('Ордер успешно удален!');
      fetchOrders();
  };

  const handleEditOrder = async (values: any) => {
    if (!selectedOrder) return;

    try {
      await api.patch(`/orders/${selectedOrder.id}`, values);
      toast.success('Ордер успешно обновлен!');
      fetchOrders();
      setEditModalVisible(false);
    } catch (error) {
      toast.error('Ошибка при обновлении ордера.');
    }
  };

  const handleConfirmPurchase = async () => {
    if (!selectedOrder || !amount || amount <= 0 || amount > selectedOrder.amount) {
      toast.error('Введите корректное количество валюты.');
      return;
    }

    try {
      const transactionData = {
        buyerId: user?.userId,
        sellerId: selectedOrder?.seller?.id,
        orderId: selectedOrder?.id,
        amount,
        exchangeRate: selectedOrder?.price,
        status: 'pending',
        scheduledTime: new Date().toISOString(),
      };

      await api.post(`/transactions`, transactionData);

      toast.success('Заказ принят в обработку!');
      fetchOrders();
      setConfirmModalVisible(false);
    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
      // @ts-ignore
      toast.error(error.response.data.message as string || "Ошибка при оформлении заказа");
    }
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    const { field: sortField, order: sortOrder } = sorter;
    fetchOrders(pagination.current, sortField, sortOrder);
  };

  const columns = [
    {
      title: 'Валютная пара',
      dataIndex: 'currencyPair',
      key: 'currencyPair',
      sorter: (a: any, b: any) => a.currencyPair.localeCompare(b.currencyPair),
    },
    {
      title: 'Максимальная сумма',
      key: 'availableAmount',
      sorter: (a: any, b: any) => {
        const availableAmountA = a.amount - (a.reservedAmount || 0);
        const availableAmountB = b.amount - (b.reservedAmount || 0);
        return availableAmountA - availableAmountB;
      },
      render: (order: any) => {
        const availableAmount = order.amount - (order.reservedAmount || 0);
        return availableAmount;
      },
    },
    {
      title: 'Курс обмена',
      dataIndex: 'price',
      key: 'price',
      sorter: (a: any, b: any) => a.price - b.price,
      render: (_: any, record: any) => (
        <p>{record.seller.id === user?.userId ? record.price - 0.5 : record.price}</p>
      )
    },    
    {
      title: 'Продавец',
      dataIndex: ['seller', 'username'],
      key: 'seller',
      sorter: (a: any, b: any) => a.seller.username.localeCompare(b.seller.username),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {user?.role === 'buyer' && (
              <Button type="primary" onClick={() => handleShowConfirmModal(record)}>
                Купить
              </Button>
          )}
          {user?.role === 'seller' && record.seller.id === user.userId && (
            <>
              <Button onClick={() => handleEditClick(record)}>Редактировать</Button>
              <Button style={{ background: "red", color: "white" }} onClick={() => handleDeleteClick(record)}>Удалить</Button>
            </>
          )}
        </div>
      )
    },
  ];

  return (
    <div>
      {user?.role === 'seller' && (
        <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
          Создать ордер
        </Button>
      )}

      {/* Модалка создания ордера */}
      <CreateOrderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onOrderCreated={fetchOrders}
      />

      {/* Модалка редактирования */}
      <Modal
        title="Редактировать ордер"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={editForm.submit}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={editForm} onFinish={handleEditOrder} layout="vertical">
          <Form.Item name="currencyPair" label="Валютная пара" rules={[{ required: true, message: "Это поле обязательное!" }]}>
            <Select>
              <Select.Option value="USD/RUB">USD/RUB</Select.Option>
              <Select.Option value="RUB/USD">RUB/USD</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="amount" label="Макс. количество" rules={[{ required: true, message: "Это поле обязательное!" }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="price" label="Курс обмена" rules={[{ required: true, message: "Это поле обязательное!" }]}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Модалка подтверждения */}
      <Modal
        title="Подтвердите покупку ордера"
        open={confirmModalVisible}
        onCancel={() => setConfirmModalVisible(false)}
        onOk={handleConfirmPurchase}
        okText="Купить"
        cancelText="Отмена"
        // @ts-ignore
        okButtonProps={{ disabled: amount > (selectedOrder?.amount - selectedOrder?.reservedAmount || 0) || amount <= 0 }}
      >
        <p>Доступное количество: {selectedOrder?.amount - selectedOrder?.reservedAmount}</p>

        <Form>
          <Form.Item
            name="amount"
            label="Количество"
            // @ts-ignore
            validateStatus={amount > (selectedOrder?.amount - selectedOrder?.reservedAmount || 0) ? 'error' : ''}
            help={
              // @ts-ignore
              amount > (selectedOrder?.amount - selectedOrder?.reservedAmount || 0)
                ? 'Вы указали количество больше доступного!'
                // @ts-ignore
                : amount <= 0
                ? 'Количество должно быть больше 0!'
                : ''
            }
          >
            <InputNumber
              min={1}
              value={amount}
              onChange={(value) => {
                setAmount(value || 0); // Обновляем количество (минимум 0)
              }}
              placeholder="Введите количество"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Table
        dataSource={orders}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default OrdersPage;
