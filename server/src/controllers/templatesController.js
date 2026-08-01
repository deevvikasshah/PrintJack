const { Template, Product, Design } = require('../models');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { AppError } = require('../middleware/errorHandler');

exports.createTemplate = async (req, res, next) => {
  try {
    const { name, description, category, productId, canvasData, printSpecifications, tags, isPublic, isFeatured } = req.body;

    if (!name || !productId || !canvasData) {
      throw new AppError('Name, product ID, and canvas data are required', 400);
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new AppError('Product not found or unavailable', 404);
    }

    let previewImage = '';
    let thumbnail = '';

    if (req.files && req.files.preview) {
      const result = await uploadToCloudinary(req.files.preview[0].path, {
        folder: 'printjack/templates/previews',
        width: 800,
        quality: 'auto',
      });
      previewImage = result.secure_url;
    }

    if (req.files && req.files.thumbnail) {
      const result = await uploadToCloudinary(req.files.thumbnail[0].path, {
        folder: 'printjack/templates/thumbnails',
        width: 200,
        quality: 'auto',
      });
      thumbnail = result.secure_url;
    }

    const template = await Template.create({
      name,
      description: description || '',
      category: category || 'other',
      product: productId,
      createdBy: req.user._id,
      canvasData,
      previewImage,
      thumbnail,
      printSpecifications: printSpecifications || {},
      tags: tags || [],
      isPublic: isPublic !== false,
      isFeatured: isFeatured || false,
    });

    await Design.updateMany(
      { templateUsed: template._id },
      { $inc: { downloads: 1 } }
    ).catch(() => {});

    res.status(201).json({ success: true, template });
  } catch (err) {
    next(err);
  }
};

exports.getTemplates = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, productId, search, sort = '-createdAt' } = req.query;

    const query = { status: 'active', isPublic: true };

    if (category) query.category = category;
    if (productId) query.product = productId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const templates = await Template.paginate(query, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort,
      populate: [
        { path: 'product', select: 'name slug images' },
        { path: 'createdBy', select: 'name' },
      ],
    });

    res.status(200).json({
      success: true,
      templates: templates.docs,
      pagination: {
        total: templates.totalDocs,
        pages: templates.totalPages,
        page: templates.page,
        limit: templates.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('product', 'name slug images printAreas')
      .populate('createdBy', 'name');

    if (!template || template.status !== 'active') {
      throw new AppError('Template not found', 404);
    }

    template.downloads += 1;
    await template.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, template });
  } catch (err) {
    next(err);
  }
};

exports.updateTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      throw new AppError('Template not found', 404);
    }

    if (template.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new AppError('Not authorized to update this template', 403);
    }

    const { name, description, category, canvasData, printSpecifications, tags, isPublic, isFeatured, status } = req.body;

    if (name) template.name = name;
    if (description !== undefined) template.description = description;
    if (category) template.category = category;
    if (canvasData) template.canvasData = canvasData;
    if (printSpecifications) template.printSpecifications = printSpecifications;
    if (tags) template.tags = tags;
    if (isPublic !== undefined) template.isPublic = isPublic;
    if (isFeatured !== undefined) template.isFeatured = isFeatured;
    if (status) template.status = status;

    await template.save();

    res.status(200).json({ success: true, template });
  } catch (err) {
    next(err);
  }
};

exports.deleteTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      throw new AppError('Template not found', 404);
    }

    if (template.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new AppError('Not authorized to delete this template', 403);
    }

    if (template.previewImage) {
      try {
        const publicId = template.previewImage.split('/').pop().split('.')[0];
        await uploadToCloudinary.delete(publicId);
      } catch (e) {
        console.error('Failed to delete preview from Cloudinary:', e.message);
      }
    }

    if (template.thumbnail) {
      try {
        const publicId = template.thumbnail.split('/').pop().split('.')[0];
        await uploadToCloudinary.delete(publicId);
      } catch (e) {
        console.error('Failed to delete thumbnail from Cloudinary:', e.message);
      }
    }

    await Template.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Template deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getMyTemplates = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const templates = await Template.paginate(
      { createdBy: req.user._id },
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: '-createdAt',
        populate: [{ path: 'product', select: 'name slug' }],
      }
    );

    res.status(200).json({
      success: true,
      templates: templates.docs,
      pagination: {
        total: templates.totalDocs,
        pages: templates.totalPages,
        page: templates.page,
        limit: templates.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};
