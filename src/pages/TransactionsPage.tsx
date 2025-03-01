import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Table } from 'antd';
import api from '../services/api';

interface Transaction {
  id: number;
  amount: number;
  status: string;
  buyer: { username: string };
  seller: { username: string };
}

const TransactionsPage: React.FC = () => {
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTransactions = async (
    page = 1,
    sortField: string = 'createdAt',
    sortOrder: string = 'DESC'
  ) => {
    setLoading(true);
    try {
      // Проверяем, если нет сортировки, то используем значения по умолчанию
      const response = await api.get('/transactions/user', {
        params: {
          page,
          limit: pagination.pageSize,
          sortField,
          sortOrder,
        },
      });
  
      const { data, total } = response.data;
      setTransactions(data);
      setPagination((prev) => ({
        ...prev,
        current: page,
        total,
      }));
    } catch (error) {
      toast.error('Ошибка при загрузке транзакций');
    } finally {
      setLoading(false);
    }
  };
  


  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    const { field: sortField, order: sortOrder } = sorter;
    // @ts-ignore
    fetchTransactions(pagination.current, sortField, sortOrder);
  };

  const handleCancelTransaction = async (transactionId: number) => {
    try {
      await api.patch(`/transactions/${transactionId}/cancel`);
      toast.success('Транзакция успешно отменена');
      fetchTransactions(); // Перезагрузка списка транзакций
    } catch (error) {
      toast.error('Ошибка при отмене транзакции');
    }
  };
  

  const columns = [
    {
      title: 'Количество',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a: any, b: any) => a.amount - b.amount,
    },
    { 
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      sorter: (a: any, b: any) => a.status.localeCompare(b.status),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: any) => (
        <>
          {record.status === 'pending' && (
            <Button type="link" danger onClick={() => handleCancelTransaction(record.id)}>
              Отменить
            </Button>
          )}
        </>
      ),
    },
  ];

  return (
    <Table
      dataSource={transactions}
      columns={columns}
      rowKey="id"
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
      }}
      onChange={handleTableChange}
    />
  );
};

export default TransactionsPage;
