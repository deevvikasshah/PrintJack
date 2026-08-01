const { Design, Product, Notification } = require('../models');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const { AppError } = require('../middleware/errorHandler');

exports.saveDesign = async (req, res, next) => {
  try {
    const { productId, name, canvasData, canvasJSON, previewImage, printSpecifications, isDraft } = req.body;

    if (!productId) {
      throw new AppError('Product ID is required', 400);
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new AppError('Product not found or unavailable', 404);
    }

    let savedPreview = '';
    if (previewImage) {
      try {
        const result = await uploadToCloudinary(previewImage, {
          folder: 'printjack/designs/previews',
          width: 1200,
          quality: 'auto',
        });
        savedPreview = result.secure_url;
      } catch (e) {
        console.error('Cloudinary upload failed, using data URL:', e.message);
        savedPreview = previewImage;
      }
    }

    const designName = name || `Design - ${product.name} ${new Date().toLocaleDateString()}`;
    const designCanvasData = canvasJSON || canvasData || null;
    const status = isDraft === false ? 'saved' : 'draft';

    const design = await Design.create({
      user: req.user._id,
      product: productId,
      name: designName,
      canvasData: designCanvasData,
      previewImage: savedPreview,
      printSpecifications: printSpecifications || {},
      status,
    });

    res.status(201).json({ success: true, design });
  } catch (err) {
    next(err);
  }
};

exports.getMyDesigns = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const designs = await Design.paginate(query, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: '-createdAt',
      populate: [
        { path: 'product', select: 'name slug images' },
      ],
    });

    res.status(200).json({
      success: true,
      designs: designs.docs,
      pagination: {
        total: designs.totalDocs,
        pages: designs.totalPages,
        page: designs.page,
        limit: designs.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getDesign = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id)
      .populate('product', 'name slug images printAreas templates')
      .populate('user', 'name email');

    if (!design) {
      throw new AppError('Design not found', 404);
    }

    if (req.user.role === 'customer' && design.user._id.toString() !== req.user._id.toString()) {
      throw new AppError('Not authorized to view this design', 403);
    }

    res.status(200).json({ success: true, design });
  } catch (err) {
    next(err);
  }
};

exports.updateDesign = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) {
      throw new AppError('Design not found', 404);
    }

    if (design.user.toString() !== req.user._id.toString()) {
      throw new AppError('Not authorized to update this design', 403);
    }

    if (design.status === 'approved') {
      throw new AppError('Cannot modify an approved design', 400);
    }

    const { name, canvasData, canvasJSON, previewImage, printSpecifications } = req.body;

    if (name) design.name = name;
    if (canvasJSON || canvasData) design.canvasData = canvasJSON || canvasData;
    if (printSpecifications) design.printSpecifications = printSpecifications;

    if (previewImage) {
      if (design.previewImage) {
        try {
          const publicId = design.previewImage.split('/').pop().split('.')[0];
          await deleteFromCloudinary(publicId);
        } catch (e) {
          console.error('Failed to delete old preview:', e.message);
        }
      }
      const result = await uploadToCloudinary(previewImage, {
        folder: 'printjack/designs/previews',
        width: 1200,
        quality: 'auto',
      });
      design.previewImage = result.secure_url;
    }

    design.status = 'saved';
    await design.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, design });
  } catch (err) {
    next(err);
  }
};

exports.deleteDesign = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) {
      throw new AppError('Design not found', 404);
    }

    if (design.user.toString() !== req.user._id.toString()) {
      throw new AppError('Not authorized to delete this design', 403);
    }

    if (design.previewImage) {
      try {
        const publicId = design.previewImage.split('/').pop().split('.')[0];
        await deleteFromCloudinary(publicId);
      } catch (e) {
        console.error('Failed to delete preview from Cloudinary:', e.message);
      }
    }

    if (design.printFile) {
      try {
        const publicId = design.printFile.split('/').pop().split('.')[0];
        await deleteFromCloudinary(publicId);
      } catch (e) {
        console.error('Failed to delete print file from Cloudinary:', e.message);
      }
    }

    await Design.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Design deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.duplicateDesign = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) {
      throw new AppError('Design not found', 404);
    }

    if (design.user.toString() !== req.user._id.toString()) {
      throw new AppError('Not authorized to duplicate this design', 403);
    }

    const copy = await Design.create({
      user: req.user._id,
      product: design.product,
      name: `${design.name} (Copy)`,
      canvasData: design.canvasData,
      previewImage: design.previewImage,
      printSpecifications: design.printSpecifications || {},
      status: 'draft',
    });

    res.status(201).json({ success: true, design: copy });
  } catch (err) {
    next(err);
  }
};

exports.submitForPrint = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) {
      throw new AppError('Design not found', 404);
    }

    if (design.user.toString() !== req.user._id.toString()) {
      throw new AppError('Not authorized to submit this design', 403);
    }

    if (!['draft', 'saved', 'rejected'].includes(design.status)) {
      throw new AppError(`Cannot submit a design with status "${design.status}"`, 400);
    }

    if (!design.previewImage && !design.canvasData) {
      throw new AppError('Design must have preview image or canvas data before submission', 400);
    }

    design.status = 'submitted';
    await design.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'Design submitted for review', design });
  } catch (err) {
    next(err);
  }
};

exports.getPendingApprovals = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status === 'pending' ? 'submitted' : status;
    } else if (!status) {
      query.status = 'submitted';
    }

    const designs = await Design.paginate(
      query,
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: 'createdAt',
        populate: [
          { path: 'product', select: 'name slug' },
          { path: 'user', select: 'name email' },
        ],
      }
    );

    res.status(200).json({
      success: true,
      designs: designs.docs,
      pagination: {
        total: designs.totalDocs,
        pages: designs.totalPages,
        page: designs.page,
        limit: designs.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.approveDesign = async (req, res, next) => {
  try {
    const { status, adminNotes, printFile } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      throw new AppError('Status must be "approved" or "rejected"', 400);
    }

    const design = await Design.findById(req.params.id);
    if (!design) {
      throw new AppError('Design not found', 404);
    }

    if (design.status !== 'submitted') {
      throw new AppError('Only submitted designs can be approved or rejected', 400);
    }

    design.status = status;
    if (adminNotes) design.adminNotes = adminNotes;

    if (status === 'approved') {
      if (printFile) {
        const result = await uploadToCloudinary(printFile, {
          folder: 'printjack/designs/printfiles',
          quality: 'highest',
        });
        design.printFile = result.secure_url;
      }
    }

    await design.save({ validateBeforeSave: false });

    await Notification.create({
      user: design.user,
      type: 'design_update',
      title: status === 'approved' ? 'Design Approved' : 'Design Rejected',
      message: status === 'approved'
        ? `Your design "${design.name}" has been approved and is ready for printing.`
        : `Your design "${design.name}" has been rejected. ${adminNotes || 'Please review the admin notes.'}`,
      data: { designId: design._id, designName: design.name, status },
    });

    res.status(200).json({
      success: true,
      message: `Design ${status} successfully`,
      design,
    });
  } catch (err) {
    next(err);
  }
};

exports.exportDesign = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) {
      throw new AppError('Design not found', 404);
    }

    if (design.user.toString() !== req.user._id.toString() && req.user.role === 'customer') {
      throw new AppError('Not authorized to export this design', 403);
    }

    if (!design.previewImage && !design.canvasData) {
      throw new AppError('No design data available for export', 400);
    }

    const exportData = {
      designId: design._id,
      name: design.name,
      previewImage: design.previewImage,
      printFile: design.printFile,
      printSpecifications: design.printSpecifications,
      canvasData: design.canvasData,
    };

    res.status(200).json({
      success: true,
      export: exportData,
    });
  } catch (err) {
    next(err);
  }
};

exports.batchApprove = async (req, res, next) => {
  try {
    const { designIds, adminNotes, printFile } = req.body;

    if (!designIds || !Array.isArray(designIds) || designIds.length === 0) {
      throw new AppError('designIds array is required', 400);
    }

    const results = await Promise.allSettled(
      designIds.map(async (designId) => {
        const design = await Design.findById(designId);
        if (!design) {
          throw new AppError(`Design ${designId} not found`, 404);
        }

        if (design.status !== 'submitted') {
          throw new AppError(`Design ${designId} is not in submitted status`, 400);
        }

        design.status = 'approved';
        if (adminNotes) design.adminNotes = adminNotes;

        if (printFile) {
          const result = await uploadToCloudinary(printFile, {
            folder: 'printjack/designs/printfiles',
            quality: 'highest',
          });
          design.printFile = result.secure_url;
        }

        await design.save({ validateBeforeSave: false });

        await Notification.create({
          user: design.user,
          type: 'design_update',
          title: 'Design Approved',
          message: `Your design "${design.name}" has been approved and is ready for printing.`,
          data: { designId: design._id, designName: design.name, status: 'approved' },
        });

        return design;
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
    const failed = results
      .filter((r) => r.status === 'rejected')
      .map((r) => ({ error: r.reason?.message || 'Unknown error' }));

    res.status(200).json({
      success: true,
      message: `${successful.length} design(s) approved, ${failed.length} failed`,
      approved: successful,
      failed,
    });
  } catch (err) {
    next(err);
  }
};
