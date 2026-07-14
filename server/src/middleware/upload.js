const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("../config/cloudinary");

const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".pdf",
  ".ai",
  ".psd",
  ".cdr",
];

const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/postscript",
  "image/vnd.adobe.photoshop",
  "application/x-corelDRAW",
];

const fileFilter = (req, file, cb) => {
  const ext = "." + file.originalname.split(".").pop().toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext) || ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`
      ),
      false
    );
  }
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || "printjack",
      resource_type: options.resourceType || "auto",
      ...options,
    };

    if (options.resourceType === "raw") {
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(fileBuffer);
    } else {
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(fileBuffer);
    }
  });
};

module.exports = { upload, uploadToCloudinary };
