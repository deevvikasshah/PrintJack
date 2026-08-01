const router = require("express").Router();
const { protect } = require("../middleware/auth");
const {
  addCollaborator,
  removeCollaborator,
  getCollaborators,
  updateCollaboratorActivity,
  leaveDesign,
} = require("../controllers/collaborationController");

router.post("/:designId/collaborators", protect, addCollaborator);
router.delete("/:designId/collaborators/:userId", protect, removeCollaborator);
router.get("/:designId/collaborators", protect, getCollaborators);
router.put("/:designId/activity", protect, updateCollaboratorActivity);
router.post("/:designId/leave", protect, leaveDesign);

module.exports = router;