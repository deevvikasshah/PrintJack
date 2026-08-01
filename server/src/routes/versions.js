const router = require("express").Router();
const { protect } = require("../middleware/auth");
const {
  saveVersion,
  getVersions,
  getVersion,
  revertToVersion,
} = require("../controllers/versionsController");

router.post("/:designId/versions", protect, saveVersion);
router.get("/:designId/versions", protect, getVersions);
router.get("/:designId/versions/:versionNumber", protect, getVersion);
router.put("/:designId/versions/:versionNumber/revert", protect, revertToVersion);

module.exports = router;