import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BulkPricingTable({ pricing = [], unit = 'piece' }) {
  const [expanded, setExpanded] = useState(false);

  if (!pricing.length) return null;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">Bulk Pricing</span>
          <Info size={14} className="text-gray-400" />
        </div>
        {expanded ? (
          <ChevronUp size={18} className="text-gray-500" />
        ) : (
          <ChevronDown size={18} className="text-gray-500" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-2 font-semibold text-gray-600">Quantity</th>
                  <th className="text-right px-4 py-2 font-semibold text-gray-600">Price per {unit}</th>
                  <th className="text-right px-4 py-2 font-semibold text-gray-600 hidden sm:table-cell">You Save</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((tier, i) => {
                  const savings = tier.savings || (i === 0 ? 0 : Math.round(((pricing[0].price - tier.price) / pricing[0].price) * 100));
                  return (
                    <tr
                      key={i}
                      className="border-b border-gray-50 last:border-0 hover:bg-emerald-50/50 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-gray-700 font-medium">
                        {tier.min}{tier.max ? ` - ${tier.max}` : '+'} {unit}s
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-emerald-700">
                        ₹{tier.price}
                      </td>
                      <td className="px-4 py-2.5 text-right text-emerald-600 hidden sm:table-cell">
                        {savings > 0 ? `${savings}% off` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-2.5 bg-emerald-50 text-xs text-emerald-700">
              💡 The more you order, the more you save! Contact us for orders above {pricing[pricing.length - 1]?.max || 500} units.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
