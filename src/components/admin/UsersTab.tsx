import React from 'react';
import { UserPlus, UserCog, Trash2 } from 'lucide-react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'staff' | 'user';
  createdAt: string;
}

interface UsersTabProps {
  users: User[];
  handleUpdateRole: (id: string, newRole: 'admin' | 'manager' | 'staff' | 'user') => void;
  handleDeleteUser: (id: string) => void;
  onAddStaffClick: () => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({
  users,
  handleUpdateRole,
  handleDeleteUser,
  onAddStaffClick
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Add Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter">Quản lý nhân sự</h1>
          <p className="text-on-surface-variant text-sm font-medium">Thiết lập vai trò và quản lý tài khoản thành viên nội bộ.</p>
        </div>
        <button 
          onClick={onAddStaffClick}
          className="bg-primary text-on-primary px-6 py-3 rounded-[20px] font-bold flex items-center gap-2 hover:bg-primary-container transition-all hover:scale-[1.02] shadow-lg shadow-primary/20 cursor-pointer"
        >
          <UserPlus className="w-5 h-5" />
          Thêm nhân viên mới
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[32px] border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] border-b border-outline-variant">
                <th className="px-8 py-5">Thành viên</th>
                <th className="px-8 py-5">Vai trò (Role)</th>
                <th className="px-8 py-5">Email & SĐT</th>
                <th className="px-8 py-5">Ngày tham gia</th>
                <th className="px-8 py-5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-container-lowest transition-colors">
                  {/* Name and ID */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface leading-tight">{user.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-wider mt-1">
                          ID: {user.id.slice(-6)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role Selector */}
                  <td className="px-8 py-6">
                    <select 
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value as any)}
                      className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest outline-none border-2 transition-all cursor-pointer ${
                        user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' :
                        user.role === 'manager' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        user.role === 'staff' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-600 border-gray-100'
                      }`}
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                      <option value="user">User</option>
                    </select>
                  </td>

                  {/* Contact Info */}
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-on-surface">{user.email}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{user.phone || 'Chưa cập nhật'}</p>
                  </td>

                  {/* Join Date */}
                  <td className="px-8 py-6 text-sm font-medium text-on-surface-variant">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>

                  {/* Actions */}
                  <td className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <button className="p-2 hover:bg-surface-container rounded-xl text-on-surface-variant transition-colors" title="Chỉnh sửa chi tiết">
                         <UserCog className="w-5 h-5" />
                       </button>
                       <button 
                         onClick={() => handleDeleteUser(user.id)}
                         className="p-2 hover:bg-red-50 rounded-xl text-error transition-colors"
                         title="Xóa thành viên"
                       >
                         <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
