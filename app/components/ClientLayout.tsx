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
    <Layout style={{ minHeight: "100vh", background: '#f0f2f5' }}>
      <SiderMenu onCollapse={setCollapsed} />
      <Layout style={{ 
        marginLeft: collapsed ? 80 : 200, 
        transition: 'margin-left 0.2s',
        background: '#f0f2f5'
      }}>
        <Content
          style={{
            margin: "24px",
            padding: 24,
            minHeight: 280,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

