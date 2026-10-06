export function normalizeImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('/')) return url;

  // If it's a Cloudflare R2 development URL (blocked by Indonesian ISPs)
  if (url.includes('.r2.dev/')) {
    const key = url.split('.r2.dev/')[1];
    return `/api/media/${key}`;
  }

  // If it's an S3 cloudflarestorage endpoint
  if (url.includes('.cloudflarestorage.com/')) {
    const parts = url.split('.cloudflarestorage.com/')[1];
    const key = parts.startsWith('kalana-media/') ? parts.replace('kalana-media/', '') : parts;
    return `/api/media/${key}`;
  }

  return url;
}

export function normalizeDeep<T>(val: T): T {
  if (typeof val === 'string') {
    if (val.includes('.r2.dev/') || val.includes('.cloudflarestorage.com/')) {
      if (val.startsWith('http://') || val.startsWith('https://')) {
        return normalizeImageUrl(val) as unknown as T;
      }
      return val.replace(/https?:\/\/[^\s"'<>]+\.r2\.dev\/([^\s"'<>]+)/g, '/api/media/$1') as unknown as T;
    }
    return val;
  }
  if (Array.isArray(val)) {
    return val.map((item) => normalizeDeep(item)) as unknown as T;
  }
  if (val !== null && typeof val === 'object') {
    const res: any = {};
    for (const key of Object.keys(val)) {
      res[key] = normalizeDeep((val as any)[key]);
    }
    return res as T;
  }
  return val;
}
