const { Product } = require('../models');
const { AppError } = require('../middleware/errorHandler');

const DESIGN_COST_MULTIPLIERS = {
  printMethod: {
    'screen-printing': 1.5,
    dtg: 1.3,
    sublimation: 1.1,
    vinyl: 1.2,
    embroidery: 2.0,
    'heat-transfer': 1.0,
  },
  finish: {
    none: 1.0,
    matte: 1.1,
    glossy: 1.1,
    satin: 1.15,
    'soft-touch': 1.25,
    'uv-spot': 1.3,
  },
  lamination: {
    none: 0,
    matte: 15,
    glossy: 12,
    'soft-touch': 25,
    'hot-foil': 40,
  },
  specialEffects: {
    none: 0,
    'gold-foil': 60,
    'silver-foil': 55,
    embossing: 45,
    debossing: 45,
    'spot-uv': 30,
    'glow-in-dark': 35,
  },
  paperType: {
    standard: 0,
    premium: 20,
    recycled: 25,
    'art-paper': 30,
    'glossy-photo': 40,
    canvas: 60,
    waterproof: 35,
    craft: 15,
  },
  cutType: {
    straight: 0,
    'die-cut': 30,
    'kiss-cut': 25,
    'rounded-corners': 10,
    'custom-shape': 50,
  },
  designType: {
    'text-only': 0.8,
    logo: 1.0,
    illustration: 1.3,
    photo: 1.2,
    pattern: 1.4,
    mixed: 1.5,
  },
  sizeOption: {
    standard: 1.0,
    large: 1.3,
    'extra-large': 1.6,
    'all-over': 2.0,
  },
};

function round2(n) {
  return Math.round(n * 100) / 100;
}

exports.calculatePrice = async (req, res, next) => {
  try {
    const productId = req.params.productId || req.params.id;
    const { quantity = 1, width, height, sizeKey, materials, options, design } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new AppError('Product not found or unavailable', 404);
    }

    if (!product.calculatorConfig || !product.calculatorConfig.enabled) {
      throw new AppError('Calculator is not enabled for this product', 400);
    }

    const config = product.calculatorConfig;
    const qty = Math.max(parseInt(quantity, 10) || 1, 1);
    const currency = config.currency || '₹';
    const dimUnit = config.dimensionUnit || 'cm';

    // Bulk-tier base price (per unit)
    let unitPrice = config.unitPrice || product.basePrice || 0;
    if (product.bulkPricing && product.bulkPricing.length > 0) {
      let best = null;
      product.bulkPricing.forEach((tier) => {
        const min = tier.minQty || 0;
        const max = tier.maxQty || Infinity;
        if (qty >= min && qty <= max && (best === null || min >= best.minQty)) {
          best = tier;
        }
      });
      if (best) unitPrice = best.price;
    }
    unitPrice = round2(unitPrice);

    const lineItems = [];

    // Base price
    const basePrice = round2(unitPrice * qty);
    lineItems.push({ label: `Base price (${currency}${unitPrice} × ${qty})`, key: 'base', amount: basePrice });

    // Size selection
    let sizeCost = 0;
    let chosenSize = null;
    const sizes = config.sizes || [];
    if (sizes.length > 0) {
      chosenSize = sizes.find((s) => !sizeKey || s.label === sizeKey || (s.key && s.key === sizeKey)) || sizes[0];
      sizeCost = round2((chosenSize.pricePerUnit || 0) * qty);
      if (sizeCost > 0) {
        lineItems.push({ label: `Size surcharge (${chosenSize.label})`, key: 'size', amount: sizeCost });
      }
    }

    // Area cost (only when using custom dimensions)
    let areaCost = 0;
    if (config.allowCustomDimensions && width && height) {
      const w = parseFloat(width) || 0;
      const h = parseFloat(height) || 0;
      if (w > 0 && h > 0) {
        areaCost = round2((w * h) * (config.areaCost || 0) * qty);
        if (areaCost > 0) {
          lineItems.push({ label: `Area cost (${w}×${h} ${dimUnit}²)`, key: 'area', amount: areaCost });
        }
      }
    }

    // Materials (per-unit surcharge)
    let materialCost = 0;
    const materialsList = config.materials || [];
    const selectedMaterials = Array.isArray(materials) ? materials : [];
    const materialsDetailed = [];
    materialsList.forEach((m) => {
      if (selectedMaterials.includes(m.key) || (m.alwaysIncluded)) {
        const c = round2((m.pricePerUnit || 0) * qty);
        materialCost += c;
        if (c > 0) {
          lineItems.push({ label: `Material - ${m.label}`, key: 'material', amount: c });
        }
        materialsDetailed.push({ label: m.label, key: m.key, pricePerUnit: m.pricePerUnit || 0, amount: c });
      }
    });
    materialCost = round2(materialCost);

    // Options (additive)
    let optionCost = 0;
    const optionDetailed = [];
    const optionValues = options || {};
    (config.options || []).forEach((opt) => {
      if (!opt || !opt.key) return;
      const userVal = optionValues[opt.key] !== undefined ? optionValues[opt.key] : opt.defaultValue;
      let cost = 0;
      if (opt.type === 'select') {
        const choice = (opt.choices || []).find((c) => c.value === userVal);
        if (choice) {
          cost = choice.perUnit ? round2((choice.price || 0) * qty) : (choice.price || 0);
        }
      } else if (opt.type === 'checkbox') {
        if (userVal) cost = round2((opt.pricePerUnit || 0) * qty);
      } else {
        cost = round2((parseFloat(userVal) || 0) * (opt.pricePerUnit || 0) * qty);
      }
      if (cost > 0) {
        lineItems.push({ label: opt.label, key: 'option', amount: cost });
      }
      optionCost += cost;
      optionDetailed.push({ label: opt.label, key: opt.key, type: opt.type, value: userVal, cost: round2(cost) });
    });
    optionCost = round2(optionCost);

    // Fixed fees
    const setupFee = round2(config.setupFee || 0);
    const shippingFee = round2(config.shippingFee || 0);
    if (setupFee > 0) lineItems.push({ label: 'Setup fee', key: 'setup', amount: setupFee });
    if (shippingFee > 0) lineItems.push({ label: 'Shipping', key: 'shipping', amount: shippingFee });

    // Legacy design options (print details) -> categorized ink/paper/lamination/finish/setup
    const designOptions = design || {};
    let inkCost = 0;
    let paperCost = 0;
    let laminationCost = 0;
    let finishingCost = 0;
    let setupCost = 0;
    if (config.showDesignOptions) {
      const designArea = (width && height) ? (parseFloat(width) || 0) * (parseFloat(height) || 0) : (config.defaultWidth * config.defaultHeight);
      const inkPerColor = config.priceBreakdown?.inkCost || 2;
      const colorCount = Math.min(Math.max(parseInt(designOptions.colorCount || 1, 10), 1), 8);
      const printCoverage = Math.min(Math.max(parseFloat(designOptions.printCoverage || 100), 1), 100) / 100;
      const printMethod = designOptions.printMethod || 'screen-printing';
      const sizeOption = designOptions.sizeOption || 'standard';

      inkCost = designArea * inkPerColor * (colorCount / 100) * (DESIGN_COST_MULTIPLIERS.printMethod[printMethod] || 1.0) * (DESIGN_COST_MULTIPLIERS.sizeOption[sizeOption] || 1.0) * printCoverage * qty;

      const paperType = designOptions.paperType || 'standard';
      paperCost = (DESIGN_COST_MULTIPLIERS.paperType[paperType] || 0) * qty * 0.05;

      const lamination = designOptions.lamination || 'none';
      laminationCost = (DESIGN_COST_MULTIPLIERS.lamination[lamination] || 0) * qty * 0.1;

      const finish = designOptions.finish || 'none';
      const specialEffect = designOptions.specialEffects || 'none';
      const cutType = designOptions.cutType || 'straight';
      finishingCost = (DESIGN_COST_MULTIPLIERS.specialEffects[specialEffect] || 0) + (DESIGN_COST_MULTIPLIERS.finish[finish] !== undefined ? (DESIGN_COST_MULTIPLIERS.finish[finish] - 1) * 20 : 0) + (DESIGN_COST_MULTIPLIERS.cutType[cutType] || 0);

      const rushOrder = designOptions.rushOrder;
      const proofRequired = designOptions.proofRequired;
      const revisionCount = Math.max(parseInt(designOptions.revisionCount || 0, 10), 0);
      setupCost = (rushOrder ? 100 : 0) + (proofRequired ? 25 : 0) + revisionCount * 15;

      const set = (label, key, amount) => {
        const v = round2(amount);
        if (v !== 0) lineItems.push({ label, key, amount: v });
        return v;
      };
      inkCost = set('Ink cost', 'ink', inkCost);
      paperCost = set('Paper cost', 'paper', paperCost);
      laminationCost = set('Lamination', 'lamination', laminationCost);
      finishingCost = set('Finishing', 'finishing', finishingCost);
      setupCost = set('Setup', 'setup', setupCost);
    }

    const subtotal = round2(basePrice + areaCost + sizeCost + materialCost + optionCost + inkCost + paperCost + laminationCost + finishingCost + setupCost);
    const finalPrice = round2(subtotal + setupFee + shippingFee);
    const perUnitPrice = round2(finalPrice / qty);

    const priceBreakdown = {
      basePrice,
      areaCost,
      sizeCost,
      materialCost,
      optionCost,
      inkCost,
      paperCost,
      laminationCost,
      finishingCost,
      setupCost,
      setupFee,
      shippingFee,
      subtotal,
      finalPrice,
      perUnitPrice,
      currency,
    };

    const bulkPricing = product.bulkPricing && product.bulkPricing.length > 0
      ? product.bulkPricing.map((tier) => ({
          minQty: tier.minQty,
          maxQty: tier.maxQty,
          price: tier.price,
          active: qty >= (tier.minQty || 0) && qty <= (tier.maxQty || Infinity),
        }))
      : [];

    res.status(200).json({
      success: true,
      calculation: {
        product: {
          id: product._id,
          name: product.name,
          basePrice: product.basePrice,
        },
        quantity: qty,
        currency,
        lineItems: lineItems.filter((li) => li.amount !== 0),
        priceBreakdown,
        materials: selectedMaterials.map((m) => ({ key: m })),
        options: optionDetailed,
        selectedSize: chosenSize || (width && height ? { label: `${width}×${height} ${dimUnit}`, width, height } : null),
        bulkPricing,
        deliveryEstimate: {
          minDays: config.deliveryDays || 7,
          maxDays: (config.deliveryDays || 7) + 3,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getCalculatorConfig = async (req, res, next) => {
  try {
    const productId = req.params.productId || req.params.id;

    const product = await Product.findById(productId).select('calculatorConfig name basePrice isActive');
    if (!product || !product.isActive) {
      throw new AppError('Product not found or unavailable', 404);
    }

    if (!product.calculatorConfig || !product.calculatorConfig.enabled) {
      throw new AppError('Calculator is not enabled for this product', 400);
    }

    res.status(200).json({
      success: true,
      config: product.calculatorConfig,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCalculatorConfig = async (req, res, next) => {
  try {
    const productId = req.params.productId || req.params.id;
    const { calculatorConfig } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (req.user.role !== 'admin') {
      throw new AppError('Only admins can update calculator configuration', 403);
    }

    product.calculatorConfig = calculatorConfig;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Calculator configuration updated',
      config: product.calculatorConfig,
    });
  } catch (err) {
    next(err);
  }
};

exports.enableCalculatorForAll = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new AppError('Only admins can enable calculators', 403);
    }

    const products = await Product.find({ isActive: true });

    let updated = 0;
    for (const product of products) {
      const area = product.printAreas && product.printAreas.length > 0 ? product.printAreas[0] : null;
      const defaultWidth = area && area.width ? area.width : 10;
      const defaultHeight = area && area.height ? area.height : 10;

      product.calculatorConfig = {
        enabled: true,
        baseFormula: 'basePrice',
        variables: [],
        priceBreakdown: {
          inkCost: 0,
          paperCost: 0,
          laminationCost: 0,
          finishingCost: 0,
          setupCost: 0,
          shippingCost: 0,
          totalCost: 0,
          margin: 0,
          finalPrice: 0,
        },
        currency: '₹',
        allowCustomDimensions: true,
        defaultWidth,
        defaultHeight,
        dimensionUnit: 'cm',
      };

      await product.save({ validateBeforeSave: false });
      updated += 1;
    }

    res.status(200).json({
      success: true,
      message: `Calculator enabled for ${updated} products`,
      updated,
    });
  } catch (err) {
    next(err);
  }
};