import { useState } from 'react';
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const colorOptions = [
  { name: 'Red', hex: '#E63946' },
  { name: 'Blue', hex: '#1D3557' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Green', hex: '#2D6A4F' },
  { name: 'Yellow', hex: '#F4D35E' },
  { name: 'Orange', hex: '#F77F00' },
  { name: 'Purple', hex: '#7B2CBF' },
  { name: 'Pink', hex: '#FF6B6B' },
  { name: 'Grey', hex: '#6C757D' },
];

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const materialOptions = ['Cotton', 'Polyester', 'Blend', 'Canvas', 'Vinyl', 'Paper', 'Ceramic', 'Metal'];
const ratingOptions = [4, 3, 2, 1];

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductFilter({ filters, onFilterChange, onClearAll }) {
  const {
    categories = [],
    selectedCategories = [],
    priceRange = { min: '', max: '' },
    selectedColors = [],
    selectedSizes = [],
    selectedMaterials = [],
    selectedRating = null,
    categoryTree = [],
  } = filters;

  const [expandedCats, setExpandedCats] = useState([]);

  const toggleCat = (id) => {
    const next = selectedCategories.includes(id)
      ? selectedCategories.filter((c) => c !== id)
      : [...selectedCategories, id];
    onFilterChange({ selectedCategories: next });
  };

  const toggleExpanded = (id) => {
    setExpandedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleColor = (hex) => {
    const next = selectedColors.includes(hex)
      ? selectedColors.filter((c) => c !== hex)
      : [...selectedColors, hex];
    onFilterChange({ selectedColors: next });
  };

  const toggleSize = (s) => {
    const next = selectedSizes.includes(s)
      ? selectedSizes.filter((sz) => sz !== s)
      : [...selectedSizes, s];
    onFilterChange({ selectedSizes: next });
  };

  const toggleMaterial = (m) => {
    const next = selectedMaterials.includes(m)
      ? selectedMaterials.filter((mt) => mt !== m)
      : [...selectedMaterials, m];
    onFilterChange({ selectedMaterials: next });
  };

  const renderCategoryTree = (nodes, depth = 0) => {
    return nodes.map((node) => (
      <div key={node._id || node.name} style={{ paddingLeft: depth * 16 }}>
        <label className="flex items-center gap-2 py-1 cursor-pointer group">
          <input
            type="checkbox"
            checked={selectedCategories.includes(node._id || node.name)}
            onChange={() => toggleCat(node._id || node.name)}
            className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
            {node.name}
          </span>
          {node.count != null && (
            <span className="text-xs text-gray-400 ml-auto">({node.count})</span>
          )}
        </label>
        {node.children && expandedCats.includes(node._id) && (
          <div>
            <button
              onClick={() => toggleExpanded(node._id)}
              className="text-xs text-brand-500 hover:underline ml-6"
            >
              {expandedCats.includes(node._id) ? '−' : '+'} expand
            </button>
            {renderCategoryTree(node.children, depth + 1)}
          </div>
        )}
        {node.children && node.children.length > 0 && (
          <button
            onClick={() => toggleExpanded(node._id)}
            className="text-xs text-brand-500 hover:underline ml-6"
          >
            {expandedCats.includes(node._id) ? '− Less' : '+ More'}
          </button>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-navy-700" />
          <h3 className="font-bold text-gray-900">Filters</h3>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs text-brand-500 hover:text-red-600 font-medium transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Categories */}
      <FilterSection title="Category">
        {categoryTree.length > 0 ? (
          <div className="space-y-0.5">{renderCategoryTree(categoryTree)}</div>
        ) : (
          <div className="space-y-0.5">
            {categories.map((cat) => (
              <label key={cat._id || cat.name} className="flex items-center gap-2 py-1 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat._id || cat.name)}
                  onChange={() => toggleCat(cat._id || cat.name)}
                  className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {cat.name}
                </span>
                {cat.count != null && (
                  <span className="text-xs text-gray-400 ml-auto">({cat.count})</span>
                )}
              </label>
            ))}
          </div>
        )}
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => onFilterChange({ priceRange: { ...priceRange, min: e.target.value } })}
              className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <span className="text-gray-300">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => onFilterChange({ priceRange: { ...priceRange, max: e.target.value } })}
              className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>
      </FilterSection>

      {/* Colors */}
      <FilterSection title="Colors">
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((c) => (
            <button
              key={c.hex}
              onClick={() => toggleColor(c.hex)}
              title={c.name}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedColors.includes(c.hex)
                  ? 'border-navy-700 ring-2 ring-navy-700/20 scale-110'
                  : 'border-gray-200 hover:border-gray-400'
              } ${c.hex === '#FFFFFF' ? 'ring-1 ring-gray-100' : ''}`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </FilterSection>

      {/* Sizes */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                selectedSizes.includes(s)
                  ? 'border-navy-700 bg-navy-700 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Material */}
      <FilterSection title="Material" defaultOpen={false}>
        <div className="space-y-0.5">
          {materialOptions.map((m) => (
            <label key={m} className="flex items-center gap-2 py-1 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedMaterials.includes(m)}
                onChange={() => toggleMaterial(m)}
                className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{m}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating">
        <div className="space-y-1">
          {ratingOptions.map((r) => (
            <button
              key={r}
              onClick={() => onFilterChange({ selectedRating: selectedRating === r ? null : r })}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-left transition-colors ${
                selectedRating === r ? 'bg-amber-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < r ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">& Up</span>
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}
