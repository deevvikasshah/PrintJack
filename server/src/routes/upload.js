const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const {
  uploadSingle,
  uploadMultiple,
  deleteUpload,
  uploadDesignFile,
  uploadPrintFile,
} = require("../controllers/uploadController");

router.post("/single", protect, upload.single("file"), uploadSingle);
router.post("/multiple", protect, upload.array("files", 10), uploadMultiple);
router.delete("/:publicId", protect, deleteUpload);
router.post("/design", protect, upload.single("file"), uploadDesignFile);
router.post("/print-file", protect, upload.single("file"), uploadPrintFile);

module.exports = router;
