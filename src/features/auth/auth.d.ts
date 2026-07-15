import type { Session, User } from "@supabase/supabase-js";

export type AuthUser = User | null;

export type AuthSession = Session | null;

export type AuthErrorCode =
  | "invalid_credentials"
  | "user_not_found"
  | "weak_password"
  | "email_not_confirmed"
  | "too_many_requests"
  | "network"
  | "unknown";

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthContextValue {
  user: AuthUser;
  session: AuthSession;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (payload: LoginPayload) => Promise<{ ok: boolean; error?: AuthError }>;
  signOut: () => Promise<void>;
}