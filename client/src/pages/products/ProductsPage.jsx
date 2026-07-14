import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, Grid3X3, List, ChevronDown, X,
  ChevronLeft, ChevronRight, Loader2, PackageOpen,
} from 'lucide-react';
import ProductCard from '../../components/products/ProductCard';
import ProductFilter from '../../components/products/ProductFilter';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'bestselling', label: 'Best Selling' },
  { value: 'rating', label: 'Highest Rated' },
];

const mockProducts = Array.from({ length: 24 }, (_, i) => ({
  _id: `p${i + 1}`,
  name: [
    'Premium Business Card', 'Custom T-Shirt', 'Vinyl Sticker Pack', 'Roll-Up Banner',
    'Ceramic Coffee Mug', 'A5 Flyer', 'Lanyard Print', 'Canvas Tote Bag',
    'Notebook Cover', 'Phone Case', 'Hoodie Print', 'Keychain',
  ][i % 12],
  slug: `product-${i + 1}`,
  images: [`https://picsum.photos/seed/prod${i}/400/400`],
  category: { name: ['Business Cards', 'Apparel', 'Stickers', 'Wide Format', 'Mugs & Gifts', 'Marketing', 'Apparel', 'Apparel', 'Stickers', 'Apparel', 'Apparel', 'Mugs & Gifts'][i % 12] },
  price: [299, 499, 149, 1299, 399, 99, 199, 349, 249, 599, 699, 179][i % 12],
  bulkPrice: [199, 299, 79, 899, 249, 49, 129, 219, 149, 399, 449, 99][i % 12],
  rating: [4.8, 4.6, 4.9, 4.7, 4.5, 4.4, 4.3, 4.7, 4.6, 4.8, 4.5, 4.4][i % 12],
  reviewCount: [342, 518, 891, 156, 234, 678, 123, 456, 789, 234, 567, 345][i % 12],
  discount: [0, 20, 30, 0, 0, 15, 0, 25, 0, 10, 0, 0][i % 12],
  badge: [null, 'bestseller', null, null, 'new', null, null, null, 'bestseller', null, null, null][i % 12],
}));

const categoryTree = [
  { _id: 'business-cards', name: 'Business Cards', count: 45 },
  { _id: 'apparel', name: 'Apparel', count: 120, children: [
    { _id: 'tshirts', name: 'T-Shirts', count: 45 },
    { _id: 'hoodies', name: 'Hoodies', count: 30 },
    { _id: 'caps', name: 'Caps & Hats', count: 15 },
  ]},
  { _id: 'stickers', name: 'Stickers', count: 80 },
  { _id: 'marketing', name: 'Marketing Materials', count: 65, children: [
    { _id: 'flyers', name: 'Flyers & Brochures', count: 25 },
    { _id: 'posters', name: 'Posters', count: 20 },
    { _id: 'banners', name: 'Banners', count: 20 },
  ]},
  { _id: 'wide-format', name: 'Wide Format', count: 30 },
  { _id: 'mugs-gifts', name: 'Mugs & Gifts', count: 55 },
];

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="flex gap-2">
          <div className="h-9 bg-gray-200 rounded-xl flex-1" />
          <div className="h-9 bg-gray-200 rounded-xl w-20" />
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [totalPages] = useState(5);
  const perPage = 12;

  const [filters, setFilters] = useState({
    categories: categoryTree,
    selectedCategories: searchParams.get('category') ? [searchParams.get('category')] : [],
    priceRange: { min: '', max: '' },
    selectedColors: [],
    selectedSizes: [],
    selectedMaterials: [],
    selectedRating: null,
    categoryTree,
  });

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      let result = [...mockProducts];
      if (searchQuery) {
        result = result.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (filters.selectedCategories.length) {
        result = result.filter((p) =>
          filters.selectedCategories.includes(p.category?.name?.toLowerCase().replace(/\s+/g, '-'))
        );
      }
      if (filters.priceRange.min) {
        result = result.filter((p) => p.price >= Number(filters.priceRange.min));
      }
      if (filters.priceRange.max) {
        result = result.filter((p) => p.price <= Number(filters.priceRange.max));
      }
      if (filters.selectedRating) {
        result = result.filter((p) => p.rating >= filters.selectedRating);
      }
      switch (sortBy) {
        case 'price-low': result.sort((a, b) => a.price - b.price); break;
        case 'price-high': result.sort((a, b) => b.price - a.price); break;
        case 'bestselling': result.sort((a, b) => b.reviewCount - a.reviewCount); break;
        case 'rating': result.sort((a, b) => b.rating - a.rating); break;
        default: break;
      }
      setProducts(result);
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, [sortBy, searchQuery, filters.selectedCategories, filters.priceRange, filters.selectedRating]);

  const handleFilterChange = useCallback((update) => {
    setFilters((prev) => ({ ...prev, ...update }));
    setCurrentPage(1);
  }, []);

  const clearAll = () => {
    setFilters((prev) => ({
      ...prev,
      selectedCategories: [],
      priceRange: { min: '', max: '' },
      selectedColors: [],
      selectedSizes: [],
      selectedMaterials: [],
      selectedRating: null,
    }));
    setSearchQuery('');
    setCurrentPage(1);
  };

  const activeFilterTags = [];
  filters.selectedCategories.forEach((c) => activeFilterTags.push({ type: 'category', value: c, label: c }));
  filters.selectedColors.forEach((c) => activeFilterTags.push({ type: 'color', value: c, label: c }));
  filters.selectedSizes.forEach((s) => activeFilterTags.push({ type: 'size', value: s, label: s }));
  filters.selectedMaterials.forEach((m) => activeFilterTags.push({ type: 'material', value: m, label: m }));
  if (filters.selectedRating) activeFilterTags.push({ type: 'rating', value: filters.selectedRating, label: `${filters.selectedRating}★ & Up` });
  if (filters.priceRange.min) activeFilterTags.push({ type: 'priceMin', value: 'min', label: `Min ₹${filters.priceRange.min}` });
  if (filters.priceRange.max) activeFilterTags.push({ type: 'priceMax', value: 'max', label: `Max ₹${filters.priceRange.max}` });

  const removeTag = (tag) => {
    switch (tag.type) {
      case 'category':
        handleFilterChange({ selectedCategories: filters.selectedCategories.filter((c) => c !== tag.value) });
        break;
      case 'color':
        handleFilterChange({ selectedColors: filters.selectedColors.filter((c) => c !== tag.value) });
        break;
      case 'size':
        handleFilterChange({ selectedSizes: filters.selectedSizes.filter((s) => s !== tag.value) });
        break;
      case 'material':
        handleFilterChange({ selectedMaterials: filters.selectedMaterials.filter((m) => m !== tag.value) });
        break;
      case 'rating':
        handleFilterChange({ selectedRating: null });
        break;
      case 'priceMin':
        handleFilterChange({ priceRange: { ...filters.priceRange, min: '' } });
        break;
      case 'priceMax':
        handleFilterChange({ priceRange: { ...filters.priceRange, max: '' } });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">All Products</h1>
              <p className="text-sm text-gray-500 mt-1">{products.length} products found</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {/* View toggle */}
              <div className="hidden sm:flex border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setView('grid')} className={`p-2.5 ${view === 'grid' ? 'bg-navy-700 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                  <Grid3X3 size={16} />
                </button>
                <button onClick={() => setView('list')} className={`p-2.5 ${view === 'list' ? 'bg-navy-700 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                  <List size={16} />
                </button>
              </div>
              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                <SlidersHorizontal size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Active filter tags */}
        {activeFilterTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilterTags.map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-brand-500/10 text-brand-500 text-xs font-medium px-3 py-1.5 rounded-full">
                {tag.label}
                <button onClick={() => removeTag(tag)} className="hover:text-red-600">
                  <X size={12} />
                </button>
              </span>
            ))}
            <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-600 font-medium ml-1">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <ProductFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearAll={clearAll}
              />
            </div>
          </aside>

          {/* Mobile filter drawer */}
          <AnimatePresence>
            {showFilters && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  onClick={() => setShowFilters(false)}
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden overflow-y-auto shadow-2xl"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                      <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X size={20} className="text-gray-500" />
                      </button>
                    </div>
                    <ProductFilter
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      onClearAll={clearAll}
                    />
                    <button
                      onClick={() => setShowFilters(false)}
                      className="mt-6 w-full bg-brand-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors"
                    >
                      Show {products.length} Results
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className={`grid gap-5 ${
                view === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
              }`}>
                {[...Array(8)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <PackageOpen size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
                <button
                  onClick={clearAll}
                  className="bg-brand-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <motion.div
                layout
                className={`grid gap-5 ${
                  view === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                }`}
              >
                <AnimatePresence>
                  {products.slice((currentPage - 1) * perPage, currentPage * perPage).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Pagination */}
            {!loading && products.length > 0 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                      currentPage === i + 1
                        ? 'bg-navy-700 text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
