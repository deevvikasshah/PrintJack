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
      tag,
      featured,
      sort = '-createdAt',
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        query.category = cat._id;
      }
    }

    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
    }

    if (color) {
      query['colors.name'] = { $regex: color, $options: 'i' };
    }

    if (size) {
      query['sizes.name'] = { $regex: size, $options: 'i' };
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
        .populate('category', 'name slug image');
    } else {
      product = await Product.findOne({ slug: idOrSlug, isActive: true })
        .populate('category', 'name slug image');
    }

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.status(200).json({ success: true, product });
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
      isFeatured, metaTitle, metaDescription,
    } = req.body;

    const productData = {
      name, description, shortDescription, category, subCategory, brand,
      basePrice, material, printingMethod, minimumOrderQuantity,
      isFeatured, metaTitle, metaDescription,
    };

    if (bulkPricing) productData.bulkPricing = JSON.parse(bulkPricing);
    if (colors) productData.colors = JSON.parse(colors);
    if (sizes) productData.sizes = JSON.parse(sizes);
    if (printAreas) productData.printAreas = JSON.parse(printAreas);
    if (tags) productData.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    if (specifications) productData.specifications = JSON.parse(specifications);
    if (templates) productData.templates = JSON.parse(templates);

    if (req.files && req.files.length > 0) {
      const images = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path, {
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

    const jsonFields = ['bulkPricing', 'colors', 'sizes', 'printAreas', 'tags', 'specifications', 'templates'];
    jsonFields.forEach((field) => {
      if (req.body[field]) {
        product[field] = typeof req.body[field] === 'string' ? JSON.parse(req.body[field]) : req.body[field];
      }
    });

    if (req.files && req.files.length > 0) {
      const images = product.images ? [...product.images] : [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path, {
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
    const { rating, comment } = req.body;
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

    product.reviews.push({
      user: req.user._id,
      rating: parseInt(rating, 10),
      comment,
    });

    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.averageRating = totalRating / product.reviews.length;
    product.totalReviews = product.reviews.length;

    await product.save();

    res.status(201).json({ success: true, message: 'Review added successfully' });
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
