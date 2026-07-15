import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo de administrador es obligatorio.")
    .email("Ingresa un correo electrónico válido."),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria.")
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export type LoginFieldErrors = Partial<Record<keyof LoginInput, string>>;

export const REMEMBER_EMAIL_KEY = "tenisfresonas.rememberedEmail";

export function getRememberedEmail(): string {
  try {
    return window.localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setRememberedEmail(email: string): void {
  try {
    window.localStorage.setItem(REMEMBER_EMAIL_KEY, email);
  } catch {
    /* ignore */
  }
}

export function clearRememberedEmail(): void {
  try {
    window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
  } catch {
    /* ignore */
  }
}