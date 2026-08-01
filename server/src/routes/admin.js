const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productsController");

const {
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
} = require("../controllers/ordersController");

const {
  getAllUsers,
  updateUser,
  deleteUser,
  sendUserMessage,
} = require("../controllers/usersController");

const {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponsController");

const {
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/blogController");

const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoriesController");

const {
  getPendingApprovals,
  approveDesign,
  exportDesign,
} = require("../controllers/designsController");

// Apply auth middleware to all admin routes
router.use(protect, authorize("admin", "super_admin"));

// Products
router.get("/products", getAllProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);
router.get("/orders/stats", getOrderStats);

// Users
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.post("/users/:id/message", sendUserMessage);

// Coupons
router.get("/coupons", getAllCoupons);
router.post("/coupons", createCoupon);
router.put("/coupons/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);

// Blog
router.get("/blog", getAllPosts);
router.post("/blog", createPost);
router.put("/blog/:id", updatePost);
router.delete("/blog/:id", deletePost);

// Categories
router.get("/categories", getAllCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// Designs
router.get("/designs", getPendingApprovals);
router.put("/designs/:id/approve", (req, res, next) => {
  req.body.status = "approved";
  if (req.body.notes && !req.body.adminNotes) req.body.adminNotes = req.body.notes;
  return approveDesign(req, res, next);
});
router.put("/designs/:id/reject", (req, res, next) => {
  req.body.status = "rejected";
  if (req.body.reason && !req.body.adminNotes) req.body.adminNotes = req.body.reason;
  if (req.body.notes && !req.body.adminNotes) req.body.adminNotes = req.body.notes;
  return approveDesign(req, res, next);
});
router.get("/designs/:id/export", exportDesign);
router.post("/designs/batch-approve", async (req, res, next) => {
  try {
    const { designIds } = req.body;
    if (!designIds || !Array.isArray(designIds) || designIds.length === 0) {
      return res.status(400).json({ success: false, message: "designIds array is required" });
    }

    const { Design, Notification } = require("../models");
    const { uploadToCloudinary } = require("../utils/cloudinary");

    const results = await Promise.allSettled(
      designIds.map(async (designId) => {
        const design = await Design.findById(designId);
        if (!design || design.status !== "submitted") {
          throw new Error(`Design ${designId} not found or not in submitted status`);
        }

        design.status = "approved";
        if (req.body.adminNotes) design.adminNotes = req.body.adminNotes;

        if (req.body.printFile) {
          const result = await uploadToCloudinary(req.body.printFile, {
            folder: "printjack/designs/printfiles",
            quality: "highest",
          });
          design.printFile = result.secure_url;
        }

        await design.save({ validateBeforeSave: false });

        await Notification.create({
          user: design.user,
          type: "design_update",
          title: "Design Approved",
          message: `Your design "${design.name}" has been approved and is ready for printing.`,
          data: { designId: design._id, designName: design.name, status: "approved" },
        });

        return design;
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
    const failed = results.filter((r) => r.status === "rejected").map((r) => ({ id: r.reason }));

    res.status(200).json({
      success: true,
      message: `${successful.length} design(s) approved, ${failed.length} failed`,
      approved: successful,
      failed,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;