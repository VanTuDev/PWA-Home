import React from 'react';
import { 
  PawPrint, 
  ClipboardList, 
  TrendingUp, 
  AlertTriangle, 
  ChevronRight, 
  Clock 
} from 'lucide-react';

export const OverviewTab: React.FC = () => {
  const stats = [
    { label: 'Tổng thú cưng', value: '142', icon: PawPrint, trend: '+12%', color: 'bg-blue-50 text-blue-600' },
    { label: 'Đơn chờ duyệt', value: '28', icon: ClipboardList, trend: '5 mới', color: 'bg-orange-50 text-orange-600' },
    { label: 'Hỗ trợ tháng này', value: '45.2M', icon: TrendingUp, trend: '+24%', color: 'bg-green-50 text-green-600' },
    { label: 'Vi phạm/Cảnh báo', value: '03', icon: AlertTriangle, trend: '-2', color: 'bg-red-50 text-red-600' },
  ];

  const applications = [
    { id: 'APP001', user: 'Hoàng Minh', pet: 'Milo (Golden)', time: '10 phút trước', status: 'Pending' },
    { id: 'APP002', user: 'Lê Thu', pet: 'Luna (Siamese)', time: '2 giờ trước', status: 'Approved' },
    { id: 'APP003', user: 'Trần Nam', pet: 'Cooper (Corgi)', time: '5 giờ trước', status: 'Rejected' },
    { id: 'APP004', user: 'Phạm Hoa', pet: 'Bông (Mèo Mướp)', time: 'Hôm qua', status: 'Pending' },
  ];

  const petTracks = [
    { name: 'Hoàng Anh', pet: 'Bim Bim', progress: 85, color: 'bg-primary' },
    { name: 'Minh Tuấn', pet: 'Shiba In', progress: 30, color: 'bg-secondary' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Tab Welcome Header */}
      <div>
        <h1 className="text-3xl font-black text-on-surface mb-1 tracking-tighter">Bảng điều khiển tổng quan</h1>
        <p className="text-on-surface-variant text-sm font-medium">Hệ thống đang hoạt động ổn định. Có {applications.filter(a => a.status === 'Pending').length} đơn đăng ký đang chờ bạn phê duyệt.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[32px] border border-outline-variant shadow-sm hover:shadow-md hover:scale-[1.01] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stat.trend.includes('-') ? 'bg-red-50 text-error' : 'bg-green-50 text-status-ready'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-sm font-bold text-on-surface-variant mb-1">{stat.label}</h3>
            <p className="text-3xl font-black text-on-surface tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tables and Side Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Applications List */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-outline-variant shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <h2 className="font-black text-xl tracking-tight">Đơn đăng ký mới nhất</h2>
              <button className="text-sm text-primary font-black hover:underline">Tất cả đơn</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] border-b border-outline-variant">
                    <th className="px-6 py-5">Mã đơn</th>
                    <th className="px-6 py-5">Người đăng ký</th>
                    <th className="px-6 py-5">Thú cưng</th>
                    <th className="px-6 py-5">Trạng thái</th>
                    <th className="px-6 py-5 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-surface-container-lowest transition-colors group">
                      <td className="px-6 py-4 text-sm font-mono text-primary font-bold">{app.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-xs font-black shadow-sm">
                            {app.user.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-on-surface">{app.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-on-surface-variant">{app.pet}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${
                          app.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                          app.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {app.status === 'Pending' ? 'Chờ duyệt' : app.status === 'Approved' ? 'Đã duyệt' : 'Từ chối'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 hover:bg-surface-container rounded-xl transition-all opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-primary">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pet Tracking */}
        <div className="bg-white rounded-[32px] border border-outline-variant p-8 shadow-sm">
          <h3 className="font-black text-xl mb-6 flex items-center gap-2 tracking-tight">
            <Clock className="w-6 h-6 text-primary" />
            Theo dõi Pet sau nhận nuôi
          </h3>
          <div className="space-y-6">
            {petTracks.map((item, i) => (
              <div key={i} className="space-y-3 p-4 hover:bg-surface-container-low rounded-2xl transition-all border border-transparent hover:border-outline-variant/30">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{item.name}</p>
                    <p className="text-xs text-on-surface-variant font-medium">Đang nuôi {item.pet}</p>
                  </div>
                  <span className="text-[10px] font-black text-primary uppercase bg-primary-fixed px-2 py-0.5 rounded-md">
                    {item.progress}%
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-1000`} 
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
