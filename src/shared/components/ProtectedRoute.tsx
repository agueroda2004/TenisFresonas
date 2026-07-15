import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { Spinner } from "./Spinner";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" className="text-foreground" ariaLabel="Verificando sesión" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function RedirectIfAuth() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" className="text-foreground" ariaLabel="Cargando" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/products" replace />;
  }

  return <Outlet />;
}