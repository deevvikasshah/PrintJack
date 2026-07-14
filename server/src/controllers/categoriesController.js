const { Category, Product } = require('../models');
const { AppError } = require('../middleware/errorHandler');

const buildTree = (categories, parentId = null) => {
  return categories
    .filter((c) => {
      const pId = c.parentCategory ? c.parentCategory.toString() : null;
      return pId === (parentId ? parentId.toString() : null);
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({
      ...c.toObject(),
      children: buildTree(categories, c._id),
    }));
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('sortOrder');
    const tree = buildTree(categories);

    res.status(200).json({ success: true, categories: tree });
  } catch (err) {
    next(err);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug, isActive: true })
      .populate('subcategories');

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const subcategories = await Category.find({
      parentCategory: category._id,
      isActive: true,
    }).sort('sortOrder');

    res.status(200).json({ success: true, category, subcategories });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, parentCategory, sortOrder, metaTitle, metaDescription } = req.body;

    if (req.file) {
      const { uploadToCloudinary } = require('../utils/cloudinary');
      const result = await uploadToCloudinary(req.file.path, {
        folder: 'printjack/categories',
        width: 500,
        height: 500,
        crop: 'fill',
      });
      req.body.image = result.secure_url;
    }

    const category = await Category.create({
      name,
      description,
      parentCategory: parentCategory || null,
      image: req.body.image || '',
      sortOrder: sortOrder || 0,
      metaTitle,
      metaDescription,
    });

    res.status(201).json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const allowedFields = ['name', 'description', 'parentCategory', 'isActive', 'sortOrder', 'metaTitle', 'metaDescription'];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        category[field] = req.body[field];
      }
    });

    if (req.file) {
      const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
      if (category.image) {
        try {
          const publicId = category.image.split('/').pop().split('.')[0];
          await deleteFromCloudinary(publicId);
        } catch (e) {
          console.error('Failed to delete old image:', e.message);
        }
      }
      const result = await uploadToCloudinary(req.file.path, {
        folder: 'printjack/categories',
        width: 500,
        height: 500,
        crop: 'fill',
      });
      category.image = result.secure_url;
    }

    await category.save();

    res.status(200).json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const productCount = await Product.countDocuments({ category: category._id, isActive: true });
    if (productCount > 0) {
      throw new AppError(`Cannot delete category. ${productCount} active product(s) still use this category.`, 400);
    }

    const subcategoryCount = await Category.countDocuments({ parentCategory: category._id, isActive: true });
    if (subcategoryCount > 0) {
      throw new AppError(`Cannot delete category. ${subcategoryCount} subcategory(ies) still exist under this category.`, 400);
    }

    category.isActive = false;
    await category.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getCategoryTree = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('sortOrder');
    const tree = buildTree(categories);

    const flatten = (items, depth = 0) => {
      return items.reduce((acc, item) => {
        acc.push({
          _id: item._id,
          name: item.name,
          slug: item.slug,
          image: item.image,
          depth,
        });
        if (item.children && item.children.length > 0) {
          acc = acc.concat(flatten(item.children, depth + 1));
        }
        return acc;
      }, []);
    };

    const flatTree = flatten(tree);

    res.status(200).json({ success: true, categories: flatTree });
  } catch (err) {
    next(err);
  }
};
