"use client"; 

import React, { useState } from 'react';
import {
  HomeOutlined,
  BarChartOutlined,
  BankOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu } from 'antd';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logoWhite from '../../public/logoWhite.png';
import mWhite from '../../public/mWhite.png';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

interface SiderMenuProps {
  onCollapse?: (collapsed: boolean) => void;
}

const SiderMenu: React.FC<SiderMenuProps> = ({ onCollapse }) => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  const handleCollapse = (value: boolean) => {
    setCollapsed(value);
    onCollapse?.(value);
  };

  const items: MenuItem[] = [
    getItem('Dashboard', '/', <HomeOutlined />),
    getItem('Transactions', '/transactions', <BankOutlined />),
    getItem('Reports', '/reports', <BarChartOutlined />),
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={handleCollapse}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div 
        style={{ 
          height: 40, 
          margin: 20, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {collapsed ? <Image src={mWhite} alt="Logo" width={30} /> : <Image src={logoWhite} alt="Logo" width={160} />}
      </div>
      <Menu 
        theme="dark" 
        defaultSelectedKeys={['/']} 
        mode="inline" 
        items={items}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default SiderMenu;