const IMAGEKIT_HOST_PATTERN = /(?:^|\.)imagekit\.io$/i;

interface OptimizeOptions {
  width: number;
  height: number;
  quality?: number;
}

function sanitizeDimension(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  return Math.max(1, Math.round(value));
}

export function getOptimizedImageUrl(rawUrl: string, options: OptimizeOptions): string {
  if (!rawUrl) return rawUrl;

  const width = sanitizeDimension(options.width);
  const height = sanitizeDimension(options.height);
  const quality = sanitizeDimension(options.quality ?? 80);

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return rawUrl;
  }

  if (!IMAGEKIT_HOST_PATTERN.test(url.hostname)) {
    return rawUrl;
  }

  const transform = `w-${width},h-${height},c-maintain_ratio,q-${quality},f-auto`;
  const existing = url.searchParams.get("tr");
  url.searchParams.set("tr", existing ? `${existing},${transform}` : transform);

  return url.toString();
}