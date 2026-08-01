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
};

exports.calculatePrice = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { width, height, quantity, variables, design } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new AppError('Product not found or unavailable', 404);
    }

    if (!product.calculatorConfig || !product.calculatorConfig.enabled) {
      throw new AppError('Calculator is not enabled for this product', 400);
    }

    const config = product.calculatorConfig;
    const calcWidth = width || config.defaultWidth;
    const calcHeight = height || config.defaultHeight;
    const calcQuantity = quantity || 1;
    const dimUnit = config.dimensionUnit || 'cm';

    let totalInkCost = 0;
    let totalPaperCost = 0;
    let totalLaminationCost = 0;
    let totalFinishingCost = 0;
    let totalSetupCost = 0;
    let totalShippingCost = 0;

    const variableResults = {};

    if (config.variables && config.variables.length > 0) {
      for (const variable of config.variables) {
        const userValue = variables && variables[variable.name] !== undefined
          ? variables[variable.name]
          : variable.defaultValue;

        let cost = 0;

        switch (variable.type) {
          case 'number':
          case 'range':
            cost = parseFloat(userValue) * (variable.pricePerUnit || 0);
            break;
          case 'select':
            const selectedOption = variable.options && variable.options.find(
              (opt) => opt === userValue
            );
            cost = selectedOption ? (variable.pricePerUnit || 0) : 0;
            break;
          case 'checkbox':
            cost = userValue ? (variable.pricePerUnit || 0) : 0;
            break;
          default:
            cost = 0;
        }

        variableResults[variable.name] = {
          value: userValue,
          cost,
          unit: variable.unit,
          label: variable.label,
        };

        switch (variable.name.toLowerCase()) {
          case 'ink':
          case 'inkcost':
          case 'ink-cost':
            totalInkCost += cost;
            break;
          case 'paper':
          case 'papercost':
          case 'paper-cost':
            totalPaperCost += cost;
            break;
          case 'lamination':
          case 'laminationcost':
          case 'lamination-cost':
            totalLaminationCost += cost;
            break;
          case 'finishing':
          case 'finishingcost':
          case 'finishing-cost':
            totalFinishingCost += cost;
            break;
          case 'setup':
          case 'setupcost':
          case 'setup-cost':
            totalSetupCost += cost;
            break;
          case 'shipping':
          case 'shippingcost':
          case 'shipping-cost':
            totalShippingCost += cost;
            break;
          default:
            break;
        }
      }
    }

    const area = calcWidth * calcHeight;
    const areaCost = area * (config.priceBreakdown?.inkCost || 0);

    totalInkCost += areaCost;

    const designOptions = design || {};
    const designFactors = {};

    const colorCount = parseInt(designOptions.colorCount || designOptions.colors || 1, 10);
    const inkPerColor = config.priceBreakdown?.inkCost > 0
      ? config.priceBreakdown.inkCost
      : (product.calculatorConfig?.priceBreakdown?.inkCost || 2);
    const inkMultiplier = Math.min(Math.max(colorCount, 1), 8);
    const inkCostByColor = area * inkPerColor * (inkMultiplier / 100);
    totalInkCost += inkCostByColor;
    designFactors.colors = { count: colorCount, cost: inkCostByColor };

    const printCoverage = Math.min(Math.max(parseFloat(designOptions.printCoverage || 100), 1), 100) / 100;
    totalInkCost *= printCoverage;

    const printMethod = designOptions.printMethod || 'screen-printing';
    const methodMultiplier = DESIGN_COST_MULTIPLIERS.printMethod[printMethod] || 1.0;
    designFactors.printMethod = { name: printMethod, multiplier: methodMultiplier };

    const printSide = designOptions.printSide || 'front';
    const sideMultiplier = printSide === 'both' ? 1.8 : printSide === 'back' ? 0.9 : 1.0;
    designFactors.printSide = { name: printSide, multiplier: sideMultiplier };

    const finish = designOptions.finish || 'none';
    const finishMultiplier = DESIGN_COST_MULTIPLIERS.finish[finish] || 1.0;
    designFactors.finish = { name: finish, multiplier: finishMultiplier };

    const lamination = designOptions.lamination || 'none';
    const laminationCost = DESIGN_COST_MULTIPLIERS.lamination[lamination] || 0;
    totalLaminationCost += laminationCost * Math.max(calcQuantity, 1) * 0.1;
    designFactors.lamination = { name: lamination, cost: laminationCost };

    const specialEffect = designOptions.specialEffects || 'none';
    const effectCost = DESIGN_COST_MULTIPLIERS.specialEffects[specialEffect] || 0;
    totalFinishingCost += effectCost;
    designFactors.specialEffects = { name: specialEffect, cost: effectCost };

    const designComplexity = designOptions.complexity || 'standard';
    const complexityMultiplier = designComplexity === 'simple' ? 0.8 : designComplexity === 'complex' ? 1.5 : 1.0;
    designFactors.complexity = { name: designComplexity, multiplier: complexityMultiplier };

    const designMultiplier = methodMultiplier * finishMultiplier * sideMultiplier * complexityMultiplier;
    totalInkCost *= designMultiplier;
    totalSetupCost += methodMultiplier * 20;

    const subtotal = product.basePrice + totalInkCost + totalPaperCost + totalLaminationCost + totalFinishingCost + totalSetupCost;
    const totalCost = subtotal + totalShippingCost;
    const margin = config.priceBreakdown?.margin || 0;
    const finalPrice = Math.round((totalCost + margin) * 100) / 100;
    const perUnitPrice = Math.round((finalPrice / Math.max(calcQuantity, 1)) * 100) / 100;

    const priceBreakdown = {
      basePrice: product.basePrice,
      inkCost: Math.round(totalInkCost * 100) / 100,
      paperCost: Math.round(totalPaperCost * 100) / 100,
      laminationCost: Math.round(totalLaminationCost * 100) / 100,
      finishingCost: Math.round(totalFinishingCost * 100) / 100,
      setupCost: Math.round(totalSetupCost * 100) / 100,
      shippingCost: Math.round(totalShippingCost * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      margin,
      totalCost: Math.round(totalCost * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
      perUnitPrice: Math.round(perUnitPrice * 100) / 100,
      currency: config.currency || '₹',
    };

    const result = {
      product: {
        id: product._id,
        name: product.name,
        basePrice: product.basePrice,
      },
      dimensions: {
        width: calcWidth,
        height: calcHeight,
        area,
        unit: dimUnit,
      },
      quantity: calcQuantity,
      variables: variableResults,
      designFactors,
      priceBreakdown,
      bulkPricing: product.bulkPricing && product.bulkPricing.length > 0
        ? product.bulkPricing.map((tier) => ({
            minQty: tier.minQty,
            maxQty: tier.maxQty,
            price: Math.round(((finalPrice * calcQuantity) / Math.max(tier.minQty, 1)) * 100) / 100,
          })).filter((tier) => calcQuantity >= tier.minQty)
        : [],
    };

    res.status(200).json({ success: true, calculation: result });
  } catch (err) {
    next(err);
  }
};

exports.getCalculatorConfig = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).select('calculatorConfig name basePrice');
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
    const { productId } = req.params;
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