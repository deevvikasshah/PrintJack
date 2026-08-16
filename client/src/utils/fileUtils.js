import api from './api';

export const ALLOWED_EXTENSIONS = [
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'tif', 'tiff',
  'svg', 'pdf', 'ai', 'eps', 'psd',
];

export const MAX_UPLOAD_MB = 25;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

const RASTER = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'tif', 'tiff'];
const VECTOR = ['svg', 'pdf', 'ai', 'eps'];

export const getFileKind = (file) => {
  const ext = (file?.name || file?.originalname || '').split('.').pop().toLowerCase();
  if (RASTER.includes(ext)) return 'raster';
  if (VECTOR.includes(ext)) return 'vector';
  return 'unsupported';
};

export const validateDesignUpload = (file) => {
  if (!file) return { ok: false, error: 'No file selected' };
  const ext = file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      ok: false,
      error: `Unsupported file type ".${ext}". Use PNG, JPG, JPEG, GIF, WEBP, TIFF, SVG, PDF, AI, EPS or PSD.`,
    };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: `File too large. Maximum size is ${MAX_UPLOAD_MB}MB.` };
  }
  return { ok: true, ext, kind: getFileKind(file) };
};

/**
 * Downscale a raster image on a canvas and re-encode as WebP, so users only
 * upload a small, web-optimized preview for the editor/cart. The full-res
 * source is only uploaded as the print file when the user opts into it.
 */
export const compressImageFile = (file, { maxDim = 1600, quality = 0.85 } = {}) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const scale = Math.min(1, maxDim / Math.max(width, height));
      if (scale < 1) {
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not compress image'));
            return;
          }
          resolve({ blob, width, height });
        },
        'image/webp',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image file'));
    };
    img.src = url;
  });

export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });

/**
 * Upload the original print-ready file (PDF/AI/EPS/TIFF/SVG/high-res raster)
 * to the server. The server stores the original untouched for production and
 * returns a low-res preview URL for display. Requires auth.
 */
export const uploadPrintFile = async (file, { onProgress } = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload/print-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
    timeout: 120000,
  });
};