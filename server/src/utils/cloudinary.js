const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || "printjack",
      resource_type: options.resourceType || "auto",
      ...options,
    };

    delete uploadOptions.resourceType;

    const uploadStream = cloudinary.uploader.upload_stream(
      { ...uploadOptions, resource_type: options.resourceType || "auto" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error.message);
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          resourceType: result.resource_type,
        });
      }
    );

    if (Buffer.isBuffer(file)) {
      uploadStream.end(file);
    } else if (file && file.buffer) {
      uploadStream.end(file.buffer);
    } else if (file && file.path) {
      const fs = require("fs");
      const readStream = fs.createReadStream(file.path);
      readStream.pipe(uploadStream);
    } else {
      reject(new Error("Invalid file input. Provide a Buffer, multer file object, or file path."));
    }
  });
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary deleted: ${publicId} (${result.result})`);
    return { success: true, result: result.result };
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
    return { success: false, error: error.message };
  }
};

const uploadDesign = async (file, productName) => {
  const safeName = (productName || "design")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  const timestamp = Date.now();
  const folder = `printjack/designs/${safeName}`;
  const publicId = `${safeName}_${timestamp}`;

  return uploadToCloudinary(file, {
    folder,
    public_id: publicId,
    resourceType: "auto",
    transformation: [
      { width: 2000, height: 2000, crop: "limit", quality: "auto:best" },
    ],
    flags: "attachment",
  });
};

/**
 * Build a Cloudinary URL that renders a low-res, on-the-fly preview of a stored
 * asset. Nothing extra is stored — the transform is applied at delivery time.
 * Works for rasters (f_auto), SVG (rasterized), PDF/AI (first page rendered),
 * and TIFF. Returns null for raw resources Cloudinary cannot render (e.g. EPS).
 */
const buildPreviewUrl = (publicId, { width = 800, isPdf = false } = {}) => {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (!publicId || !cloud) return null;

  const params = ["f_auto", "q_auto", `w_${width}`, "c_limit"];
  if (isPdf) params.unshift("pg_1");
  return `https://res.cloudinary.com/${cloud}/image/upload/${params.join(",")}/${publicId}`;
};

/**
 * Upload the original print-ready file (PDF, AI, EPS, TIFF, SVG, or raster)
 * untouched for production, keeping the high-res/vector source. Cloudinary
 * treats PDF/AI/TIFF as image resources and can render previews from them.
 */
const uploadPrintFile = (buffer, { folder, fileName } = {}) => {
  return new Promise((resolve, reject) => {
    const ext = (fileName || "")
      .split(".")
      .pop()
      .toLowerCase();
    const folderName = folder || "printjack/designs/printfiles";

    const uploadOptions = {
      folder: folderName,
      resource_type: "auto",
    };
    // Index page 1 so previews can be rendered from PDFs.
    if (ext === "pdf") uploadOptions.page = 1;

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        console.error("Cloudinary print-file upload error:", error.message);
        return reject(error);
      }

      const isRaw = result.resource_type === "raw";
      resolve({
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        resourceType: result.resource_type,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        previewUrl: isRaw ? null : buildPreviewUrl(result.public_id, { isPdf: ext === "pdf" }),
      });
    });

    if (Buffer.isBuffer(buffer)) {
      uploadStream.end(buffer);
    } else {
      reject(new Error("Invalid file input. Provide a Buffer."));
    }
  });
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadDesign,
  uploadPrintFile,
  buildPreviewUrl,
};
