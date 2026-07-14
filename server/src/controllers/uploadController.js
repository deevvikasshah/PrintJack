const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const { AppError } = require('../middleware/errorHandler');

exports.uploadSingle = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const { folder = 'printjack/uploads', width, height, quality } = req.query;

    const options = { folder };
    if (width) options.width = parseInt(width, 10);
    if (height) options.height = parseInt(height, 10);
    if (quality) options.quality = quality;

    const result = await uploadToCloudinary(req.file.path, options);

    res.status(200).json({
      success: true,
      file: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }

    const { folder = 'printjack/uploads' } = req.query;

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.path, { folder })
    );

    const results = await Promise.all(uploadPromises);

    const files = results.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    }));

    res.status(200).json({ success: true, files });
  } catch (err) {
    next(err);
  }
};

exports.deleteUpload = async (req, res, next) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      throw new AppError('Public ID is required', 400);
    }

    const result = await deleteFromCloudinary(publicId);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      result,
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadDesignFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No design file uploaded', 400);
    }

    const allowedTypes = ['application/pdf', 'image/vnd.adobe.photoshop', 'application/postscript', 'application/illustrator', 'image/png', 'image/jpeg', 'image/svg+xml'];
    const allowedExtensions = ['.pdf', '.ai', '.psd', '.png', '.jpg', '.jpeg', '.svg'];
    const ext = require('path').extname(req.file.originalname).toLowerCase();

    if (!allowedTypes.includes(req.file.mimetype) && !allowedExtensions.includes(ext)) {
      throw new AppError('Unsupported file type. Allowed: PDF, AI, PSD, PNG, JPG, SVG', 400);
    }

    const { name, productId, width, height, colorMode } = req.body;

    const result = await uploadToCloudinary(req.file.path, {
      folder: 'printjack/designs/files',
      resource_type: 'auto',
      format: ext.replace('.', '') || undefined,
    });

    res.status(200).json({
      success: true,
      file: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
        originalName: req.file.originalname,
        metadata: {
          name: name || req.file.originalname,
          productId: productId || null,
          width: width ? parseInt(width, 10) : null,
          height: height ? parseInt(height, 10) : null,
          colorMode: colorMode || 'CMYK',
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
