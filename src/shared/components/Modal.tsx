import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  title?: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

const widthMap: Record<NonNullable<ModalProps["maxWidth"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Modal({ open, title, children, maxWidth = "lg" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-8"
    >
      <div
        className={`relative w-full ${widthMap[maxWidth]} bg-background shadow-2xl`}
      >
        {title && (
          <header className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2
              id="modal-title"
              className="text-lg font-black uppercase tracking-tight text-foreground"
            >
              {title}
            </h2>
          </header>
        )}

        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-6 py-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}