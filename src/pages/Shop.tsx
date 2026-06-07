import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Search, Star, ShoppingBag, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { CheckoutModal } from '../components/shop/CheckoutModal';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  stock: number;
  isNew: boolean;
  rating: number;
  soldCount: number;
}

const CATEGORIES = ['Tất cả', 'Thức ăn', 'Đồ chơi', 'Phụ kiện', 'Vệ sinh', 'Khác'];
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Mới nhất' },
  { value: 'bestseller', label: 'Bán chạy' },
  { value: 'price_asc',  label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'rating',     label: 'Đánh giá cao' }
];
const MAX_PRICE = 2000000;

const BE_URL = (import.meta as any).env?.DEV ? 'http://localhost:5000' : 'https://pwa-home-be.onrender.com';
const imgSrc = (img: string) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  const path = img.startsWith('/') ? img : `/${img}`;
  return `${BE_URL}${path}`;
};

export const Shop: React.FC = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('Tất cả');
  const [sort, setSort]           = useState('newest');
  const [maxPrice, setMaxPrice]   = useState(MAX_PRICE);
  const [minPrice, setMinPrice]   = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [buying, setBuying]       = useState<Product | null>(null);

  const debouncedSearch   = useDebounce(search,   450);
  const debouncedMinPrice = useDebounce(minPrice, 600);
  const debouncedMaxPrice = useDebounce(maxPrice, 600);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch)              params.set('search',   debouncedSearch);
      if (category !== 'Tất cả')        params.set('category', category);
      if (debouncedMinPrice > 0)        params.set('minPrice', String(debouncedMinPrice));
      if (debouncedMaxPrice < MAX_PRICE) params.set('maxPrice', String(debouncedMaxPrice));
      params.set('sort', sort);

      const res  = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, sort, debouncedMinPrice, debouncedMaxPrice]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleBuy = (product: Product) => {
    if (!user) { navigate('/login'); return; }
    setBuying(product);
  };

  return (
    <div className="min-h-screen bg-surface">

      {/* Hero search bar */}
      <div className="bg-white border-b border-outline-variant px-4 md:px-8 py-10">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-black text-primary mb-1 tracking-tight">PAW Shop</h1>
          <p className="text-on-surface-variant mb-7 font-medium">Nhu yếu phẩm cao cấp cho các bé yêu</p>
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Tìm kiếm hạt ăn, đồ chơi, phụ kiện..."
              className="w-full bg-surface-container-low border border-outline-variant rounded-full py-4 pl-12 pr-12 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar ── */}
          <aside className={`w-full lg:w-56 flex-shrink-0 ${showFilter ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-[24px] border border-outline-variant p-6 space-y-7 sticky top-4">

              {/* Categories */}
              <div>
                <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3">Danh mục</h3>
                <div className="space-y-1">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        category === cat
                          ? 'bg-primary text-on-primary font-bold shadow-md shadow-primary/20'
                          : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4">Khoảng giá</h3>

                <div className="space-y-4">
                  {/* Min price */}
                  <div>
                    <div className="flex justify-between text-xs text-on-surface-variant mb-1.5">
                      <span>Từ</span>
                      <span className="font-bold text-primary">{minPrice.toLocaleString()}đ</span>
                    </div>
                    <input type="range" min={0} max={MAX_PRICE} step={50000}
                      value={minPrice}
                      onChange={e => {
                        const v = Number(e.target.value);
                        setMinPrice(Math.min(v, maxPrice - 50000));
                      }}
                      className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
                    />
                  </div>

                  {/* Max price */}
                  <div>
                    <div className="flex justify-between text-xs text-on-surface-variant mb-1.5">
                      <span>Đến</span>
                      <span className="font-bold text-primary">
                        {maxPrice >= MAX_PRICE ? 'Không giới hạn' : `${maxPrice.toLocaleString()}đ`}
                      </span>
                    </div>
                    <input type="range" min={0} max={MAX_PRICE} step={50000}
                      value={maxPrice}
                      onChange={e => {
                        const v = Number(e.target.value);
                        setMaxPrice(Math.max(v, minPrice + 50000));
                      }}
                      className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
                    />
                  </div>

                  {(minPrice > 0 || maxPrice < MAX_PRICE) && (
                    <button onClick={() => { setMinPrice(0); setMaxPrice(MAX_PRICE); }}
                      className="w-full text-xs font-bold text-primary hover:underline">
                      Xoá bộ lọc giá
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowFilter(!showFilter)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container transition-all">
                  <SlidersHorizontal className="w-4 h-4" /> Lọc
                </button>
                <p className="text-sm text-on-surface-variant font-medium">
                  {loading ? 'Đang tải...' : `${products.length} sản phẩm`}
                </p>
              </div>

              <div className="relative">
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-outline-variant rounded-xl text-sm font-bold text-on-surface bg-white outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
              </div>
            </div>

            {/* Active filters */}
            {(search || category !== 'Tất cả' || minPrice > 0 || maxPrice < MAX_PRICE) && (
              <div className="flex flex-wrap gap-2 mb-5">
                {search && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
                    "{search}"
                    <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {category !== 'Tất cả' && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
                    {category}
                    <button onClick={() => setCategory('Tất cả')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {(minPrice > 0 || maxPrice < MAX_PRICE) && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
                    {minPrice.toLocaleString()}đ — {maxPrice >= MAX_PRICE ? '∞' : `${maxPrice.toLocaleString()}đ`}
                    <button onClick={() => { setMinPrice(0); setMaxPrice(MAX_PRICE); }}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-[24px] border border-outline-variant overflow-hidden animate-pulse">
                    <div className="aspect-square bg-surface-container" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-surface-container rounded-full w-3/4" />
                      <div className="h-3 bg-surface-container rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
                <ShoppingBag className="w-16 h-16 mb-4 opacity-30" />
                <p className="font-bold text-lg">Không tìm thấy sản phẩm nào</p>
                <p className="text-sm mt-1">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((product, i) => (
                  <motion.div key={product._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                    className="bg-white rounded-[24px] border border-outline-variant overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    {/* Image */}
                    <div className="aspect-square relative overflow-hidden bg-surface-container">
                      <img src={imgSrc(product.image)} alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f5f0eb/553722?text=🛍'; }}
                      />
                      {product.isNew && (
                        <span className="absolute top-3 left-3 bg-tertiary text-on-tertiary text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
                          Mới
                        </span>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white font-black text-sm bg-black/60 px-3 py-1 rounded-full">Hết hàng</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, s) => (
                          <Star key={s} className={`w-3 h-3 ${s < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                        ))}
                        <span className="text-[10px] font-bold text-on-surface-variant ml-0.5">{product.rating.toFixed(1)}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-on-surface text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-[10px] text-on-surface-variant mt-0.5 font-medium">{product.category}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
                        <span className="text-base font-black text-primary">{product.price.toLocaleString()}đ</span>
                        <button
                          disabled={product.stock === 0}
                          onClick={() => handleBuy(product)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Mua ngay
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {buying && <CheckoutModal product={buying} onClose={() => setBuying(null)} />}
    </div>
  );
};
