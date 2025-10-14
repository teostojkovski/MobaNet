"use client";

import { Layout } from "antd";
import { useState } from "react";
import SiderMenu from "./SiderMenu";

const { Content, Header } = Layout;

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ height: "100vh", background: '#f0f2f5', overflow: 'hidden' }}>
      <SiderMenu onCollapse={setCollapsed} />
      <Layout style={{ 
        marginLeft: collapsed ? 80 : 200, 
        transition: 'margin-left 0.2s',
        background: '#f0f2f5',
        height: '100vh',
        overflow: 'hidden'
      }}>
        <Content
          style={{
            margin: "0",
            padding: "0",
            height: "100vh",
            background: "#f0f2f5",
            overflow: 'hidden'
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

