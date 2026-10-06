"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon } from "lucide-react";

interface ImageUploadFieldProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  aspectRatio?: "square" | "video" | "portrait" | "auto";
  description?: string;
  helperText?: string;
  accept?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  folder = "cms",
  aspectRatio = "auto",
  description,
  helperText,
  accept = "image/*"
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState(value || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // 1. Get presigned URL
      const presignedRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "image/png",
          folder: folder
        })
      });

      if (!presignedRes.ok) {
        const errText = await presignedRes.text();
        throw new Error(errText || "Failed to generate upload URL");
      }

      const { uploadUrl, publicUrl } = await presignedRes.json();

      // 2. Upload to Cloudflare R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "image/png" }
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image to storage");
      }

      onChange(publicUrl);
      setManualUrl(publicUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
    setManualUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const aspectClasses = {
    square: "aspect-square max-w-[200px]",
    video: "aspect-video max-w-sm",
    portrait: "aspect-[3/4] max-w-[200px]",
    auto: "h-36 max-w-sm"
  }[aspectRatio];

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      {(description || helperText) && <p className="text-xs text-gray-500">{description || helperText}</p>}

      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}

      {value ? (
        <div className={`relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 ${aspectClasses}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label || "Uploaded preview"}
            className="w-full h-full object-contain p-2"
          />
          <div className="absolute top-2 right-2 flex gap-1 bg-black/60 backdrop-blur-sm rounded-md p-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs text-white hover:text-gray-200 px-2 py-1 flex items-center gap-1 font-medium"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-white hover:text-red-400 p-1"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-gray-300 hover:border-black rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-gray-50 ${aspectClasses}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs">Uploading to R2...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500 text-center">
              <Upload className="w-6 h-6" />
              <span className="text-xs font-medium text-gray-700">Click to upload image</span>
              <span className="text-[10px] text-gray-400">PNG, JPG, WEBP, SVG, ICO</span>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-gray-500 hover:text-black flex items-center gap-1 font-medium"
        >
          <LinkIcon className="w-3 h-3" />
          {showUrlInput ? "Hide Direct URL" : "Or enter Direct URL"}
        </button>

        {showUrlInput && (
          <div className="mt-2 flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/image.png"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="flex-1 text-xs px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button
              type="button"
              onClick={() => onChange(manualUrl)}
              className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-black font-medium"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
