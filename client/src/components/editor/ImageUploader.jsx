import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

const FORMAT_MIME = {
  PNG: { mime: 'image/png', ext: ['.png'] },
  JPG: { mime: 'image/jpeg', ext: ['.jpg', '.jpeg'] },
  JPEG: { mime: 'image/jpeg', ext: ['.jpg', '.jpeg'] },
  SVG: { mime: 'image/svg+xml', ext: ['.svg'] },
  WEBP: { mime: 'image/webp', ext: ['.webp'] },
  WebP: { mime: 'image/webp', ext: ['.webp'] },
};

const DEFAULT_FORMATS = ['JPG', 'PNG', 'SVG', 'WebP'];
const DEFAULT_MAX_MB = 10;

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

  const rasterizeToPng = (dataUrl, mime) =>
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

      if (file.size > maxBytes) {
        setError(`File too large. Maximum size is ${maxFileSize}MB.`);
        return;
      }

      const isSvg = file.type === 'image/svg+xml';
      const reader = new FileReader();
      reader.onload = async (e) => {
        let dataUrl = e.target.result;
        if (isSvg) {
          dataUrl = await rasterizeToPng(dataUrl, file.type);
        } else if (file.size < 2 * 1024 * 1024) {
          onImageAdd(dataUrl, file.name);
          setPreview(null);
          setSelectedFile(null);
          return;
        } else {
          setUploading(true);
          setProgress(0);
          const bigReader = new FileReader();
          bigReader.onprogress = (ev) => {
            if (ev.lengthComputable) {
              setProgress(Math.round((ev.loaded / ev.total) * 80));
            }
          };
          bigReader.onload = (ev2) => {
            setProgress(90);
            rasterizeToPng(ev2.target.result, file.type).then((pngUrl) => {
              setProgress(100);
              setUploading(false);
              onImageAdd(pngUrl, file.name);
              setPreview(null);
              setSelectedFile(null);
            });
          };
          bigReader.readAsDataURL(file);
          return;
        }
        onImageAdd(dataUrl, file.name);
        setPreview(null);
        setSelectedFile(null);
      };
      reader.readAsDataURL(file);
    },
    [maxBytes, maxFileSize, onImageAdd]
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