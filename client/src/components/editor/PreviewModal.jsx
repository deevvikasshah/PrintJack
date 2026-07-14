import React, { useState, useMemo } from 'react';
import { X, ShoppingCart, Edit3, Minus, Plus, Package } from 'lucide-react';
import { clsx } from 'clsx';

const QUANTITY_TIERS = [
  { min: 1, max: 9, priceMultiplier: 1.0 },
  { min: 10, max: 24, priceMultiplier: 0.9 },
  { min: 25, max: 49, priceMultiplier: 0.8 },
  { min: 50, max: 99, priceMultiplier: 0.7 },
  { min: 100, max: 249, priceMultiplier: 0.6 },
  { min: 250, max: 499, priceMultiplier: 0.5 },
  { min: 500, max: Infinity, priceMultiplier: 0.4 },
];

export default function PreviewModal({
  isOpen,
  onClose,
  product,
  designPreviewUrl,
  onAddToCart,
  onEditDesign,
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  const basePrice = product?.basePrice || product?.price || 299;

  const pricingTier = useMemo(
    () => QUANTITY_TIERS.find((t) => quantity >= t.min && quantity <= t.max),
    [quantity]
  );

  const unitPrice = useMemo(
    () => Math.round(basePrice * (pricingTier?.priceMultiplier || 1)),
    [basePrice, pricingTier]
  );

  const totalPrice = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

  const sizes = product?.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = product?.colors || [];

  if (!isOpen) return null;

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await onAddToCart({
        productId: product._id,
        quantity,
        size: selectedSize || sizes[0],
        color: selectedColor || colors[0]?.name,
      });
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Design Preview</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-6 flex items-center justify-center bg-gray-50 min-h-[300px]">
              <div className="relative max-w-sm w-full">
                {product?.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full rounded-lg shadow-lg"
                  />
                )}
                {designPreviewUrl && (
                  <img
                    src={designPreviewUrl}
                    alt="Design overlay"
                    className="absolute inset-0 w-full h-full object-contain"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                )}
                {!product?.image && !designPreviewUrl && (
                  <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="w-full md:w-80 p-6 border-l space-y-5">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{product?.name || 'Product'}</h3>
                <p className="text-sm text-gray-500 mt-1">{product?.description || 'Custom design product'}</p>
              </div>

              {sizes.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={clsx(
                          'px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors',
                          selectedSize === size
                            ? 'border-brand-500 bg-brand-50 text-brand-600'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {colors.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={clsx(
                          'w-8 h-8 rounded-full border-2 transition-all',
                          selectedColor === c.name
                            ? 'border-brand-500 ring-2 ring-brand-200 scale-110'
                            : 'border-gray-200 hover:border-gray-400'
                        )}
                        style={{ backgroundColor: c.hex || c.color }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Unit price</span>
                  <span>₹{unitPrice}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Quantity</span>
                  <span>× {quantity}</span>
                </div>
                {pricingTier && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Bulk discount ({Math.round((1 - pricingTier.priceMultiplier) * 100)}% off)</span>
                    <span>-₹{(basePrice * quantity - totalPrice).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onEditDesign}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Design
          </button>
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50 shadow-md"
          >
            <ShoppingCart className="w-4 h-4" />
            {addingToCart ? 'Adding...' : `Add to Cart — ₹${totalPrice.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
