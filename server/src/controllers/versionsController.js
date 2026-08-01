const { Design, User } = require('../models');
const { AppError } = require('../middleware/errorHandler');

exports.saveVersion = async (req, res, next) => {
  try {
    const { designId } = req.params;
    const { canvasData, previewImage, printSpecifications, changeNote } = req.body;

    const design = await Design.findById(designId);
    if (!design) {
      throw new AppError('Design not found', 404);
    }

    if (design.user.toString() !== req.user._id.toString() && !design.collaborators.some(c => c.user.toString() === req.user._id.toString() && c.role !== 'viewer')) {
      throw new AppError('Not authorized to save versions for this design', 403);
    }

    const currentVersion = design.currentVersion || 1;
    const newVersionNumber = currentVersion + 1;

    const versionEntry = {
      versionNumber: newVersionNumber,
      canvasData: canvasData || design.canvasData,
      previewImage: previewImage || design.previewImage,
      printSpecifications: printSpecifications || design.printSpecifications,
      changedBy: req.user._id,
      changeNote: changeNote || '',
    };

    design.versions.push(versionEntry);
    design.currentVersion = newVersionNumber;

    if (canvasData) design.canvasData = canvasData;
    if (previewImage) design.previewImage = previewImage;
    if (printSpecifications) design.printSpecifications = printSpecifications;

    await design.save({ validateBeforeSave: false });

    const user = await User.findById(req.user._id).select('name');

    res.status(201).json({
      success: true,
      version: {
        ...versionEntry,
        user: user,
      },
      currentVersion: newVersionNumber,
    });
  } catch (err) {
    next(err);
  }
};

exports.getVersions = async (req, res, next) => {
  try {
    const { designId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const design = await Design.findById(designId).populate(
      'versions.changedBy',
      'name'
    );
    if (!design) {
      throw new AppError('Design not found', 404);
    }

    if (design.user.toString() !== req.user._id.toString() && !design.collaborators.some(c => c.user.toString() === req.user._id.toString())) {
      throw new AppError('Not authorized to view versions for this design', 403);
    }

    const versions = design.versions.reverse();

    const total = versions.length;
    const start = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const pagedVersions = versions.slice(start, start + parseInt(limit, 10));

    res.status(200).json({
      success: true,
      versions: pagedVersions,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit, 10)),
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      },
      currentVersion: design.currentVersion,
    });
  } catch (err) {
    next(err);
  }
};

exports.getVersion = async (req, res, next) => {
  try {
    const { designId, versionNumber } = req.params;

    const design = await Design.findById(designId);
    if (!design) {
      throw new AppError('Design not found', 404);
    }

    if (design.user.toString() !== req.user._id.toString() && !design.collaborators.some(c => c.user.toString() === req.user._id.toString())) {
      throw new AppError('Not authorized to view versions for this design', 403);
    }

    const version = design.versions.find(
      (v) => v.versionNumber === parseInt(versionNumber, 10)
    );

    if (!version) {
      throw new AppError('Version not found', 404);
    }

    res.status(200).json({
      success: true,
      version,
    });
  } catch (err) {
    next(err);
  }
};

exports.revertToVersion = async (req, res, next) => {
  try {
    const { designId, versionNumber } = req.params;

    const design = await Design.findById(designId);
    if (!design) {
      throw new AppError('Design not found', 404);
    }

    if (design.user.toString() !== req.user._id.toString() && !design.collaborators.some(c => c.user.toString() === req.user._id.toString() && c.role !== 'viewer')) {
      throw new AppError('Not authorized to revert this design', 403);
    }

    const version = design.versions.find(
      (v) => v.versionNumber === parseInt(versionNumber, 10)
    );

    if (!version) {
      throw new AppError('Version not found', 404);
    }

    if (version.canvasData) design.canvasData = version.canvasData;
    if (version.previewImage) design.previewImage = version.previewImage;
    if (version.printSpecifications) design.printSpecifications = version.printSpecifications;

    design.currentVersion = version.versionNumber;

    await design.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `Reverted to version ${versionNumber}`,
      design,
    });
  } catch (err) {
    next(err);
  }
};