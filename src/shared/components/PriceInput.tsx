import {
  forwardRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
} from "react";
import { formatCRC, sanitizePriceInput } from "../utils/formatCurrency";

interface PriceInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange" | "defaultValue"> {
  label?: string;
  value: string;
  onChange: (next: string) => void;
  error?: string;
  showFormattedHint?: boolean;
}

export const PriceInput = forwardRef<HTMLInputElement, PriceInputProps>(
  function PriceInput(
    {
      label = "Precio",
      value,
      onChange,
      error,
      showFormattedHint = true,
      id,
      className = "",
      ...rest
    },
    ref
  ) {
    const generatedId =
      id ?? `price-input-${label.replace(/\s+/g, "-").toLowerCase()}`;
    const [isFocused, setIsFocused] = useState(false);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
      onChange(sanitizePriceInput(event.target.value));
    }

    const hasError = Boolean(error);
    const formatted = formatCRC(value);
    const showHint = showFormattedHint && (isFocused || value.length > 0);

    return (
      <div className="w-full">
        <label
          htmlFor={generatedId}
          className="mb-2 block text-xs font-medium uppercase tracking-wide text-foreground"
        >
          {label}
        </label>

        <div
          className={`flex items-center border bg-white transition-colors ${
            hasError
              ? "border-primary"
              : isFocused
                ? "border-foreground"
                : "border-input"
          }`}
        >
          <input
            ref={ref}
            id={generatedId}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-invalid={hasError}
            placeholder="0"
            className={`w-full bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none ${className}`}
            {...rest}
          />
        </div>

        {showHint && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {formatted || "₡0"}
          </p>
        )}

        {hasError && (
          <p
            role="alert"
            className="mt-1.5 text-xs font-medium text-primary"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);