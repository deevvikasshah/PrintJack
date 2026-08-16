const { uploadToCloudinary, deleteFromCloudinary, uploadPrintFile } = require('../utils/cloudinary');
const { assertValidFile } = require('../middleware/upload');
const { AppError } = require('../middleware/errorHandler');

exports.uploadSingle = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const valid = assertValidFile(req.file);
    if (!valid.ok) throw new AppError(valid.error, 400);

    const { folder = 'printjack/uploads', width, height, quality } = req.query;

    const options = { folder };
    if (width) options.width = parseInt(width, 10);
    if (height) options.height = parseInt(height, 10);
    if (quality) options.quality = quality;

    const result = await uploadToCloudinary(req.file, options);

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

    for (const file of req.files) {
      const valid = assertValidFile(file);
      if (!valid.ok) throw new AppError(`${file.originalname}: ${valid.error}`, 400);
    }

    const { folder = 'printjack/uploads' } = req.query;

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file, { folder })
    );

    const results = await uploadPromises;

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
    const publicId = req.params.publicId || req.body.publicId;

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

/**
 * Upload a print-ready original (PDF, AI, EPS, TIFF, SVG, or raster) for
 * production. Validates size + real file signature, stores the original
 * untouched on Cloudinary, and returns a separate low-res preview URL that the
 * rest of the app serves on pages (never the full-res original).
 */
exports.uploadPrintFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const valid = assertValidFile(req.file);
    if (!valid.ok) throw new AppError(valid.error, 400);

    const result = await uploadPrintFile(req.file.buffer, {
      fileName: req.file.originalname,
      folder: 'printjack/designs/printfiles',
    });

    res.status(201).json({
      success: true,
      file: {
        url: result.url,
        publicId: result.publicId,
        format: result.format,
        resourceType: result.resourceType,
        bytes: result.bytes,
        originalName: req.file.originalname,
        preview: result.previewUrl ? { url: result.previewUrl, publicId: result.publicId } : null,
      },
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

    const valid = assertValidFile(req.file);
    if (!valid.ok) throw new AppError(valid.error, 400);

    const { name, productId, width, height, colorMode } = req.body;
    const ext = valid.ext;

    const result = await uploadPrintFile(req.file.buffer, {
      fileName: req.file.originalname,
      folder: 'printjack/designs/files',
    });

    res.status(200).json({
      success: true,
      file: {
        url: result.url,
        publicId: result.publicId,
        format: result.format,
        bytes: result.bytes,
        originalName: req.file.originalname,
        preview: result.previewUrl ? { url: result.previewUrl, publicId: result.publicId } : null,
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