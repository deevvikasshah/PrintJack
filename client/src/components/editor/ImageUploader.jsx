import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { compressImageFile, fileToDataUrl, validateDesignUpload, getFileKind } from '../../utils/fileUtils';

const FORMAT_MIME = {
  PNG: { mime: 'image/png', ext: ['.png'] },
  JPG: { mime: 'image/jpeg', ext: ['.jpg', '.jpeg'] },
  JPEG: { mime: 'image/jpeg', ext: ['.jpg', '.jpeg'] },
  GIF: { mime: 'image/gif', ext: ['.gif'] },
  WEBP: { mime: 'image/webp', ext: ['.webp'] },
  WebP: { mime: 'image/webp', ext: ['.webp'] },
  TIFF: { mime: 'image/tiff', ext: ['.tif', '.tiff'] },
  SVG: { mime: 'image/svg+xml', ext: ['.svg'] },
  PDF: { mime: 'application/pdf', ext: ['.pdf'] },
  AI: { mime: 'application/postscript', ext: ['.ai'] },
  EPS: { mime: 'application/postscript', ext: ['.eps'] },
  PSD: { mime: 'image/vnd.adobe.photoshop', ext: ['.psd'] },
};

const DEFAULT_FORMATS = ['JPG', 'PNG', 'SVG', 'PDF', 'AI', 'EPS', 'TIFF', 'WEBP'];
const DEFAULT_MAX_MB = 25;

export default function ImageUploader({ onImageAdd, acceptedFormats = [], maxFileSize = DEFAULT_MAX_MB }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const formats = acceptedFormats.length > 0 ? acceptedFormats : DEFAULT_FORMATS;
  const maxBytes = maxFileSize * 1024 * 1024;

  const ACCEPTED_TYPES = {};
  formats.forEach((f) => {
    const entry = FORMAT_MIME[f.toUpperCase()];
    if (entry) {
      ACCEPTED_TYPES[entry.mime] = entry.ext;
    }
  });

  const rasterizeToPng = (dataUrl) =>
    new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          const maxDim = 2000;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          if (!width || !height) {
            width = 800;
            height = 800;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/png', 0.92));
        } catch (err) {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });

  const processFile = useCallback(
    async (file) => {
      setError(null);
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));

      const check = validateDesignUpload(file);
      if (!check.ok) {
        setError(check.error);
        setSelectedFile(null);
        setPreview(null);
        return;
      }

      setUploading(true);
      setProgress(10);

      try {
        const kind = getFileKind(file);

        // Vector/print formats (PDF, AI, EPS, PSD, TIFF) can't be placed on the
        // canvas in-browser. Pass the raw file through so the caller can upload
        // the original to the server and show its server-rendered preview.
        if (kind === 'vector') {
          setProgress(100);
          setUploading(false);
          onImageAdd({ kind: 'print-file', file });
          setPreview(null);
          setSelectedFile(null);
          return;
        }

        // Raster: downscale + re-encode to WebP so the editor/cart only ever
        // handles a small web-optimized copy.
        const compressed = await compressImageFile(file, { maxDim: 1600, quality: 0.85 });
        setProgress(80);
        const dataUrl = await fileToDataUrl(compressed.blob);
        setProgress(100);
        setUploading(false);
        onImageAdd(dataUrl, file.name);
        setPreview(null);
        setSelectedFile(null);
      } catch (err) {
        // Best-effort fallback for formats the browser can't decode (e.g. TIFF).
        try {
          const dataUrl = await rasterizeToPng(await fileToDataUrl(file));
          setUploading(false);
          onImageAdd(dataUrl, file.name);
          setPreview(null);
          setSelectedFile(null);
        } catch (fallbackErr) {
          setUploading(false);
          setError('Could not read this file. Try exporting it as PNG or PDF.');
        }
      }
    },
    [onImageAdd]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_TYPES,
    maxSize: maxBytes,
    onDrop: (files) => {
      if (files.length > 0) processFile(files[0]);
    },
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors?.[0];
      if (err?.code === 'file-too-large') {
        setError(`File too large. Maximum size is ${maxFileSize}MB.`);
      } else if (err?.code === 'file-invalid-type') {
        setError(`Invalid file type. Accepts ${formats.join(', ')}.`);
      } else {
        setError(err?.message || 'Upload failed');
      }
    },
  });

  const clearPreview = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    setUploading(false);
    setProgress(0);
  };

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={clsx(
          'relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-brand-500 bg-brand-50 scale-[1.02]'
            : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
        )}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-brand-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{progress}% uploaded...</p>
          </div>
        ) : preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="max-h-32 rounded-lg shadow-sm"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearPreview();
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <>
            <Upload
              className={clsx(
                'w-10 h-10 mx-auto mb-3 transition-colors',
                isDragActive ? 'text-brand-500' : 'text-gray-400'
              )}
            />
            <p className="text-sm font-medium text-gray-700">
              {isDragActive ? 'Drop image here' : 'Drag & drop an image'}
            </p>
            <p className="text-xs text-gray-400 mt-1">or click to browse</p>
            <p className="text-[10px] text-gray-400 mt-2">
              {formats.join(', ')} · Max {maxFileSize}MB
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}