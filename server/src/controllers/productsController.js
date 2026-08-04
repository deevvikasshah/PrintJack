const { Product, Category } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      category,
      minPrice,
      maxPrice,
      color,
      size,
      material,
      rating,
      tag,
      featured,
      sort: sortParam = 'newest',
    } = req.query;

    const sortMap = {
      'newest': '-createdAt',
      'price-low': 'basePrice',
      'price-high': '-basePrice',
      'bestselling': '-totalSold',
      'rating': '-averageRating',
    };
    const sort = sortMap[sortParam] || '-createdAt';

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (category) {
      const slugs = typeof category === 'string' ? category.split(',') : category;
      const cats = await Category.find({ slug: { $in: slugs } });
      if (cats.length > 0) {
        query.category = { $in: cats.map((c) => c._id) };
      }
    }

    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
    }

    if (color) {
      const values = typeof color === 'string' ? color.split(',') : color;
      query['colors.name'] = { $in: values.map((v) => new RegExp(v, 'i')) };
    }

    if (size) {
      const values = typeof size === 'string' ? size.split(',') : size;
      query['sizes.name'] = { $in: values.map((v) => new RegExp(v, 'i')) };
    }

    if (material) {
      const values = typeof material === 'string' ? material.split(',') : material;
      query.material = { $in: values.map((v) => new RegExp(v, 'i')) };
    }

    if (rating) {
      query.averageRating = { $gte: parseFloat(rating) };
    }

    if (tag) {
      query.tags = { $in: [new RegExp(tag, 'i')] };
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    const products = await Product.paginate(query, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort,
      populate: [{ path: 'category', select: 'name slug' }],
    });

    res.status(200).json({
      success: true,
      products: products.docs,
      pagination: {
        total: products.totalDocs,
        pages: products.totalPages,
        page: products.page,
        limit: products.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    let product;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(idOrSlug)
        .populate('category', 'name slug image')
        .populate('reviews.user', 'name avatar');
    } else {
      product = await Product.findOne({ slug: idOrSlug, isActive: true })
        .populate('category', 'name slug image')
        .populate('reviews.user', 'name avatar');
    }

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

exports.markReviewHelpful = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    const alreadyVoted = review.helpful.users.some(
      (u) => u.toString() === req.user._id.toString()
    );

    if (alreadyVoted) {
      review.helpful.users = review.helpful.users.filter(
        (u) => u.toString() !== req.user._id.toString()
      );
      review.helpful.count = Math.max(0, review.helpful.count - 1);
      await product.save({ validateBeforeSave: false });
      return res.status(200).json({ success: true, helpful: review.helpful.count, voted: false });
    }

    review.helpful.users.push(req.user._id);
    review.helpful.count = (review.helpful.count || 0) + 1;
    await product.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, helpful: review.helpful.count, voted: true });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const {
      name, description, shortDescription, category, subCategory, brand,
      basePrice, bulkPricing, colors, sizes, material, printingMethod,
      printAreas, tags, specifications, templates, minimumOrderQuantity,
      isFeatured, metaTitle, metaDescription, calculatorConfig,
    } = req.body;

    const productData = {
      name, description, shortDescription, category, subCategory, brand,
      basePrice, material, printingMethod, minimumOrderQuantity,
      isFeatured, metaTitle, metaDescription,
    };

    if (calculatorConfig) productData.calculatorConfig = typeof calculatorConfig === 'string' ? JSON.parse(calculatorConfig) : calculatorConfig;

    if (bulkPricing) productData.bulkPricing = typeof bulkPricing === 'string' ? JSON.parse(bulkPricing) : bulkPricing;
    if (colors) productData.colors = typeof colors === 'string' ? JSON.parse(colors) : colors;
    if (sizes) productData.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    if (printAreas) productData.printAreas = typeof printAreas === 'string' ? JSON.parse(printAreas) : printAreas;
    if (tags) productData.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    if (specifications) productData.specifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
    if (templates) productData.templates = typeof templates === 'string' ? JSON.parse(templates) : templates;

    if (req.files && req.files.length > 0) {
      const images = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file, {
          folder: 'printjack/products',
          width: 1000,
          height: 1000,
          crop: 'limit',
        });
        images.push({ url: result.secure_url, alt: name });
      }
      productData.images = images;
    }

    const product = await Product.create(productData);

    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const allowedFields = [
      'name', 'description', 'shortDescription', 'category', 'subCategory',
      'brand', 'basePrice', 'material', 'printingMethod', 'minimumOrderQuantity',
      'isFeatured', 'isActive', 'metaTitle', 'metaDescription',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

const jsonFields = ['bulkPricing', 'colors', 'sizes', 'printAreas', 'tags', 'specifications', 'templates', 'images', 'calculatorConfig'];
    jsonFields.forEach((field) => {
      if (req.body[field]) {
        product[field] = typeof req.body[field] === 'string' ? JSON.parse(req.body[field]) : req.body[field];
      }
    });

    if (req.files && req.files.length > 0) {
      const images = product.images ? [...product.images] : [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file, {
          folder: 'printjack/products',
          width: 1000,
          height: 1000,
          crop: 'limit',
        });
        images.push({ url: result.secure_url, alt: product.name });
      }
      product.images = images;
    }

    await product.save();

    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    product.isActive = false;
    await product.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'Product deactivated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .sort('-createdAt')
      .limit(parseInt(limit, 10));

    res.status(200).json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12, sort = '-createdAt' } = req.query;

    const category = await Category.findOne({ slug });
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const products = await Product.paginate(
      { category: category._id, isActive: true },
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort,
        populate: [{ path: 'category', select: 'name slug' }],
      }
    );

    res.status(200).json({
      success: true,
      category,
      products: products.docs,
      pagination: {
        total: products.totalDocs,
        pages: products.totalPages,
        page: products.page,
        limit: products.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getRelatedProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const related = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true,
    })
      .populate('category', 'name slug')
      .limit(parseInt(limit, 10));

    res.status(200).json({ success: true, products: related });
  } catch (err) {
    next(err);
  }
};

exports.addProductReview = async (req, res, next) => {
  try {
    const { rating, comment, title, photos } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (!product.reviews) {
      product.reviews = [];
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      throw new AppError('You have already reviewed this product', 400);
    }

    let verifiedPurchase = false;
    try {
      const { Order } = require('../models');
      const paidOrder = await Order.findOne({
        user: req.user._id,
        paymentStatus: 'captured',
        'items.product': req.params.id,
      }).select('_id');
      verifiedPurchase = !!paidOrder;
    } catch (e) {
      // ignore verification errors
    }

    const reviewPhotos = Array.isArray(photos)
      ? photos.filter((p) => typeof p === 'string' && p.startsWith('data:image'))
      : [];

    const review = {
      user: req.user._id,
      rating: parseInt(rating, 10),
      title: title || '',
      comment,
      photos: reviewPhotos,
      verifiedPurchase,
    };

    product.reviews.push(review);

    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.averageRating = totalRating / product.reviews.length;
    product.totalReviews = product.reviews.length;

    await product.save();

    const savedReview = product.reviews[product.reviews.length - 1];
    await savedReview.populate('user', 'name avatar');

    const { notifyAdmins } = require('../utils/notifyAdmins');
    await notifyAdmins({
      type: 'system',
      title: `New Review: ${product.name}`,
      message: `${req.user.name || req.user.email} left a ${review.rating}-star review on "${product.name}".`,
      data: { productId: product._id, productName: product.name, action: 'view' },
    });

    res.status(201).json({ success: true, message: 'Review added successfully', review: savedReview });
  } catch (err) {
    next(err);
  }
};

exports.getTemplates = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).select('templates printAreas name');

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.status(200).json({
      success: true,
      templates: product.templates || [],
      printAreas: product.printAreas || [],
      productName: product.name,
    });
  } catch (err) {
    next(err);
  }
};
