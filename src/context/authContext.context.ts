import { createContext } from "react";
import type { AuthContextValue } from "../features/auth/auth.d";

export const AuthContext = createContext<AuthContextValue | null>(null);