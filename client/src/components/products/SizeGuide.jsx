import { useState } from 'react';
import { X, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sizeData = {
  tshirt: {
    title: 'T-Shirt Size Guide',
    headers: ['Size', 'Chest (in)', 'Length (in)', 'Shoulder (in)'],
    rows: [
      ['XS', '36', '26', '16'],
      ['S', '38', '27', '17'],
      ['M', '40', '28', '18'],
      ['L', '42', '29', '19'],
      ['XL', '44', '30', '20'],
      ['XXL', '46', '31', '21'],
      ['3XL', '48', '32', '22'],
    ],
  },
  hoodie: {
    title: 'Hoodie Size Guide',
    headers: ['Size', 'Chest (in)', 'Length (in)', 'Sleeve (in)'],
    rows: [
      ['S', '40', '27', '25'],
      ['M', '42', '28', '26'],
      ['L', '44', '29', '27'],
      ['XL', '46', '30', '28'],
      ['XXL', '48', '31', '29'],
    ],
  },
  mug: {
    title: 'Mug Size Guide',
    headers: ['Type', 'Capacity', 'Height', 'Diameter'],
    rows: [
      ['Regular', '300 ml', '9.5 cm', '8 cm'],
      ['Large', '450 ml', '11 cm', '9 cm'],
    ],
  },
  sticker: {
    title: 'Sticker Size Guide',
    headers: ['Size Name', 'Dimensions', 'Best For'],
    rows: [
      ['Small', '2" × 2"', 'Laptops, bottles'],
      ['Medium', '3" × 3"', 'Notebooks, phones'],
      ['Large', '4" × 4"', 'Windows, doors'],
      ['Custom', 'Custom', 'Contact us'],
    ],
  },
};

export default function SizeGuide({ type = 'tshirt', isOpen, onClose }) {
  const [unit, setUnit] = useState('inches');
  const guide = sizeData[type] || sizeData.tshirt;

  const convertToCm = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return `${(num * 2.54).toFixed(1)} cm`;
  };

  const displayVal = (val) => {
    if (unit === 'cm' && guide.headers.some(h => h.includes('in'))) {
      return convertToCm(val);
    }
    return val;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Ruler size={20} className="text-navy-700" />
                <h2 className="text-lg font-bold text-gray-900">{guide.title}</h2>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-500">Unit:</span>
                <button
                  onClick={() => setUnit('inches')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    unit === 'inches' ? 'bg-navy-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Inches
                </button>
                <button
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    unit === 'cm' ? 'bg-navy-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  CM
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-gray-50">
                      {guide.headers.map((h, i) => (
                        <th key={i} className="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-200">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {guide.rows.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                        {row.map((cell, j) => (
                          <td key={j} className="px-4 py-2.5 text-gray-700">
                            {j > 0 ? displayVal(cell) : <span className="font-medium">{cell}</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-gray-400">
                * Measurements may vary by ±0.5 inches. For the best fit, we recommend measuring a garment you already own.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
