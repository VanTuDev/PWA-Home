import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { OverviewTab } from '../components/admin/OverviewTab';
import { UsersTab, User } from '../components/admin/UsersTab';
import { AddStaffModal } from '../components/admin/AddStaffModal';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load all system users from localStorage
  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('paw_users') || '[]');
    setUsers(savedUsers);
  }, []);

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('paw_users', JSON.stringify(updatedUsers));
  };

  // Update a user's role (Super Admin action)
  const handleUpdateRole = (id: string, newRole: 'admin' | 'manager' | 'staff' | 'user') => {
    if (!isAdmin) {
      alert('Bạn không có quyền thực hiện hành động này.');
      return;
    }
    const updated = users.map(u => u.id === id ? { ...u, role: newRole } : u);
    saveUsers(updated);
  };

  // Delete a user account (Super Admin action)
  const handleDeleteUser = (id: string) => {
    if (!isAdmin) {
      alert('Bạn không có quyền thực hiện hành động này.');
      return;
    }
    if (id === user?.id) {
      alert('Bạn không thể tự xóa tài khoản của chính mình!');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      const updated = users.filter(u => u.id !== id);
      saveUsers(updated);
    }
  };

  // Register a new internal staff/manager/admin (Super Admin action)
  const handleAddStaffSubmit = (newUserData: any) => {
    if (!isAdmin) {
      alert('Bạn không có quyền thực hiện hành động này.');
      return;
    }

    // Check if email already exists
    const emailExists = users.some(u => u.email.toLowerCase() === newUserData.email.toLowerCase());
    if (emailExists) {
      alert('Email này đã được sử dụng bởi một tài khoản khác.');
      return;
    }

    const staffMember: User = {
      id: Date.now().toString(),
      name: newUserData.name,
      email: newUserData.email,
      phone: newUserData.phone,
      role: newUserData.role,
      createdAt: new Date().toISOString()
    };
    
    // In a real application, the password would be hashed and saved in database.
    // For our mock PWA, the registration adds it directly to the local storage list.
    const updated = [...users, { ...staffMember, password: newUserData.password } as any];
    saveUsers(updated);
    setShowAddModal(false);
    alert(`Đã tạo tài khoản ${newUserData.role.toUpperCase()} thành công!`);
  };

  return (
    <div className="flex h-screen bg-surface-container-low overflow-hidden font-sans">
      {/* Sidebar - Dynamically hides tabs depending on active role */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header - Profile details and logout logic */}
        <AdminHeader />

        {/* Tab View Routing */}
        <div className="p-8 space-y-8 flex-1">
          {activeTab === 'overview' ? (
            <OverviewTab />
          ) : activeTab === 'users' && isAdmin ? (
            <UsersTab 
              users={users} 
              handleUpdateRole={handleUpdateRole} 
              handleDeleteUser={handleDeleteUser} 
              onAddStaffClick={() => setShowAddModal(true)} 
            />
          ) : activeTab === 'pets' || activeTab === 'applications' || activeTab === 'settings' ? (
            <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant gap-4 bg-white rounded-[32px] border border-outline-variant shadow-sm p-8">
              <p className="font-bold text-lg">Tính năng [{activeTab.toUpperCase()}]</p>
              <p className="text-sm text-on-surface-variant font-medium italic">Đang được phát triển...</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-on-surface-variant font-bold italic bg-white rounded-[32px] border border-outline-variant shadow-sm">
              Khu vực không khả dụng hoặc bị hạn chế truy cập.
            </div>
          )}
        </div>
      </main>

      {/* Add Staff Modal for Super Admin */}
      {showAddModal && isAdmin && (
        <AddStaffModal 
          onClose={() => setShowAddModal(false)} 
          onSubmit={handleAddStaffSubmit} 
        />
      )}
    </div>
  );
};
