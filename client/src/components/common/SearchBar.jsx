import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { useApi } from '../../hooks/useApi';
import api from '../../utils/api';
import { formatPrice } from '../../utils/formatters';

export default function SearchBar({ onClose }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);
  const { execute: searchProducts, data: results, loading } = useApi(api.get);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2) {
      searchProducts(`/products/search?q=${debouncedQuery}&limit=6`);
    }
  }, [debouncedQuery, searchProducts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query.trim())}`);
      onClose?.();
    }
  };

  const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');

  const handleSelect = (term) => {
    localStorage.setItem(
      'recentSearches',
      JSON.stringify([term, ...recentSearches.filter((s) => s !== term)].slice(0, 5))
    );
    navigate(`/products?q=${encodeURIComponent(term)}`);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <Search size={20} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, categories..."
            className="flex-1 text-lg outline-none text-[#1D3557] placeholder-gray-400"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          )}
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            ESC
          </button>
        </form>

        <div className="max-h-96 overflow-y-auto">
          {loading && debouncedQuery && (
            <div className="p-6 text-center">
              <div className="w-6 h-6 border-2 border-[#E63946] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}

          {!loading && results?.products?.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Products</p>
              {results.products.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <img src={product.images?.[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1D3557] truncate">{product.name}</p>
                    <p className="text-sm text-[#E63946] font-semibold">{formatPrice(product.price)}</p>
                  </div>
                  <ArrowRight size={14} className="text-gray-300" />
                </Link>
              ))}
            </div>
          )}

          {!loading && debouncedQuery && results?.products?.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">No results found for "{debouncedQuery}"</p>
            </div>
          )}

          {!debouncedQuery && recentSearches.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Recent Searches</p>
              {recentSearches.map((term, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(term)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors"
                >
                  <Search size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{term}</span>
                </button>
              ))}
            </div>
          )}

          {!debouncedQuery && recentSearches.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400">Type to search for products</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
