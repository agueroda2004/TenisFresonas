import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getSession,
  onAuthStateChange,
  signInWithPassword,
  signOut as serviceSignOut,
} from "../features/auth/services/auth.service";
import { AuthContext } from "./authContext.context";
import type {
  AuthContextValue,
  AuthSession,
  AuthUser,
  LoginPayload,
} from "../features/auth/auth.d";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser>(null);
  const [session, setSession] = useState<AuthSession>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { session: initialSession } = await getSession();
      if (!mounted) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsLoading(false);
    })();

    const subscription = onAuthStateChange((nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (payload: LoginPayload) => {
    const { error } = await signInWithPassword(payload);
    if (error) {
      return { ok: false, error };
    }
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    await serviceSignOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated: !!user && !!session,
      signIn,
      signOut,
    }),
    [user, session, isLoading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}