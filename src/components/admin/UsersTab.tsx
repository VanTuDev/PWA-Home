import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, X, Edit2 } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'staff' | 'user';
  job?: string;
  salary?: string;
  createdAt: string;
}

const defaultForm = {
  name: '', email: '', phone: '', password: '',
  role: 'user' as 'admin' | 'manager' | 'staff' | 'user'
};

const defaultEditForm = { name: '', phone: '', job: '', salary: '', role: 'user' as User['role'] };

const ROLE_STYLE: Record<string, string> = {
  admin:   'bg-red-50 text-red-700 border-red-100',
  manager: 'bg-purple-50 text-purple-700 border-purple-100',
  staff:   'bg-blue-50 text-blue-700 border-blue-100',
  user:    'bg-gray-50 text-gray-600 border-gray-100'
};

const getToken = () => localStorage.getItem('paw_token') || '';
const authHeader = () => ({
  Authorization: `Bearer ${getToken()}`,
  'Content-Type': 'application/json'
});

export const UsersTab: React.FC = () => {
  const [users, setUsers]         = useState<User[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(defaultForm);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm, setEditForm]     = useState(defaultEditForm);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError]   = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', { headers: authHeader() });
      const data = await res.json();
      if (res.ok) setUsers(Array.isArray(data) ? data : []);
      else setError(data.message || 'Lỗi tải danh sách.');
    } catch { setError('Không thể kết nối máy chủ.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleUpdateRole = async (id: string, role: string) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify({ role })
    });
    if (res.ok) setUsers(u => u.map(x => x._id === id ? { ...x, role: role as any } : x));
  };

  const openEdit = (user: User) => {
    setEditTarget(user);
    setEditForm({ name: user.name, phone: user.phone || '', job: user.job || '', salary: user.salary || '', role: user.role });
    setEditError('');
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    setEditSaving(true); setEditError('');
    try {
      const res = await fetch(`/api/admin/users/${editTarget._id}`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.message); return; }
      setUsers(u => u.map(x => x._id === editTarget._id ? { ...x, ...editForm } : x));
      setEditTarget(null);
    } catch { setEditError('Không thể kết nối máy chủ.'); }
    finally { setEditSaving(false); }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Xóa người dùng "${user.name}"?`)) return;
    const res = await fetch(`/api/admin/users/${user._id}`, {
      method: 'DELETE',
      headers: authHeader()
    });
    if (res.ok) setUsers(u => u.filter(x => x._id !== user._id));
    else { const d = await res.json(); alert(d.message); }
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Vui lòng điền Tên, Email và Mật khẩu.'); return;
    }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      await loadUsers();
      setShowModal(false);
      setForm(defaultForm);
    } catch { setError('Không thể kết nối máy chủ.'); }
    finally { setSaving(false); }
  };

  const inputCls = "w-full border border-outline-variant rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 font-medium";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter">Quản lý người dùng</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            {loading ? '...' : `${users.length} tài khoản trong hệ thống`}
          </p>
        </div>
        <button onClick={() => { setShowModal(true); setForm(defaultForm); setError(''); }}
          className="bg-primary text-on-primary px-6 py-3 rounded-[20px] font-bold flex items-center gap-2 hover:scale-[1.02] shadow-lg shadow-primary/20 transition-all">
          <UserPlus className="w-5 h-5" /> Thêm người dùng
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-outline-variant shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-on-surface-variant font-medium animate-pulse">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container-low text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] border-b border-outline-variant">
                  <th className="px-8 py-5 text-left">Thành viên</th>
                  <th className="px-8 py-5 text-left">Vai trò</th>
                  <th className="px-8 py-5 text-left">Email & SĐT</th>
                  <th className="px-8 py-5 text-left">Nghề nghiệp & Thu nhập</th>
                  <th className="px-8 py-5 text-left">Ngày tham gia</th>
                  <th className="px-8 py-5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-base flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-bold text-on-surface">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <select value={user.role}
                        onChange={e => handleUpdateRole(user._id, e.target.value)}
                        className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest outline-none border-2 cursor-pointer transition-colors ${ROLE_STYLE[user.role]}`}>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="staff">Staff</option>
                        <option value="user">User</option>
                      </select>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-on-surface">{user.email}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{user.phone || '—'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-on-surface">{user.job || '—'}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{user.salary || '—'}</p>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-on-surface-variant">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(user)}
                          className="p-2 hover:bg-blue-50 rounded-xl text-blue-600 transition-colors" title="Chỉnh sửa">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(user)}
                          className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors" title="Xóa">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && users.length === 0 && (
              <div className="py-16 text-center text-on-surface-variant font-medium">
                Chưa có người dùng nào.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Edit User Modal ──────────────────────────────────────────────── */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center px-8 pt-7 pb-5 border-b border-outline-variant">
              <div>
                <h2 className="text-xl font-black text-on-surface">Chỉnh sửa người dùng</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">{editTarget.email}</p>
              </div>
              <button onClick={() => setEditTarget(null)}
                className="p-2 hover:bg-surface-container rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-8 py-6 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-2xl text-sm font-semibold">{editError}</div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Họ và tên</label>
                <input className={inputCls} value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Số điện thoại</label>
                <input className={inputCls} value={editForm.phone}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Nghề nghiệp</label>
                  <input className={inputCls} placeholder="Kỹ sư phần mềm..." value={editForm.job}
                    onChange={e => setEditForm(f => ({ ...f, job: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Thu nhập</label>
                  <input className={inputCls} placeholder="10 - 20 triệu" value={editForm.salary}
                    onChange={e => setEditForm(f => ({ ...f, salary: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Vai trò</label>
                <select className={inputCls} value={editForm.role}
                  onChange={e => setEditForm(f => ({ ...f, role: e.target.value as User['role'] }))}>
                  <option value="user">User</option>
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditTarget(null)}
                  className="flex-1 py-3 rounded-2xl border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container transition-all">
                  Huỷ
                </button>
                <button onClick={handleEditSave} disabled={editSaving}
                  className="flex-1 py-3 rounded-2xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 disabled:opacity-50 transition-all">
                  {editSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add User Modal ───────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center px-8 pt-7 pb-5 border-b border-outline-variant">
              <h2 className="text-xl font-black text-on-surface">Thêm người dùng mới</h2>
              <button onClick={() => setShowModal(false)}
                className="p-2 hover:bg-surface-container rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-8 py-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-2xl text-sm font-semibold">{error}</div>
              )}
              {([
                { key: 'name',     label: 'Họ và tên *',  placeholder: 'Nguyễn Văn A',      type: 'text' },
                { key: 'email',    label: 'Email *',       placeholder: 'email@example.com', type: 'email' },
                { key: 'phone',    label: 'Số điện thoại', placeholder: '0901 234 567',       type: 'tel' },
                { key: 'password', label: 'Mật khẩu *',   placeholder: 'Tối thiểu 6 ký tự', type: 'password' }
              ] as { key: keyof typeof form; label: string; placeholder: string; type: string }[]).map(({ key, label, placeholder, type }) => (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">{label}</label>
                  <input type={type} placeholder={placeholder} className={inputCls}
                    value={form[key] as string}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Vai trò</label>
                <select className={inputCls} value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as any }))}>
                  <option value="user">User</option>
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container transition-all">
                  Huỷ
                </button>
                <button onClick={handleCreate} disabled={saving}
                  className="flex-1 py-3 rounded-2xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 disabled:opacity-50 transition-all">
                  {saving ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
