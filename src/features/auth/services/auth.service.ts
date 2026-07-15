import type { AuthError as SupabaseAuthError } from "@supabase/supabase-js";
import { supabase } from "../../../supabase/client";
import type {
  AuthError,
  AuthErrorCode,
  LoginPayload,
} from "../auth.d";

function mapSupabaseError(error: SupabaseAuthError | null): AuthError | null {
  if (!error) return null;

  const message = error.message?.toLowerCase() ?? "";
  const status = error.status;

  let code: AuthErrorCode = "unknown";

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  ) {
    code = "invalid_credentials";
  } else if (message.includes("user not found")) {
    code = "user_not_found";
  } else if (message.includes("email not confirmed")) {
    code = "email_not_confirmed";
  } else if (message.includes("weak password")) {
    code = "weak_password";
  } else if (message.includes("rate limit") || status === 429) {
    code = "too_many_requests";
  } else if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("failed to fetch")
  ) {
    code = "network";
  }

  return {
    code,
    message: error.message || "Ocurrió un error inesperado.",
  };
}

export async function signInWithPassword(
  payload: LoginPayload
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  return { error: mapSupabaseError(error) };
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: mapSupabaseError(error) };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return {
    session: data.session,
    error: error ? mapSupabaseError(error as SupabaseAuthError) : null,
  };
}

export function onAuthStateChange(
  callback: (session: import("../auth.d").AuthSession) => void
) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription;
}