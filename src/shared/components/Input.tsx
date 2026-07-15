import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Spinner } from "./Spinner";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
  isLoading?: boolean;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  rightAdornment?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    isLoading,
    type = "text",
    id,
    className = "",
    rightAdornment,
    ...rest
  },
  ref
) {
  const generatedId = id ?? `input-${label.replace(/\s+/g, "-").toLowerCase()}`;
  const errorId = `${generatedId}-error`;
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      <label
        htmlFor={generatedId}
        className="mb-2 block text-xs font-medium uppercase tracking-wide text-foreground"
      >
        {label}
      </label>
      <div
        className={`relative flex items-center border bg-white transition-colors ${
          hasError
            ? "border-primary"
            : "border-input focus-within:border-foreground"
        }`}
      >
        <input
          ref={ref}
          id={generatedId}
          type={type}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          disabled={isLoading || rest.disabled}
          className={`w-full bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
          {...rest}
        />
        {(isLoading || rightAdornment) && (
          <div className="absolute right-2 flex items-center gap-1">
            {isLoading && (
              <span className="flex items-center text-muted-foreground px-2">
                <Spinner size="sm" />
              </span>
            )}
            {rightAdornment}
          </div>
        )}
      </div>
      {hasError && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-xs font-medium text-primary"
        >
          {error}
        </p>
      )}
    </div>
  );
});

interface PasswordInputProps extends Omit<InputProps, "type"> {
  type?: never;
}

export function PasswordInput(props: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <Input
      {...props}
      type={show ? "text" : "password"}
      autoComplete="current-password"
      className="pr-24"
      rightAdornment={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={show}
          className="flex h-8 min-w-[64px] items-center justify-center px-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground transition hover:text-foreground active:scale-95"
        >
          {show ? "Ocultar" : "Mostrar"}
        </button>
      }
    />
  );
}