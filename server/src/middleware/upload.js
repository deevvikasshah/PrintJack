const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("../config/cloudinary");

const ALLOWED_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".tif",
  ".tiff",
  ".svg",
  ".pdf",
  ".ai",
  ".eps",
  ".psd",
];

const ALLOWED_MIMES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/tiff",
  "image/svg+xml",
  "application/pdf",
  "application/postscript",
  "application/illustrator",
  "image/vnd.adobe.photoshop",
  "image/eps",
];

const MAX_UPLOAD_MB = 25;
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

// Allow-list of what a given extension may actually be (magic-byte signatures).
const EXTENSION_SIGNATURES = {
  png: ["png"],
  jpg: ["jpeg"],
  jpeg: ["jpeg"],
  gif: ["gif"],
  webp: ["webp"],
  tif: ["tiff"],
  tiff: ["tiff"],
  svg: ["svg"],
  pdf: ["pdf"],
  ai: ["pdf", "ps"], // Illustrator files are PDF- or EPS-based
  eps: ["ps"],
  psd: ["psd"],
};

// Magic-byte sniffers. Returns a family name or null if unrecognized.
function detectSignature(buffer) {
  if (!buffer || buffer.length === 0) return null;

  const b0 = buffer[0];
  const b1 = buffer[1];
  const n = buffer.length;

  // PDF: %PDF-
  if (n >= 4 && b0 === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) return "pdf";

  // PostScript (EPS, EPS-based AI): %!PS-Adobe or %!PS
  if (n >= 4 && b0 === 0x25 && buffer[1] === 0x21 && buffer[2] === 0x50 && buffer[3] === 0x53) return "ps";

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (n >= 8 && b0 === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "png";

  // JPEG: FF D8 FF
  if (n >= 3 && b0 === 0xff && b1 === 0xd8 && buffer[2] === 0xff) return "jpeg";

  // GIF: GIF87a / GIF89a
  if (n >= 6 && b0 === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38 &&
      (buffer[4] === 0x37 || buffer[4] === 0x39)) return "gif";

  // WebP: RIFF....WEBP
  if (n >= 12 && b0 === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return "webp";

  // TIFF: II*\0 (little endian) or MM\0* (big endian)
  if (n >= 4 &&
      ((b0 === 0x49 && b1 === 0x49 && buffer[2] === 0x2a && buffer[3] === 0x00) ||
       (b0 === 0x4d && b1 === 0x4d && buffer[2] === 0x00 && buffer[3] === 0x2a))) return "tiff";

  // PSD: 8BPS
  if (n >= 4 && b0 === 0x38 && buffer[1] === 0x42 && buffer[2] === 0x50 && buffer[3] === 0x53) return "psd";

  // SVG: starts with XML declaration or <svg (allow whitespace/BOM)
  const head = buffer.slice(0, 256).toString("utf8").replace(/^\uFEFF/, "").trimStart();
  if (head.startsWith("<?xml") || head.startsWith("<svg")) return "svg";

  return null;
}

// Validate a multer file: extension allow-list + real signature (anti-spoofing).
function assertValidFile(file) {
  if (!file || !file.buffer) {
    return { ok: false, error: "No file provided" };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: `File too large. Maximum size is ${MAX_UPLOAD_MB}MB.` };
  }

  const ext = (file.originalname || "")
    .split(".")
    .pop()
    .toLowerCase();

  if (!Object.prototype.hasOwnProperty.call(EXTENSION_SIGNATURES, ext)) {
    return {
      ok: false,
      error: `Unsupported file type ".${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(", ")}.`,
    };
  }

  const family = detectSignature(file.buffer);
  if (!family) {
    return { ok: false, error: "Unrecognized or unsafe file content. Please upload a valid image or print file." };
  }

  const allowedFamilies = EXTENSION_SIGNATURES[ext];
  if (!allowedFamilies.includes(family)) {
    return {
      ok: false,
      error: `File content does not match its extension (.${ext}). Re-export the file from your design tool and try again.`,
    };
  }

  return {
    ok: true,
    family,
    ext,
    mime: file.mimetype,
    size: file.size,
  };
}

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
    fileSize: MAX_UPLOAD_BYTES,
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

module.exports = {
  upload,
  uploadToCloudinary,
  assertValidFile,
  detectSignature,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIMES,
  MAX_UPLOAD_MB,
  MAX_UPLOAD_BYTES,
};