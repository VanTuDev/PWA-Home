import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { OverviewTab } from '../components/admin/OverviewTab';
import { UsersTab } from '../components/admin/UsersTab';
import { PetsTab } from '../components/admin/PetsTab';
import { ProductsTab } from '../components/admin/ProductsTab';
import { OrdersTab } from '../components/admin/OrdersTab';
import { ApplicationsTab } from '../components/admin/ApplicationsTab';
import { ChatTab } from '../components/admin/ChatTab';
import { AIWorkflowsTab } from '../components/admin/AIWorkflowsTab';
import { ToastContainer } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const AdminDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':     return <OverviewTab />;
      case 'pets':         return <PetsTab />;
      case 'products':     return <ProductsTab />;
      case 'orders':       return <OrdersTab />;
      case 'applications': return <ApplicationsTab />;
      case 'chat':         return <ChatTab />;
      case 'workflows':    return <AIWorkflowsTab />;
      case 'users':        return isAdmin ? <UsersTab /> : <Restricted />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant gap-3 bg-white rounded-[32px] border border-outline-variant shadow-sm p-8">
            <p className="font-bold text-lg capitalize">{activeTab}</p>
            <p className="text-sm italic font-medium">Tính năng đang được phát triển...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-surface-container-low overflow-hidden font-sans">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <div className="p-4 sm:p-6 lg:p-8 flex-1">{renderTab()}</div>
      </main>
      <ToastContainer />
      <ConfirmDialog />
    </div>
  );
};

const Restricted: React.FC = () => (
  <div className="flex items-center justify-center h-64 bg-white rounded-[32px] border border-outline-variant shadow-sm">
    <p className="font-bold text-on-surface-variant italic">Chỉ Super Admin mới có quyền truy cập.</p>
  </div>
);
