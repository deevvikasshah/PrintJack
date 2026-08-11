const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { subscribe } = require("../controllers/newsletterController");

router.post(
  "/subscribe",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please provide a valid email"),
  ],
  validate,
  subscribe
);

module.exports = router;
