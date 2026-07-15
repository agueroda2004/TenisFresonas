import { useEffect, useRef, useState } from "react";
import { Spinner } from "./Spinner";
import { getOptimizedImageUrl } from "../utils/optimizedImage";

interface ImageLoaderProps {
  src: string;
  alt: string;
  spinnerSize?: "sm" | "md" | "lg";
  className?: string;
}

interface MeasuredSize {
  width: number;
  height: number;
}

export function ImageLoader({
  src,
  alt,
  spinnerSize = "md",
  className,
}: ImageLoaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<MeasuredSize | null>(null);
  const [trackedSrc, setTrackedSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (trackedSrc !== src) {
    setTrackedSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const width = Math.max(1, Math.ceil(rect.width));
      const height = Math.max(1, Math.ceil(rect.height));
      setSize((prev) =>
        prev && prev.width === width && prev.height === height
          ? prev
          : { width, height }
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const optimizedSrc = size ? getOptimizedImageUrl(src, size) : null;
  const showSpinner = !isLoaded && !hasError;

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden bg-muted ${className ?? ""}`}
    >
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center px-2 text-center text-xs text-muted-foreground">
          No se pudo cargar la imagen
        </div>
      ) : (
        <>
          {showSpinner && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner
                size={spinnerSize}
                className="text-muted-foreground"
                ariaLabel="Cargando imagen"
              />
            </div>
          )}
          {optimizedSrc && (
            <img
              src={optimizedSrc}
              alt={alt}
              loading="lazy"
              decoding="async"
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              className="h-full w-full object-contain"
            />
          )}
        </>
      )}
    </div>
  );
}