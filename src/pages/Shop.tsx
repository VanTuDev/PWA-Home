import React from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  Search, 
  ShoppingCart as AddShoppingCart, 
  Star, 
  Filter, 
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { PRODUCTS } from '../constants';

export const Shop: React.FC = () => {
  const categories = [
    { label: 'Tất cả', count: 120, active: true },
    { label: 'Thức ăn', count: 45 },
    { label: 'Đồ chơi', count: 32 },
    { label: 'Phụ kiện', count: 28 },
    { label: 'Vệ sinh', count: 15 },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Search Header */}
      <div className="bg-white border-b border-outline-variant px-margin-mobile md:px-margin-desktop py-12">
        <div className="max-w-container-max mx-auto text-center">
          <h1 className="text-4xl font-bold text-primary mb-2 tracking-tight">PAW Shop</h1>
          <p className="text-on-surface-variant mb-8">Nhu yếu phẩm cao cấp cho các bé yêu</p>
          <div className="relative max-w-2xl mx-auto">
            <input 
              type="text" 
              placeholder="Tìm kiếm hạt, đồ chơi, phụ kiện..." 
              className="w-full bg-surface-container-low border border-outline-variant rounded-full py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary outline-none text-lg transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-on-surface-variant" />
          </div>
        </div>
      </div>

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64 space-y-8">
            <div>
              <h3 className="font-bold text-on-surface mb-6 uppercase tracking-widest text-xs">Danh mục</h3>
              <div className="flex flex-wrap md:flex-col gap-2">
                {categories.map((cat) => (
                  <button 
                    key={cat.label}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                      cat.active ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white text-on-surface-variant hover:bg-surface-container hover:text-primary border border-outline-variant'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${cat.active ? 'bg-white/20' : 'bg-surface-container'}`}>{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-on-surface mb-6 uppercase tracking-widest text-xs">Giá thành</h3>
              <div className="space-y-4">
                <input type="range" className="w-full accent-primary" />
                <div className="flex justify-between text-xs font-bold text-on-surface-variant uppercase">
                  <span>0đ</span>
                  <span>2.000.000đ</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Shop Grid */}
          <div className="flex-1 space-y-12">
            <div className="flex justify-between items-center">
              <p className="text-on-surface-variant text-sm font-medium tracking-tight">Hiển thị 1 - 9 trong 120 sản phẩm</p>
              <button className="flex items-center gap-2 text-sm font-bold text-on-surface hover:text-primary transition-colors">
                Sắp xếp theo: Mới nhất
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {PRODUCTS.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-[32px] border border-outline-variant p-6 group cursor-pointer hover:shadow-2xl transition-all relative"
                >
                  {product.isNew && (
                    <div className="absolute top-4 left-4 bg-tertiary text-on-tertiary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full z-10">
                      Mới
                    </div>
                  )}
                  <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container mb-6">
                    <img 
                      src={product.image} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt={product.name} 
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'opacity-20'}`} />
                      ))}
                      <span className="text-xs font-bold text-on-surface-variant ml-1">{product.rating}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface mb-1 group-hover:text-primary transition-colors leading-tight">{product.name}</h3>
                      <p className="text-on-surface-variant text-xs">{product.category}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
                      <span className="text-xl font-bold text-primary">{product.price.toLocaleString()}đ</span>
                      <button className="p-3 bg-primary text-on-primary rounded-2xl hover:bg-primary-container transition-all shadow-md shadow-primary/20 scale-90 group-hover:scale-100">
                        <AddShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
