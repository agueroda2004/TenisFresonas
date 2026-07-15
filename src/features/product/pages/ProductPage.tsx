import { useState } from "react";
import logo from "../../../assets/logo.png";
import { useAuth } from "../../auth/hooks/useAuth";
import { notifyError, notifySuccess } from "../../../shared/utils/notify";
import { Spinner } from "../../../shared/components/Spinner";
import { Modal } from "../../../shared/components/Modal";
import { ImageLoader } from "../../../shared/components/ImageLoader";
import { Footer } from "../../../shared/components/Footer";
import { ProductForm } from "../components/ProductForm";
import { ProductFilters } from "../components/ProductFilters";
import { Pagination } from "../components/Pagination";
import { DeleteProductModal } from "../components/DeleteProductModal";
import { useProduct } from "../hooks/useProduct";
import type { ProductFilters as ProductFiltersPayload } from "../services/product.service";
import { formatCRC } from "../../../shared/utils/formatCurrency";
import { PRODUCT_BRANDS, PRODUCT_TYPES } from "../../../constants/data";

const PAGE_SIZE = 12;
const ALL_VALUE = "";

const TYPE_FILTER_OPTIONS = [
  { value: ALL_VALUE, label: "Todos los tipos" },
  ...PRODUCT_TYPES,
];
const BRAND_FILTER_OPTIONS = [
  { value: ALL_VALUE, label: "Todas las marcas" },
  ...PRODUCT_BRANDS,
];

function getLabel(
  list: { value: string; label: string }[],
  value: string,
): string {
  return list.find((x) => x.value === value)?.label ?? value;
}

const EMPTY_FILTERS: ProductFiltersPayload = {};

function filtersToPayload(
  name: string,
  type: string,
  brand: string,
): ProductFiltersPayload {
  const payload: ProductFiltersPayload = {};
  if (name) payload.name = name;
  if (type) payload.type = type;
  if (brand) payload.brand = brand;
  return payload;
}

function hasActiveFilters(filters: ProductFiltersPayload): boolean {
  return Boolean(filters.name || filters.type || filters.brand);
}

export function ProductPage() {
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [typeInput, setTypeInput] = useState<string>(ALL_VALUE);
  const [brandInput, setBrandInput] = useState<string>(ALL_VALUE);
  const [appliedFilters, setAppliedFilters] =
    useState<ProductFiltersPayload>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const {
    products,
    total,
    isLoading,
    isFetching,
    error,
    deleteProduct,
    isDeletingProduct,
    deleteProductError,
    resetDeleteProduct,
  } = useProduct({
    filters: appliedFilters,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  function applyFilters() {
    setAppliedFilters(
      filtersToPayload(nameInput.trim(), typeInput, brandInput),
    );
    setPage(1);
  }

  function clearFilters() {
    setNameInput("");
    setTypeInput(ALL_VALUE);
    setBrandInput(ALL_VALUE);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
  }

  function requestDelete(productId: string, productName: string) {
    resetDeleteProduct();
    setProductToDelete({ id: productId, name: productName });
  }

  function cancelDelete() {
    if (isDeletingProduct) return;
    setProductToDelete(null);
    resetDeleteProduct();
  }

  async function confirmDelete() {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      notifySuccess(`"${productToDelete.name}" se eliminó correctamente.`);
      setProductToDelete(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo eliminar el producto.";
      notifyError(message);
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
    notifySuccess("Sesión cerrada correctamente.");
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <img
            src={logo}
            alt="Tenis Fresonas"
            className="h-8 w-auto object-contain"
          />

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex h-10 items-center justify-center gap-2 border border-foreground bg-foreground px-5 text-xs font-bold uppercase tracking-wider text-background transition hover:bg-primary hover:border-primary hover:text-primary-foreground active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSigningOut ? (
                <>
                  <Spinner size="sm" className="text-current" />
                  <span>Cerrando…</span>
                </>
              ) : (
                <span>Cerrar sesión</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Catálogo
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tight text-foreground md:text-5xl">
              Productos
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Gestiona el catálogo de Tenis Fresonas: crea, edita y organiza los
              tenis disponibles en la tienda.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsProductModalOpen(true)}
            className="flex h-12 items-center justify-center gap-2 bg-primary px-6 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover active:scale-95"
          >
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="h-4 w-4"
              fill="currentColor"
            >
              <path d="M10 3a.75.75 0 01.75.75v5.5h5.5a.75.75 0 010 1.5h-5.5v5.5a.75.75 0 01-1.5 0v-5.5h-5.5a.75.75 0 010-1.5h5.5v-5.5A.75.75 0 0110 3z" />
            </svg>
            Nuevo producto
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner
              size="lg"
              className="text-foreground"
              ariaLabel="Cargando productos"
            />
          </div>
        ) : error ? (
          <div className="border border-primary bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
            {error instanceof Error
              ? error.message
              : "No se pudieron cargar los productos."}
          </div>
        ) : (
          <>
            <ProductFilters
              name={nameInput}
              type={typeInput}
              brand={brandInput}
              typeOptions={TYPE_FILTER_OPTIONS}
              brandOptions={BRAND_FILTER_OPTIONS}
              onNameChange={setNameInput}
              onTypeChange={setTypeInput}
              onBrandChange={setBrandInput}
              onApply={applyFilters}
              onClear={clearFilters}
            />

            {isFetching && !isLoading && (
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actualizando…
              </p>
            )}

            {total === 0 ? (
              <div className="flex h-40 items-center justify-center border border-dashed border-input bg-muted/30 text-sm text-muted-foreground">
                {hasActiveFilters(appliedFilters)
                  ? "Ningún producto coincide con los filtros aplicados."
                  : "Aún no hay productos. Crea el primero con el botón superior."}
              </div>
            ) : (
              <>
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {products.map((p) => (
                    <li
                      key={p.id}
                      className="group relative border border-input bg-white"
                    >
                      <div className="aspect-square w-full">
                        <ImageLoader
                          src={p.image_url}
                          alt={p.name}
                          spinnerSize="md"
                        />
                        <button
                          type="button"
                          onClick={() => requestDelete(p.id, p.name)}
                          aria-label={`Eliminar ${p.name}`}
                          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center bg-background/90 text-foreground opacity-0 transition hover:bg-primary hover:text-primary-foreground active:scale-90 focus:opacity-100 group-hover:opacity-100"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                            className="h-4 w-4"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-1 p-4">
                        <p className="line-clamp-1 text-sm font-bold uppercase tracking-wide text-foreground">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getLabel(PRODUCT_BRANDS, p.brand)} ·{" "}
                          {getLabel(PRODUCT_TYPES, p.type)}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          {formatCRC(String(p.price))}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  totalItems={total}
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                />
              </>
            )}
          </>
        )}
      </section>

      <Footer maxWidthClass="max-w-7xl" />

      <Modal open={isProductModalOpen} title="Nuevo producto" maxWidth="lg">
        <ProductForm onCancel={() => setIsProductModalOpen(false)} />
      </Modal>

      <DeleteProductModal
        open={productToDelete !== null}
        productName={productToDelete?.name ?? null}
        isDeleting={isDeletingProduct}
        error={deleteProductError}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </main>
  );
}
