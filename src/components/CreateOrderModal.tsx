import React from "react";
import { Modal, Form, InputNumber, Button, Select, message } from "antd";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const { Option } = Select;

interface CreateOrderModalProps {
  visible: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  visible,
  onClose,
  onOrderCreated,
}) => {
  const [loading, setLoading] = React.useState(false);
  const { user } = useAuth();
  const [form] = Form.useForm();

  const handleCreateOrder = async (values: {
    amount: number;
    price: number;
    currencyPair: string;
  }) => {
    // @ts-ignore
    if (!user?.userId) {
      toast.error("Ошибка: не удалось определить пользователя");
      return;
    }

    setLoading(true);
    try {
      await api.post("/orders", {
        ...values,
        operationType: "sell", // Определяем автоматически
        // @ts-ignore
        seller: user.userId,
      });
      toast.success("Ордер успешно создан!");
      form.resetFields(); // Очищаем поля формы
      onOrderCreated();   // Обновляем список ордеров
      onClose();          // Закрываем модалку
    } catch (error) {
      toast.error("Ошибка при создании ордера.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Создать ордер" open={visible} onCancel={onClose} footer={null}>
      <Form form={form} onFinish={handleCreateOrder} layout="vertical">
        <Form.Item
          name="currencyPair"
          rules={[{ required: true, message: "Выберите валютную пару" }]}
          label="Валютная пара"
        >
          <Select placeholder="Выберите валютную пару">
            <Option value="USD/RUB">USD → RUB</Option>
            <Option value="RUB/USD">RUB → USD</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="amount"
          rules={[{ required: true, message: "Введите максимальную сумму валюты" }]}
          label="Максимальная сумма"
        >
          <InputNumber min={1} placeholder="Введите максимальную сумму" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="price"
          rules={[{ required: true, message: "Введите курс обмена" }]}
          label="Курс обмена"
        >
          <InputNumber min={0.01} step={0.01} placeholder="Введите курс" style={{ width: "100%" }} />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading} block>
          Создать ордер
        </Button>
      </Form>
    </Modal>
  );
};

export default CreateOrderModal;
