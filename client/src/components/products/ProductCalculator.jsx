import { useState, useEffect, useCallback } from 'react';
import { Calculator, RefreshCw, ChevronDown, ChevronUp, Truck } from 'lucide-react';
import api from '../../utils/api';

function ProductCalculator({ productId, product }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [width, setWidth] = useState(product?.calculatorConfig?.defaultWidth || 0);
  const [height, setHeight] = useState(product?.calculatorConfig?.defaultHeight || 0);
  const [sizeKey, setSizeKey] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [options, setOptions] = useState({});
  const [design, setDesign] = useState({
    colorCount: 1,
    printCoverage: 100,
    printMethod: 'screen-printing',
    printSide: 'front',
    finish: 'none',
    lamination: 'none',
    specialEffects: 'none',
    complexity: 'standard',
    paperType: 'standard',
    cutType: 'straight',
    designType: 'logo',
    sizeOption: 'standard',
    rushOrder: false,
    proofRequired: false,
    revisionCount: 0,
  });
  const [calculation, setCalculation] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await api.get(`/products/${productId}/calculator-config`);
        if (data.success) {
          const cfg = data.config;
          setConfig(cfg);
          setWidth(cfg.defaultWidth || 0);
          setHeight(cfg.defaultHeight || 0);
          if (cfg.sizes && cfg.sizes.length > 0) {
            setSizeKey(cfg.sizes[0].key || cfg.sizes[0].label);
          }
          const initialOptions = {};
          (cfg.options || []).forEach((o) => {
            if (o.defaultValue !== undefined) initialOptions[o.key] = o.defaultValue;
          });
          setOptions(initialOptions);
        }
      } catch (err) {
        console.error('Failed to fetch calculator config:', err.message);
      }
    };
    if (productId) fetchConfig();
  }, [productId]);

  const buildPayload = useCallback(() => {
    const payload = {
      quantity,
      materials,
      options,
    };
    if (config?.showDesignOptions) {
      payload.design = design;
    }
    if (config?.sizes && config?.sizes.length > 0 && sizeKey) {
      payload.sizeKey = sizeKey;
    } else if (width && height) {
      payload.width = width;
      payload.height = height;
    }
    return payload;
  }, [quantity, materials, options, design, sizeKey, width, height, config]);

  const calculate = useCallback(async () => {
    if (!config?.enabled) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post(`/products/${productId}/calculate`, buildPayload());
      if (data.success) setCalculation(data.calculation);
    } catch (err) {
      setError(err.response?.data?.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  }, [productId, config?.enabled, buildPayload]);

  useEffect(() => {
    if (!config?.enabled) return;
    const timer = setTimeout(() => calculate(), 400);
    return () => clearTimeout(timer);
  }, [calculate, config?.enabled]);

  if (!config?.enabled) return null;

  const currency = config.currency || '₹';
  const dimUnit = config.dimensionUnit || 'cm';
  const hasSizes = (config.sizes || []).length > 0;
  const hasMaterials = (config.materials || []).length > 0;
  const hasOptions = (config.options || []).length > 0;
  const items = calculation?.lineItems || [];

  const toggleMaterial = (key) => {
    setMaterials((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

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
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              min={1}
              max={100000}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(parseInt(e.target.value) || 1, 1))}
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] focus:border-transparent outline-none"
            />
          </div>

          {/* Sizes */}
          {hasSizes && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {config.sizes.map((s) => {
                  const key = s.key || s.label;
                  const active = sizeKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSizeKey(key)}
                      className={`border rounded-lg px-3 py-2 text-sm text-center transition-colors ${
                        active
                          ? 'border-[#E63946] bg-[#E63946]/5 text-[#E63946] font-medium'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <span className="block">{s.label}</span>
                      {s.pricePerUnit > 0 && <span className="block text-xs text-gray-400">+{currency}{s.pricePerUnit}/{dimUnit}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {hasSizes && config.allowCustomDimensions && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Or custom dimensions</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={width}
                  onChange={(e) => { setWidth(parseFloat(e.target.value) || 0); setSizeKey(null); }}
                  placeholder="Width"
                  className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#E63946]"
                />
                <span>×</span>
                <input
                  type="number"
                  min={1}
                  value={height}
                  onChange={(e) => { setHeight(parseFloat(e.target.value) || 0); setSizeKey(null); }}
                  placeholder="Height"
                  className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#E63946]"
                />
                <span className="text-sm text-gray-500">{dimUnit}</span>
              </div>
            </div>
          )}

          {/* Materials */}
          {hasMaterials && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Materials</h4>
              <div className="space-y-2">
                {config.materials.map((m) => (
                  <label key={m.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={materials.includes(m.key)}
                      onChange={() => toggleMaterial(m.key)}
                      className="w-4 h-4 rounded border-gray-300 text-[#E63946] focus:ring-[#E63946]"
                    />
                    <span className="text-sm text-gray-600">{m.label}</span>
                    {m.pricePerUnit > 0 && (
                      <span className="text-xs text-gray-400">+{currency}{m.pricePerUnit} /unit</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Legacy Design Options */}
          {config.showDesignOptions && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Design Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Colors</label>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    step={1}
                    value={design.colorCount}
                    onChange={(e) => setDesign((prev) => ({ ...prev, colorCount: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>1 color</span>
                    <span className="font-semibold text-[#E63946]">{design.colorCount} colors</span>
                    <span>8 colors</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Print Coverage ({design.printCoverage}%)</label>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={design.printCoverage}
                    onChange={(e) => setDesign((prev) => ({ ...prev, printCoverage: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Print Method</label>
                  <select
                    value={design.printMethod}
                    onChange={(e) => setDesign((prev) => ({ ...prev, printMethod: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] outline-none"
                  >
                    <option value="screen-printing">Screen Printing</option>
                    <option value="dtg">DTG</option>
                    <option value="sublimation">Sublimation</option>
                    <option value="vinyl">Vinyl Cutting</option>
                    <option value="embroidery">Embroidery</option>
                    <option value="heat-transfer">Heat Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Print Side</label>
                  <select
                    value={design.printSide}
                    onChange={(e) => setDesign((prev) => ({ ...prev, printSide: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] outline-none"
                  >
                    <option value="front">Front Only</option>
                    <option value="back">Back Only</option>
                    <option value="both">Front & Back</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Finish</label>
                  <select
                    value={design.finish}
                    onChange={(e) => setDesign((prev) => ({ ...prev, finish: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] outline-none"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lamination</label>
                  <select
                    value={design.lamination}
                    onChange={(e) => setDesign((prev) => ({ ...prev, lamination: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] outline-none"
                  >
                    <option value="none">None</option>
                    <option value="matte">Matte Lamination</option>
                    <option value="glossy">Glossy Lamination</option>
                    <option value="soft-touch">Soft Touch</option>
                    <option value="hot-foil">Hot Foil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Effects</label>
                  <select
                    value={design.specialEffects}
                    onChange={(e) => setDesign((prev) => ({ ...prev, specialEffects: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] outline-none"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paper Type</label>
                  <select
                    value={design.paperType}
                    onChange={(e) => setDesign((prev) => ({ ...prev, paperType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] outline-none"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="recycled">Recycled</option>
                    <option value="art-paper">Art Paper</option>
                    <option value="glossy-photo">Glossy Photo</option>
                    <option value="canvas">Canvas</option>
                    <option value="waterproof">Waterproof</option>
                    <option value="craft">Craft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cut Type</label>
                  <select
                    value={design.cutType}
                    onChange={(e) => setDesign((prev) => ({ ...prev, cutType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] outline-none"
                  >
                    <option value="straight">Straight Cut</option>
                    <option value="die-cut">Die Cut</option>
                    <option value="kiss-cut">Kiss Cut</option>
                    <option value="rounded-corners">Rounded Corners</option>
                    <option value="custom-shape">Custom Shape</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Design Type</label>
                  <select
                    value={design.designType}
                    onChange={(e) => setDesign((prev) => ({ ...prev, designType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] outline-none"
                  >
                    <option value="text-only">Text Only</option>
                    <option value="logo">Logo</option>
                    <option value="illustration">Illustration</option>
                    <option value="photo">Photo</option>
                    <option value="pattern">Pattern</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Print Size</label>
                  <select
                    value={design.sizeOption}
                    onChange={(e) => setDesign((prev) => ({ ...prev, sizeOption: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] outline-none"
                  >
                    <option value="standard">Standard</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                    <option value="all-over">All Over Print</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Revision Count</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={design.revisionCount}
                    onChange={(e) => setDesign((prev) => ({ ...prev, revisionCount: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{currency}15 per revision</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={design.rushOrder}
                    onChange={(e) => setDesign((prev) => ({ ...prev, rushOrder: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-[#E63946] focus:ring-[#E63946]"
                  />
                  <span className="text-sm text-gray-600">Rush Order (+{currency}100)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={design.proofRequired}
                    onChange={(e) => setDesign((prev) => ({ ...prev, proofRequired: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-[#E63946] focus:ring-[#E63946]"
                  />
                  <span className="text-sm text-gray-600">Print Proof (+{currency}25)</span>
                </label>
              </div>
            </div>
          )}

          {/* Options */}
          {hasOptions && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Customize</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.options.map((opt) => (
                  <div key={opt.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {opt.label}
                      {opt.isRequired && <span className="text-red-500 ml-1">*</span>}
                      {opt.pricePerUnit > 0 && (
                        <span className="text-xs text-gray-400 ml-2">({currency}{opt.pricePerUnit}/unit)</span>
                      )}
                    </label>

                    {opt.type === 'select' && (
                      <select
                        value={options[opt.key] ?? opt.defaultValue ?? ''}
                        onChange={(e) => setOptions((prev) => ({ ...prev, [opt.key]: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E63946] outline-none"
                      >
                        {(opt.choices || []).map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}{c.price > 0 ? ` (+${currency}${c.price}${c.perUnit ? '/unit' : ''})` : ''}
                          </option>
                        ))}
                      </select>
                    )}

                    {opt.type === 'checkbox' && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(options[opt.key])}
                          onChange={(e) => setOptions((prev) => ({ ...prev, [opt.key]: e.target.checked }))}
                          className="w-4 h-4 rounded border-gray-300 text-[#E63946] focus:ring-[#E63946]"
                        />
                        <span className="text-sm text-gray-600">Enable {opt.label}</span>
                      </label>
                    )}

                    {(opt.type === 'range' || opt.type === 'number') && (
                      <input
                        type={opt.type === 'range' ? 'range' : 'number'}
                        min={opt.min}
                        max={opt.max}
                        step={opt.step}
                        value={options[opt.key] ?? opt.defaultValue ?? opt.min ?? 0}
                        onChange={(e) => setOptions((prev) => ({ ...prev, [opt.key]: parseFloat(e.target.value) || 0 }))}
                        className={opt.type === 'range' ? 'w-full' : 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none'}
                      />
                    )}

                    {opt.description && <p className="text-xs text-gray-400 mt-1">{opt.description}</p>}
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
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Price Breakdown</h4>

              <div className="space-y-2 mb-4">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium">{currency}{item.amount.toFixed(2)}</span>
                  </div>
                ))}
                {config.showDesignOptions && calculation.priceBreakdown.inkCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ink Cost</span>
                    <span className="font-medium">{currency}{calculation.priceBreakdown.inkCost.toFixed(2)}</span>
                  </div>
                )}
                {config.showDesignOptions && calculation.priceBreakdown.paperCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Paper Cost</span>
                    <span className="font-medium">{currency}{calculation.priceBreakdown.paperCost.toFixed(2)}</span>
                  </div>
                )}
                {config.showDesignOptions && calculation.priceBreakdown.laminationCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Lamination</span>
                    <span className="font-medium">{currency}{calculation.priceBreakdown.laminationCost.toFixed(2)}</span>
                  </div>
                )}
                {config.showDesignOptions && calculation.priceBreakdown.finishingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Finishing</span>
                    <span className="font-medium">{currency}{calculation.priceBreakdown.finishingCost.toFixed(2)}</span>
                  </div>
                )}
                {config.showDesignOptions && calculation.priceBreakdown.setupCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Setup</span>
                    <span className="font-medium">{currency}{calculation.priceBreakdown.setupCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-sm">
                  <span className="font-semibold text-gray-900">Subtotal ({calculation.quantity} pcs)</span>
                  <span className="font-semibold">{currency}{calculation.priceBreakdown.subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-[#E63946] text-white rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium opacity-90">Total Price</span>
                  <span className="text-2xl font-bold">{currency}{calculation.priceBreakdown.finalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs opacity-75">Per unit</span>
                  <span className="text-sm font-medium opacity-90">{currency}{calculation.priceBreakdown.perUnitPrice.toFixed(2)}</span>
                </div>
              </div>

              {calculation.bulkPricing?.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bulk Pricing</h5>
                  <div className="space-y-1">
                    {calculation.bulkPricing.map((tier, i) => (
                      <div key={i} className={`flex justify-between text-xs ${tier.active ? 'text-[#E63946] font-semibold' : 'text-gray-600'}`}>
                        <span>{tier.minQty}+ units</span>
                        <span className="font-medium">{currency}{tier.price} / unit</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {calculation.deliveryEstimate && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <Truck className="w-4 h-4 text-[#E63946]" />
                  <span>
                    Estimated delivery: <span className="font-semibold">{calculation.deliveryEstimate.minDays}-{calculation.deliveryEstimate.maxDays} days</span>
                  </span>
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