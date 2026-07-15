const router = require("express").Router();
const { body, param } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist,
  getNotifications,
  markNotificationRead,
  getLoyaltyPoints,
} = require("../controllers/usersController");

router.get("/", protect, authorize("admin"), getAllUsers);

router.get("/:id", protect, authorize("admin"), getUser);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("role").optional().isIn(["user", "admin", "super_admin"]).withMessage("Invalid role"),
  ],
  validate,
  updateUser
);

router.delete("/:id", protect, authorize("admin"), deleteUser);

router.put(
  "/profile/update",
  protect,
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("phone").optional().trim().notEmpty().withMessage("Phone cannot be empty"),
  ],
  validate,
  updateProfile
);

router.get("/addresses", protect, getAddresses);

router.post(
  "/address",
  protect,
  [
    body("label").trim().notEmpty().withMessage("Address label is required"),
    body("street").trim().notEmpty().withMessage("Street address is required"),
    body("city").trim().notEmpty().withMessage("City is required"),
    body("state").trim().notEmpty().withMessage("State is required"),
    body("pincode").trim().notEmpty().withMessage("Pincode is required"),
    body("country").trim().notEmpty().withMessage("Country is required"),
  ],
  validate,
  addAddress
);

router.put(
  "/address/:addressId",
  protect,
  [
    body("label").optional().trim().notEmpty().withMessage("Label cannot be empty"),
    body("street").optional().trim().notEmpty().withMessage("Street cannot be empty"),
    body("city").optional().trim().notEmpty().withMessage("City cannot be empty"),
    body("state").optional().trim().notEmpty().withMessage("State cannot be empty"),
    body("pincode").optional().trim().notEmpty().withMessage("Pincode cannot be empty"),
    body("country").optional().trim().notEmpty().withMessage("Country cannot be empty"),
  ],
  validate,
  updateAddress
);

router.delete("/address/:addressId", protect, deleteAddress);

router.get("/wishlist", protect, getWishlist);

router.post("/wishlist/:productId", protect, toggleWishlist);

router.get("/notifications", protect, getNotifications);

router.put("/notifications/:id/read", protect, markNotificationRead);

router.get("/loyalty", protect, getLoyaltyPoints);

module.exports = router;
