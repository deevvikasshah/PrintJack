import { useState, useEffect, useCallback } from 'react';
import { Ruler, Calculator, RefreshCw, ChevronDown, ChevronUp, Palette } from 'lucide-react';
import api from '../../utils/api';

function ProductCalculator({ productId, product }) {
  const [config, setConfig] = useState(null);
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const [dimensions, setDimensions] = useState({
    width: product?.calculatorConfig?.defaultWidth || 10,
    height: product?.calculatorConfig?.defaultHeight || 10,
    quantity: 1,
  });

  const [variables, setVariables] = useState({});

  const [designOptions, setDesignOptions] = useState({
    colorCount: 1,
    printCoverage: 100,
    printMethod: 'screen-printing',
    printSide: 'front',
    finish: 'none',
    lamination: 'none',
    specialEffects: 'none',
    complexity: 'standard',
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await api.get(`/products/${productId}/calculator-config`);
        if (data.success) {
          setConfig(data.config);
          const initialVars = {};
          if (data.config.variables) {
            data.config.variables.forEach((v) => {
              initialVars[v.name] = v.defaultValue;
            });
          }
          setVariables(initialVars);
        }
      } catch (err) {
        console.error('Failed to fetch calculator config:', err.message);
      }
    };

    if (productId) {
      fetchConfig();
    }
  }, [productId]);

  const calculate = useCallback(async () => {
    if (!config?.enabled) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post(`/products/${productId}/calculate`, {
        width: dimensions.width,
        height: dimensions.height,
        quantity: dimensions.quantity,
        variables,
        design: designOptions,
      });

      if (data.success) {
        setCalculation(data.calculation);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  }, [productId, dimensions, variables, config, designOptions]);
  useEffect(() => {
    const timer = setTimeout(() => {
      calculate();
    }, 500);

    return () => clearTimeout(timer);
  }, [calculate]);

  if (!config?.enabled) {
    return null;
  }

  const currency = config.currency || '₹';
  const dimUnit = config.dimensionUnit || 'cm';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Calculator className="w-5 h-5 text-[#E63946]" />
          <span className="font-semibold text-gray-900">Price Calculator</span>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>

      {expanded && (
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width ({dimUnit})
              </label>
              <input
                type="number"
                min={config.minWidth || 1}
                max={config.maxWidth || 1000}
                step={config.stepWidth || 1}
                value={dimensions.width}
                onChange={(e) => setDimensions((prev) => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height ({dimUnit})
              </label>
              <input
                type="number"
                min={config.minHeight || 1}
                max={config.maxHeight || 1000}
                step={config.stepHeight || 1}
                value={dimensions.height}
                onChange={(e) => setDimensions((prev) => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                max={10000}
                value={dimensions.quantity}
                onChange={(e) => setDimensions((prev) => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Design Options */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#E63946]" />
              Design Options
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Colors
                </label>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={1}
                  value={designOptions.colorCount}
                  onChange={(e) => setDesignOptions((prev) => ({ ...prev, colorCount: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>1 color</span>
                  <span className="font-semibold text-[#E63946]">{designOptions.colorCount} colors</span>
                  <span>8 colors</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Print Coverage ({designOptions.printCoverage}%)
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  step={1}
                  value={designOptions.printCoverage}
                  onChange={(e) => setDesignOptions((prev) => ({ ...prev, printCoverage: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Print Method
                </label>
                <select
                  value={designOptions.printMethod}
                  onChange={(e) => setDesignOptions((prev) => ({ ...prev, printMethod: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none"
                >
                  <option value="screen-printing">Screen Printing</option>
                  <option value="dtg">DTG (Direct to Garment)</option>
                  <option value="sublimation">Sublimation</option>
                  <option value="vinyl">Vinyl Cutting</option>
                  <option value="embroidery">Embroidery</option>
                  <option value="heat-transfer">Heat Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Print Side
                </label>
                <select
                  value={designOptions.printSide}
                  onChange={(e) => setDesignOptions((prev) => ({ ...prev, printSide: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none"
                >
                  <option value="front">Front Only</option>
                  <option value="back">Back Only</option>
                  <option value="both">Front & Back</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Finish
                </label>
                <select
                  value={designOptions.finish}
                  onChange={(e) => setDesignOptions((prev) => ({ ...prev, finish: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none"
                >
                  <option value="none">None</option>
                  <option value="matte">Matte</option>
                  <option value="glossy">Glossy</option>
                  <option value="satin">Satin</option>
                  <option value="soft-touch">Soft Touch</option>
                  <option value="uv-spot">UV Spot</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lamination
                </label>
                <select
                  value={designOptions.lamination}
                  onChange={(e) => setDesignOptions((prev) => ({ ...prev, lamination: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none"
                >
                  <option value="none">None</option>
                  <option value="matte">Matte Lamination</option>
                  <option value="glossy">Glossy Lamination</option>
                  <option value="soft-touch">Soft Touch</option>
                  <option value="hot-foil">Hot Foil</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Effects
                </label>
                <select
                  value={designOptions.specialEffects}
                  onChange={(e) => setDesignOptions((prev) => ({ ...prev, specialEffects: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none"
                >
                  <option value="none">None</option>
                  <option value="gold-foil">Gold Foil</option>
                  <option value="silver-foil">Silver Foil</option>
                  <option value="embossing">Embossing</option>
                  <option value="debossing">Debossing</option>
                  <option value="spot-uv">Spot UV</option>
                  <option value="glow-in-dark">Glow in Dark</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Design Complexity
                </label>
                <select
                  value={designOptions.complexity}
                  onChange={(e) => setDesignOptions((prev) => ({ ...prev, complexity: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none"
                >
                  <option value="simple">Simple</option>
                  <option value="standard">Standard</option>
                  <option value="complex">Complex</option>
                </select>
              </div>
            </div>
          </div>

          {config.variables && config.variables.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Customize Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.variables.map((variable) => (
                  <div key={variable.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {variable.label}
                      {variable.isRequired && <span className="text-red-500 ml-1">*</span>}
                      {variable.pricePerUnit > 0 && (
                        <span className="text-xs text-gray-400 ml-2">
                          ({currency}{variable.pricePerUnit}/{variable.unit})
                        </span>
                      )}
                    </label>

                    {variable.type === 'select' ? (
                      <select
                        value={variables[variable.name] || variable.defaultValue}
                        onChange={(e) => setVariables((prev) => ({ ...prev, [variable.name]: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none"
                      >
                        {variable.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : variable.type === 'checkbox' ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={variables[variable.name] || false}
                          onChange={(e) => setVariables((prev) => ({ ...prev, [variable.name]: e.target.checked }))}
                          className="w-4 h-4 rounded border-gray-300 text-[#E63946] focus:ring-[#E63946]"
                        />
                        <span className="text-sm text-gray-600">Enable {variable.label}</span>
                      </label>
                    ) : (
                      <input
                        type={variable.type === 'range' ? 'range' : 'number'}
                        min={variable.min}
                        max={variable.max}
                        step={variable.step}
                        value={variables[variable.name] || variable.defaultValue}
                        onChange={(e) => setVariables((prev) => ({
                          ...prev,
                          [variable.name]: variable.type === 'range'
                            ? parseFloat(e.target.value)
                            : parseFloat(e.target.value) || 0,
                        }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none"
                      />
                    )}

                    {variable.description && (
                      <p className="text-xs text-gray-400 mt-1">{variable.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="w-5 h-5 animate-spin text-[#E63946]" />
              <span className="ml-2 text-sm text-gray-500">Calculating...</span>
            </div>
          )}

          {calculation && !loading && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                Price Breakdown
              </h4>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-medium">{currency}{calculation.priceBreakdown.basePrice}</span>
                </div>
                {calculation.priceBreakdown.inkCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ink Cost</span>
                    <span className="font-medium">{currency}{calculation.priceBreakdown.inkCost}</span>
                  </div>
                )}
                {calculation.priceBreakdown.paperCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Paper Cost</span>
                    <span className="font-medium">{currency}{calculation.priceBreakdown.paperCost}</span>
                  </div>
                )}
                {calculation.priceBreakdown.laminationCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Lamination</span>
                    <span className="font-medium">{currency}{calculation.priceBreakdown.laminationCost}</span>
                  </div>
                )}
                {calculation.priceBreakdown.finishingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Finishing</span>
                    <span className="font-medium">{currency}{calculation.priceBreakdown.finishingCost}</span>
                  </div>
                )}
                {calculation.priceBreakdown.setupCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Setup Cost</span>
                    <span className="font-medium">{currency}{calculation.priceBreakdown.setupCost}</span>
                  </div>
                )}
                {calculation.priceBreakdown.shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{currency}{calculation.priceBreakdown.shippingCost}</span>
                  </div>
                )}
                {calculation.priceBreakdown.margin > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Margin</span>
                    <span className="font-medium">{currency}{calculation.priceBreakdown.margin}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-sm">
                  <span className="font-semibold text-gray-900">Subtotal ({calculation.quantity} pcs)</span>
                  <span className="font-semibold">{currency}{calculation.priceBreakdown.subtotal}</span>
                </div>
              </div>

              <div className="bg-[#E63946] text-white rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium opacity-90">Total Price</span>
                  <span className="text-2xl font-bold">{currency}{calculation.priceBreakdown.finalPrice}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs opacity-75">Per unit</span>
                  <span className="text-sm font-medium opacity-90">{currency}{calculation.priceBreakdown.perUnitPrice}</span>
                </div>
              </div>

              {calculation.bulkPricing && calculation.bulkPricing.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bulk Pricing</h5>
                  <div className="space-y-1">
                    {calculation.bulkPricing.map((tier, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600">
                        <span>{tier.minQty}+ units</span>
                        <span className="font-medium">{currency}{tier.price} / unit</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductCalculator;