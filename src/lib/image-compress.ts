/**
 * Client-side image compression utility.
 * Compresses and resizes high-resolution images in the browser before uploading.
 * Prevents Vercel 413 FUNCTION_PAYLOAD_TOO_LARGE error and speeds up uploads.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    maxSizeMB = 2.0,
  } = options;

  // Skip compression for non-images, SVGs, or animated GIFs
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  // If running in an environment without DOM (SSR), return as-is
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down if larger than maximum bounds
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const tryExport = (currentQuality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const maxSizeBytes = maxSizeMB * 1024 * 1024;
            // If still too large, step down quality
            if (blob.size > maxSizeBytes && currentQuality > 0.4) {
              tryExport(currentQuality - 0.2);
              return;
            }

            const nameParts = file.name.split('.');
            const baseName = nameParts.length > 1 ? nameParts.slice(0, -1).join('.') : file.name;
            
            const compressedFile = new File([blob], `${baseName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          'image/webp',
          currentQuality
        );
      };

      tryExport(quality);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
