import React from 'react';
import { Layout } from 'antd';
import { SendOutlined, WhatsAppOutlined } from '@ant-design/icons';

const { Footer } = Layout;

const SupportFooter: React.FC = () => {
  return (
    <Footer style={{ textAlign: 'center', backgroundColor: '#f0f2f5', padding: '20px 0' }}>
      <h3 style={{ marginBottom: '12px' }}>Техподдержка</h3>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <a
          href="https://t.me/jffhnvf"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '16px', color: '#0088cc', display: 'flex', alignItems: 'center' }}
        >
          <SendOutlined style={{ marginRight: '8px' }} />
          Telegram
        </a>
        <a
          href="https://wa.me/89888237086"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '16px', color: '#25d366', display: 'flex', alignItems: 'center' }}
        >
          <WhatsAppOutlined style={{ marginRight: '8px' }} />
          WhatsApp
        </a>
      </div>
    </Footer>
  );
};

export default SupportFooter;
