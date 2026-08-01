const router = require("express").Router();
const { body } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  getSettings,
  updateSetting,
  bulkUpdateSettings,
} = require("../controllers/settingsController");

router.use(protect, authorize("super_admin"));

router.get("/", getSettings);

router.put(
  "/bulk",
  [
    body("settings").isArray({ min: 1 }).withMessage("Settings must be a non-empty array"),
  ],
  validate,
  bulkUpdateSettings
);

router.put(
  "/:key",
  [
    body("value").exists().withMessage("Value is required"),
  ],
  validate,
  updateSetting
);

module.exports = router;
