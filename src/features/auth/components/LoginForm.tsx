import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import {
  clearRememberedEmail,
  getRememberedEmail,
  loginSchema,
  setRememberedEmail,
  type LoginFieldErrors,
  type LoginInput,
} from "../auth.schema";
import type { AuthError } from "../auth.d";
import { Spinner } from "../../../shared/components/Spinner";
import { Input, PasswordInput } from "../../../shared/components/Input";

const FRIENDLY_AUTH_ERROR: Record<string, string> = {
  invalid_credentials: "Credenciales erróneas.",
  user_not_found: "Credenciales erróneas.",
  email_not_confirmed: "Confirma tu correo electrónico antes de iniciar sesión.",
  weak_password: "La contraseña es demasiado débil.",
  too_many_requests: "Demasiados intentos. Inténtalo más tarde.",
  network: "Error de red. Verifica tu conexión.",
  unknown: "Credenciales erróneas.",
};

function friendlyAuthError(error: AuthError): string {
  return FRIENDLY_AUTH_ERROR[error.code] ?? FRIENDLY_AUTH_ERROR.unknown;
}

function getInitialRemembered(): { email: string; remember: boolean } {
  const remembered = getRememberedEmail();
  return remembered
    ? { email: remembered, remember: true }
    : { email: "", remember: false };
}

export function LoginForm() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useAuth();

  const initial = getInitialRemembered();
  const [email, setEmail] = useState(initial.email);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(initial.remember);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/product", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  function validate(values: LoginInput): LoginFieldErrors {
    const result = loginSchema.safeParse(values);
    if (result.success) return {};
    const errors: LoginFieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof LoginInput | undefined;
      if (key && !errors[key]) {
        errors[key] = issue.message;
      }
    }
    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const values = { email: email.trim(), password };
    const errors = validate(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const result = await signIn(values);
    setIsSubmitting(false);

    if (!result.ok && result.error) {
      setFormError(friendlyAuthError(result.error));
      return;
    }

    if (remember) {
      setRememberedEmail(values.email);
    } else {
      clearRememberedEmail();
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-5"
      aria-busy={isSubmitting}
    >
      {formError && (
        <div
          role="alert"
          aria-live="assertive"
          className="border border-primary bg-primary/5 px-4 py-3 text-sm font-medium text-primary"
        >
          {formError}
        </div>
      )}

      <Input
        label="Correo de administrador"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="admin@tenisfresonas.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        disabled={isSubmitting}
        required
      />

      <PasswordInput
        label="Contraseña"
        name="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        disabled={isSubmitting}
        required
      />

      <label className="flex cursor-pointer select-none items-center gap-3 text-sm text-foreground">
        <span className="relative inline-flex h-4 w-4 items-center justify-center">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            disabled={isSubmitting}
            className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none border border-input bg-white transition-colors checked:border-primary checked:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Recordar correo del administrador"
          />
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="pointer-events-none h-3 w-3 fill-none stroke-white stroke-[2.5] opacity-0 peer-checked:opacity-100"
          >
            <polyline points="3 8.5 6.5 12 13 4.5" />
          </svg>
        </span>
        <span className="font-medium">Recordar mi correo</span>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 flex h-12 w-full items-center justify-center gap-2 bg-primary px-6 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Spinner size="sm" className="text-primary-foreground" />
            <span>Accediendo al panel…</span>
          </>
        ) : (
          <span>Acceder al panel</span>
        )}
      </button>
    </form>
  );
}