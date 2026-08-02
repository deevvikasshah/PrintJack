import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, Grid3X3, List, ChevronDown, X,
  ChevronLeft, ChevronRight, Loader2, PackageOpen,
} from 'lucide-react';
import ProductCard from '../../components/products/ProductCard';
import ProductFilter from '../../components/products/ProductFilter';
import api from '../../utils/api';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'bestselling', label: 'Best Selling' },
  { value: 'rating', label: 'Highest Rated' },
];

function ProductSkeleton() {
  return (
    <div className="bg-paper-50 rounded-2xl border border-ink/10 overflow-hidden animate-pulse">
      <div className="aspect-square bg-paper-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-paper-200 rounded w-1/3" />
        <div className="h-4 bg-paper-200 rounded w-2/3" />
        <div className="h-3 bg-paper-200 rounded w-1/4" />
        <div className="h-5 bg-paper-200 rounded w-1/3" />
        <div className="flex gap-2">
          <div className="h-9 bg-paper-200 rounded-full flex-1" />
          <div className="h-9 bg-paper-200 rounded-full w-20" />
        </div>
      </div>
    </div>
  );
}

function normalizeProduct(p) {
  const img = p.images && p.images[0];
  return {
    ...p,
    price: p.basePrice || p.price || 0,
    bulkPrice: p.bulkPrice || (p.bulkPricing && p.bulkPricing.length > 0 ? p.bulkPricing[0].price : null),
    rating: p.averageRating || p.rating || 0,
    reviewCount: p.totalReviews || p.reviewCount || 0,
    images: p.images ? p.images.map((i) => (typeof i === 'string' ? i : i.url || i)) : [],
    colors: p.colors ? p.colors.map((c) => ({ name: c.name || c, hex: c.hexCode || c.hex || '#ccc' })) : [],
    sizes: p.sizes ? p.sizes.map((s) => (typeof s === 'string' ? s : s.name || s)) : [],
    discount: p.discount || 0,
    badge: p.badge || null,
    minOrder: p.minimumOrderQuantity || 1,
  };
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
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 12;

  const [categoryTree, setCategoryTree] = useState([]);
  const [filters, setFilters] = useState({
    categories: [],
    selectedCategories: searchParams.get('category') ? [searchParams.get('category')] : [],
    priceRange: { min: '', max: '' },
    selectedColors: [],
    selectedSizes: [],
    selectedMaterials: [],
    selectedRating: null,
    categoryTree: [],
  });

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    setFilters((prev) => ({
      ...prev,
      selectedCategories: categoryParam ? [categoryParam] : [],
    }));
  }, [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        if (data.success) {
          setCategoryTree(data.categories || data.data || []);
          setFilters((prev) => ({ ...prev, categories: data.categories || data.data || [] }));
        }
      } catch {
        console.log('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        const flatCategories = filters.selectedCategories.length > 0
          ? filters.selectedCategories.join(',')
          : undefined;
        if (flatCategories) params.set('category', flatCategories);
        if (filters.priceRange.min) params.set('minPrice', filters.priceRange.min);
        if (filters.priceRange.max) params.set('maxPrice', filters.priceRange.max);
        if (filters.selectedRating) params.set('rating', filters.selectedRating);
        if (searchQuery) params.set('search', searchQuery);
        if (sortBy) params.set('sort', sortBy);
        params.set('page', currentPage);
        params.set('limit', perPage);

        const { data } = await api.get(`/products?${params.toString()}`);
        if (data.success) {
          const rawProducts = data.products || data.data || [];
          const normalized = rawProducts.map(normalizeProduct);
          setProducts(normalized);
          const total = data.pagination?.pages || Math.ceil((data.pagination?.total || rawProducts.length) / perPage);
          setTotalPages(Math.max(1, total));
        } else {
          setProducts([]);
          setTotalPages(1);
        }
      } catch {
        setProducts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [sortBy, searchQuery, filters.selectedCategories, filters.priceRange, filters.selectedRating, currentPage]);

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
  if (filters.selectedRating) activeFilterTags.push({ type: 'rating', value: filters.selectedRating, label: `${filters.selectedRating}\u2605 & Up` });
  if (filters.priceRange.min) activeFilterTags.push({ type: 'priceMin', value: 'min', label: `Min \u20b9${filters.priceRange.min}` });
  if (filters.priceRange.max) activeFilterTags.push({ type: 'priceMax', value: 'max', label: `Max \u20b9${filters.priceRange.max}` });

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
    <div className="min-h-screen bg-paper-100">
      {/* Header */}
      <div className="bg-paper-50 border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <span className="text-sm text-moo-green font-medium uppercase tracking-widest">Shop</span>
              <h1 className="mt-2 font-display text-3xl sm:text-5xl text-ink">All Products</h1>
              <p className="text-sm text-ink/50 mt-2">{products.length} products found</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 sm:flex-none sm:w-72">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-9 py-3 border border-ink/15 rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-moo-green/30 focus:border-moo-green transition-colors"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink">
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-9 py-3 border border-ink/15 rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-moo-green/30 focus:border-moo-green"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none" />
              </div>
              <div className="hidden sm:flex border border-ink/15 rounded-full overflow-hidden">
                <button onClick={() => setView('grid')} className={`p-3 transition-colors ${view === 'grid' ? 'bg-ink text-paper-50' : 'bg-white text-ink/60 hover:bg-paper-50'}`}>
                  <Grid3X3 size={16} />
                </button>
                <button onClick={() => setView('list')} className={`p-3 transition-colors ${view === 'list' ? 'bg-ink text-paper-50' : 'bg-white text-ink/60 hover:bg-paper-50'}`}>
                  <List size={16} />
                </button>
              </div>
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden p-3 border border-ink/15 rounded-full bg-white hover:bg-paper-50"
              >
                <SlidersHorizontal size={16} className="text-ink/70" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeFilterTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilterTags.map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-moo-green/10 text-moo-green text-xs font-medium px-3 py-1.5 rounded-full">
                {tag.label}
                <button onClick={() => removeTag(tag)} className="hover:text-ink">
                  <X size={12} />
                </button>
              </span>
            ))}
            <button onClick={clearAll} className="text-xs text-ink/50 hover:text-ink font-medium ml-1">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-paper-50 rounded-2xl p-5 border border-ink/10">
              <ProductFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearAll={clearAll}
              />
            </div>
          </aside>

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
                      <h2 className="font-display text-lg text-ink">Filters</h2>
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
                      className="mt-6 w-full bg-ink hover:bg-moo-green text-paper-50 font-semibold py-3 rounded-full transition-colors"
                    >
                      Show {products.length} Results
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <PackageOpen size={64} className="mx-auto text-ink/20 mb-4" />
                <h3 className="font-display text-xl text-ink mb-2">No products found</h3>
                <p className="text-ink/50 mb-6">Try adjusting your filters or search query</p>
                <button onClick={clearAll} className="bg-ink hover:bg-moo-green text-paper-50 font-semibold px-6 py-3 rounded-full transition-colors">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <motion.div
                layout
                className={`grid gap-6 ${view === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
              >
                <AnimatePresence>
                  {products.slice((currentPage - 1) * perPage, currentPage * perPage).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {!loading && products.length > 0 && totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-full border border-ink/15 hover:bg-paper-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-full text-sm font-semibold transition-colors ${
                      currentPage === i + 1
                        ? 'bg-ink text-paper-50'
                        : 'border border-ink/15 text-ink/70 hover:bg-paper-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-full border border-ink/15 hover:bg-paper-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
