import { useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  formatBytes,
} from "./imageUploader.constants";

interface ImageUploaderProps {
  label?: string;
  value?: File | null;
  onChange?: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
  maxSizeBytes?: number;
}

export function ImageUploader({
  label = "Imagen del producto",
  value,
  onChange,
  error,
  disabled = false,
  maxSizeBytes = MAX_IMAGE_SIZE_BYTES,
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();
  const hasError = Boolean(error) || Boolean(localError);

  function setPreview(next: string | null) {
    if (previewUrlRef.current && previewUrlRef.current !== next) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = next;
    setPreviewUrl(next);
  }

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  function setFile(file: File | null) {
    setLocalError(null);

    if (!file) {
      onChange?.(null);
      setPreview(null);
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setLocalError(
        `Formato no permitido. Usa ${ACCEPTED_IMAGE_EXTENSIONS}.`
      );
      return;
    }

    if (file.size > maxSizeBytes) {
      setLocalError(
        `La imagen supera el límite de ${formatBytes(maxSizeBytes)}.`
      );
      return;
    }

    setPreview(URL.createObjectURL(file));
    onChange?.(file);
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setFile(file);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0] ?? null;
    setFile(file);
  }

  function onDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (!disabled) setIsDragging(true);
  }

  function onDragLeave() {
    setIsDragging(false);
  }

  function removeFile() {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const message = error ?? localError;

  return (
    <div className="w-full">
      <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-foreground">
        {label}
      </span>

      {!previewUrl ? (
        <label
          htmlFor={inputId}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`flex h-44 w-full cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed bg-white text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : hasError
                ? "border-primary"
                : "border-input hover:border-foreground/40"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          </svg>
          <p className="text-sm font-medium text-foreground">
            Arrastra una imagen o haz clic para seleccionar
          </p>
          <p className="text-xs text-muted-foreground">
            {ACCEPTED_IMAGE_EXTENSIONS} · máx. {formatBytes(maxSizeBytes)}
          </p>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            onChange={onInputChange}
            disabled={disabled}
            className="sr-only"
          />
        </label>
      ) : (
        <div className="relative h-44 w-full overflow-hidden border border-input bg-white">
          <img
            src={previewUrl}
            alt="Vista previa"
            className="h-full w-full object-contain"
          />
          <button
            type="button"
            onClick={removeFile}
            disabled={disabled}
            aria-label="Quitar imagen"
            className="absolute right-2 top-2 flex h-8 items-center justify-center bg-foreground px-3 text-xs font-bold uppercase tracking-wide text-background transition hover:bg-primary active:scale-95"
          >
            Quitar
          </button>
        </div>
      )}

      {value && !hasError && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {value.name} · {formatBytes(value.size)}
        </p>
      )}

      {message && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-primary">
          {message}
        </p>
      )}
    </div>
  );
}