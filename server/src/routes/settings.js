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
  "/:key",
  [
    body("value").exists().withMessage("Value is required"),
  ],
  validate,
  updateSetting
);

router.put(
  "/bulk",
  [
    body("settings").isObject().withMessage("Settings must be an object"),
  ],
  validate,
  bulkUpdateSettings
);

module.exports = router;
