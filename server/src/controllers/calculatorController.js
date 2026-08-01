const { Product } = require('../models');
const { AppError } = require('../middleware/errorHandler');

exports.calculatePrice = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { width, height, quantity, variables } = req.body;

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

    const subtotal = product.basePrice + totalInkCost + totalPaperCost + totalLaminationCost + totalFinishingCost + totalSetupCost;
    const totalCost = subtotal + totalShippingCost;
    const margin = config.priceBreakdown?.margin || 0;
    const finalPrice = Math.round((totalCost + margin) * 100) / 100;
    const perUnitPrice = Math.round((finalPrice / Math.max(calcQuantity, 1)) * 100) / 100;

    const priceBreakdown = {
      basePrice: product.basePrice,
      inkCost: totalInkCost,
      paperCost: totalPaperCost,
      laminationCost: totalLaminationCost,
      finishingCost: totalFinishingCost,
      setupCost: totalSetupCost,
      shippingCost: totalShippingCost,
      subtotal,
      margin,
      totalCost,
      finalPrice,
      perUnitPrice,
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