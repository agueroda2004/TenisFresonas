import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { ProductPage } from "./features/product/pages/ProductPage";
import { LandingPage } from "./features/landing/pages/LandingPage";
import { ProductDetailPage } from "./features/landing/pages/ProductDetailPage";
import { NotFoundPage } from "./features/landing/pages/NotFoundPage";
import {
  ProtectedRoute,
  RedirectIfAuth,
} from "./shared/components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "4px",
                background: "#111111",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 500,
                padding: "12px 16px",
              },
              success: {
                iconTheme: { primary: "#ff0000", secondary: "#ffffff" },
              },
              error: {
                iconTheme: { primary: "#ff0000", secondary: "#ffffff" },
              },
            }}
          />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

            <Route element={<RedirectIfAuth />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/admin/products" element={<ProductPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}