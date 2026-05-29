import React from 'react';
import { PawPrint, LayoutDashboard, ClipboardList, Users, Settings, Sparkles, ShoppingBag, PackageCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab
}) => {
  const { user, isAdmin } = useAuth();

  // Create menu items. Filter out "users" if not super admin
  const menuItems = [
    { id: 'overview',  label: 'Tổng quan',        icon: LayoutDashboard },
    { id: 'pets',      label: 'Thú cưng',          icon: PawPrint        },
    { id: 'products',  label: 'Sản phẩm Shop',     icon: ShoppingBag     },
    { id: 'orders',    label: 'Đơn hàng',          icon: PackageCheck    },
    { id: 'applications', label: 'Đơn nhận nuôi', icon: ClipboardList   },
    { id: 'workflows', label: 'Quy trình AI',      icon: Sparkles        },
    ...(isAdmin ? [{ id: 'users', label: 'Nhân sự', icon: Users }] : []),
    { id: 'settings',  label: 'Cài đặt',           icon: Settings        },
  ];

  return (
    <aside className="w-64 bg-primary text-on-primary flex flex-col p-6 space-y-8 h-full flex-shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-on-primary rounded-xl flex items-center justify-center shadow-md">
          <PawPrint className="text-primary w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight">PAW Portal</span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === item.id
                ? 'bg-on-primary text-primary shadow-lg scale-[1.02]'
                : 'text-on-primary/60 hover:text-on-primary hover:bg-on-primary/10'
              }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer Organization Card */}
      <div className="p-4 bg-on-primary/10 rounded-2xl border border-white/10">
        <p className="text-xs font-bold text-on-primary/40 uppercase mb-1 tracking-widest">Trung tâm</p>
        <p className="text-sm font-bold truncate">PAW Home Đà Nẵng</p>
        <p className="text-[10px] text-on-primary/60 font-medium">Verified Partner</p>
      </div>
    </aside>
  );
};
