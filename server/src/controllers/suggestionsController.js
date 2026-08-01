const { Product } = require('../models');
const { AppError } = require('../middleware/errorHandler');

const productTypeSuggestions = {
  tshirt: {
    layouts: [
      { layout: 'center', placement: 'center', recommendedWidth: 300, recommendedHeight: 300, suggestedElements: ['text', 'logo', 'graphic'], confidence: 0.9, reason: 'Center placement is the most popular for t-shirt front prints' },
      { layout: 'left', placement: 'left', recommendedWidth: 250, recommendedHeight: 250, suggestedElements: ['text', 'small-logo'], confidence: 0.7, reason: 'Left chest placement works well for small logos and text' },
      { layout: 'full-front', placement: 'full-front', recommendedWidth: 400, recommendedHeight: 400, suggestedElements: ['illustration', 'pattern'], confidence: 0.8, reason: 'Full front prints make a bold statement' },
    ],
  },
  mug: {
    layouts: [
      { layout: 'wrap-around', placement: 'center', recommendedWidth: 800, recommendedHeight: 200, suggestedElements: ['photo', 'text', 'graphic'], confidence: 0.95, reason: 'Wrap-around design is ideal for mugs' },
      { layout: 'center', placement: 'center', recommendedWidth: 200, recommendedHeight: 200, suggestedElements: ['text', 'logo'], confidence: 0.8, reason: 'Centered design works for simple mug prints' },
    ],
  },
  poster: {
    layouts: [
      { layout: 'full-front', placement: 'full-front', recommendedWidth: 600, recommendedHeight: 800, suggestedElements: ['illustration', 'text', 'photo'], confidence: 0.9, reason: 'Posters benefit from full-front designs' },
      { layout: 'center', placement: 'center', recommendedWidth: 400, recommendedHeight: 500, suggestedElements: ['text', 'graphic'], confidence: 0.7, reason: 'Centered layout keeps focus on the main content' },
    ],
  },
  hoodie: {
    layouts: [
      { layout: 'center', placement: 'center', recommendedWidth: 350, recommendedHeight: 350, suggestedElements: ['graphic', 'text', 'logo'], confidence: 0.9, reason: 'Center chest is the standard for hoodie prints' },
      { layout: 'back', placement: 'full-back', recommendedWidth: 500, recommendedHeight: 500, suggestedElements: ['illustration', 'text'], confidence: 0.85, reason: 'Back prints are popular for hoodies' },
      { layout: 'sleeve', placement: 'left', recommendedWidth: 100, recommendedHeight: 150, suggestedElements: ['small-logo', 'text'], confidence: 0.6, reason: 'Sleeve prints add a subtle branding touch' },
    ],
  },
  cap: {
    layouts: [
      { layout: 'center', placement: 'center', recommendedWidth: 150, recommendedHeight: 50, suggestedElements: ['text', 'logo', 'embroidery'], confidence: 0.9, reason: 'Center front is the standard for cap prints' },
    ],
  },
  sticker: {
    layouts: [
      { layout: 'center', placement: 'center', recommendedWidth: 200, recommendedHeight: 200, suggestedElements: ['illustration', 'text', 'graphic'], confidence: 0.85, reason: 'Stickers work best with bold, centered designs' },
    ],
  },
  canvas: {
    layouts: [
      { layout: 'full-front', placement: 'full-front', recommendedWidth: 500, recommendedHeight: 500, suggestedElements: ['photo', 'illustration', 'text'], confidence: 0.9, reason: 'Canvas prints look best with full-front artwork' },
    ],
  },
  'phone-case': {
    layouts: [
      { layout: 'center', placement: 'center', recommendedWidth: 200, recommendedHeight: 350, suggestedElements: ['photo', 'illustration', 'text'], confidence: 0.9, reason: 'Center design covers the phone case face' },
      { layout: 'wrap-around', placement: 'center', recommendedWidth: 400, recommendedHeight: 200, suggestedElements: ['pattern', 'graphic'], confidence: 0.75, reason: 'Wrap-around design for a premium look' },
    ],
  },
  'laptop-skin': {
    layouts: [
      { layout: 'full-front', placement: 'full-front', recommendedWidth: 400, recommendedHeight: 300, suggestedElements: ['pattern', 'photo', 'illustration'], confidence: 0.9, reason: 'Full skin design covers the laptop surface' },
    ],
  },
  bag: {
    layouts: [
      { layout: 'center', placement: 'center', recommendedWidth: 300, recommendedHeight: 250, suggestedElements: ['illustration', 'text', 'logo'], confidence: 0.85, reason: 'Center front is the most visible placement for bags' },
    ],
  },
};

exports.getSuggestions = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new AppError('Product not found', 404);
    }

    const productName = product.name.toLowerCase();

    let matchedSuggestions = [];

    for (const [key, config] of Object.entries(productTypeSuggestions)) {
      if (productName.includes(key) || key === productName) {
        matchedSuggestions = config.layouts.map((s) => ({
          ...s,
          productType: key,
        }));
        break;
      }
    }

    if (matchedSuggestions.length === 0) {
      matchedSuggestions = productTypeSuggestions.tshirt.layouts.map((s) => ({
        ...s,
        productType: 'tshirt',
      }));
    }

    const suggestions = matchedSuggestions.map((s) => {
      const { _id, ...rest } = s;
      return rest;
    });

    res.status(200).json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
        category: product.category,
      },
      suggestions,
    });
  } catch (err) {
    next(err);
  }
};

exports.applySuggestion = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { layout, placement, recommendedWidth, recommendedHeight, suggestedElements } = req.body;

    if (!layout) {
      throw new AppError('Layout is required', 400);
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new AppError('Product not found', 404);
    }

    const suggestion = {
      productType: product.name.toLowerCase().includes('tshirt') ? 'tshirt' : 'other',
      layout,
      placement,
      recommendedWidth,
      recommendedHeight,
      suggestedElements: suggestedElements || [],
      confidence: 0.8,
      reason: 'User-applied suggestion',
    };

    res.status(200).json({
      success: true,
      suggestion,
      message: 'Suggestion applied to your design',
    });
  } catch (err) {
    next(err);
  }
};