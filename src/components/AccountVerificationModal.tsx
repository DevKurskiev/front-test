import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
// import { useNavigate } from 'react-router-dom';

interface AccountVerificationModalProps {
  isVerified: boolean;
}

const AccountVerificationModal: React.FC<AccountVerificationModalProps> = ({ isVerified }) => {
  const [visible, setVisible] = useState(false);
  // const navigate = useNavigate();

  useEffect(() => {
    if (!isVerified) {
      setVisible(true);
    }
  }, [isVerified]);

  const handleOk = () => {
    setVisible(false);
    // navigate('/orders');
  };

  return (
    <Modal
      title="Аккаунт не верифицирован"
      visible={visible}
      onOk={handleOk}
      onCancel={handleOk}
      cancelText="Закрыть"
    >
      <p>Ваш аккаунт не верифицирован. Пожалуйста, напишите в техподдержку для верификации.</p>
      <p>Вы можете написать нам в Telegram или WhatsApp для получения поддержки.</p>
      <Button
        type="primary"
        href="https://wa.me/89888237086" // Заменить на актуальную ссылку WhatsApp
        target="_blank"
        style={{ marginRight: 10 }}
      >
        WhatsApp
      </Button>
      <Button
        type="primary"
        href="https://t.me/jffhnvf" // Заменить на актуальную ссылку Telegram
        target="_blank"
      >
        Telegram
      </Button>
    </Modal>
  );
};

export default AccountVerificationModal;
