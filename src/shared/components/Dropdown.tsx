import { useEffect, useId, useRef, useState } from "react";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Selecciona una opción",
  disabled = false,
  error,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();

  const selected = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function selectOption(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-foreground">
        {label}
      </label>

      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className={`flex h-12 w-full items-center justify-between border bg-white px-4 text-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
          error
            ? "border-primary"
            : open
              ? "border-foreground"
              : "border-input hover:border-foreground/40"
        }`}
      >
        <span
          className={selected ? "text-foreground" : "text-muted-foreground"}
        >
          {selected ? selected.label : placeholder}
        </span>
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={`h-4 w-4 text-foreground ${open ? "rotate-180" : ""}`}
        >
          <path
            fill="currentColor"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z"
          />
        </svg>
      </button>

      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-primary">
          {error}
        </p>
      )}

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto border border-input bg-white shadow-lg"
        >
          {options.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              Sin opciones disponibles
            </li>
          )}
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => selectOption(opt.value)}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm text-foreground transition hover:bg-muted active:scale-[0.98] ${
                    isSelected ? "font-semibold" : "font-normal"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <svg
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                      className="h-4 w-4 text-primary"
                    >
                      <path
                        fill="currentColor"
                        d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.47 9.53a.75.75 0 0 1 1.06-1.06l2.72 2.72 6.47-6.47a.75.75 0 0 1 1.06 0z"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}