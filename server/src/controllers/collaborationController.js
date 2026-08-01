const { Design, User } = require('../models');
const { AppError } = require('../middleware/errorHandler');

exports.addCollaborator = async (req, res, next) => {
  try {
    const { designId } = req.params;
    const { userId, role } = req.body;

    const design = await Design.findById(designId);
    if (!design) {
      throw new AppError('Design not found', 404);
    }

    if (design.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new AppError('Not authorized to add collaborators', 403);
    }

    const existingIndex = design.collaborators.findIndex(
      (c) => c.user.toString() === userId
    );

    if (existingIndex !== -1) {
      design.collaborators[existingIndex].role = role || design.collaborators[existingIndex].role;
      design.collaborators[existingIndex].isActive = true;
      design.collaborators[existingIndex].lastActive = new Date();
    } else {
      design.collaborators.push({
        user: userId,
        role: role || 'editor',
        joinedAt: new Date(),
        lastActive: new Date(),
        isActive: true,
      });
    }

    await design.save({ validateBeforeSave: false });

    const collaborator = await User.findById(userId).select('name email');

    res.status(200).json({
      success: true,
      message: 'Collaborator added',
      collaborator,
      collaborators: design.collaborators,
    });
  } catch (err) {
    next(err);
  }
};

exports.removeCollaborator = async (req, res, next) => {
  try {
    const { designId, userId } = req.params;

    const design = await Design.findById(designId);
    if (!design) {
      throw new AppError('Design not found', 404);
    }

    if (design.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new AppError('Not authorized to remove collaborators', 403);
    }

    design.collaborators = design.collaborators.filter(
      (c) => c.user.toString() !== userId
    );

    await design.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Collaborator removed',
      collaborators: design.collaborators,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCollaborators = async (req, res, next) => {
  try {
    const { designId } = req.params;

    const design = await Design.findById(designId).populate(
      'collaborators.user',
      'name email'
    );
    if (!design) {
      throw new AppError('Design not found', 404);
    }

    if (design.user.toString() !== req.user._id.toString() && !design.collaborators.some(c => c.user.toString() === req.user._id.toString())) {
      throw new AppError('Not authorized to view collaborators', 403);
    }

    const activeCollaborators = design.collaborators.filter(c => c.isActive);

    res.status(200).json({
      success: true,
      collaborators: activeCollaborators,
      owner: design.user,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCollaboratorActivity = async (req, res, next) => {
  try {
    const { designId } = req.params;

    const design = await Design.findById(designId);
    if (!design) {
      throw new AppError('Design not found', 404);
    }

    const collab = design.collaborators.find(
      (c) => c.user.toString() === req.user._id.toString()
    );

    if (collab) {
      collab.lastActive = new Date();
      collab.isActive = true;
      await design.save({ validateBeforeSave: false });
    }

    res.status(200).json({ success: true, message: 'Activity updated' });
  } catch (err) {
    next(err);
  }
};

exports.leaveDesign = async (req, res, next) => {
  try {
    const { designId } = req.params;

    const design = await Design.findById(designId);
    if (!design) {
      throw new AppError('Design not found', 404);
    }

    design.collaborators = design.collaborators.filter(
      (c) => c.user.toString() !== req.user._id.toString()
    );

    await design.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Left the design collaboration',
      collaborators: design.collaborators,
    });
  } catch (err) {
    next(err);
  }
};