import { useState } from "react";
import { Link } from "react-router";
import logo from "../../../assets/logo.png";
import { Spinner } from "../../../shared/components/Spinner";
import { ImageLoader } from "../../../shared/components/ImageLoader";
import { Footer } from "../../../shared/components/Footer";
import { ProductFilters } from "../../product/components/ProductFilters";
import { Pagination } from "../../product/components/Pagination";
import { useProduct } from "../../product/hooks/useProduct";
import {
  PUBLIC_PRODUCT_COLUMNS,
  type ProductFilters as ProductFiltersPayload,
} from "../../product/services/product.service";
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

function getLabel(list: { value: string; label: string }[], value: string): string {
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

export function LandingPage() {
  const [nameInput, setNameInput] = useState("");
  const [typeInput, setTypeInput] = useState<string>(ALL_VALUE);
  const [brandInput, setBrandInput] = useState<string>(ALL_VALUE);
  const [appliedFilters, setAppliedFilters] =
    useState<ProductFiltersPayload>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const { products, total, isLoading, isFetching, error } = useProduct({
    filters: appliedFilters,
    page,
    pageSize: PAGE_SIZE,
    columns: PUBLIC_PRODUCT_COLUMNS,
  });

  const totalPages = Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  function applyFilters() {
    setAppliedFilters(filtersToPayload(nameInput.trim(), typeInput, brandInput));
    setPage(1);
  }

  function clearFilters() {
    setNameInput("");
    setTypeInput(ALL_VALUE);
    setBrandInput(ALL_VALUE);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-center px-4 sm:h-16 sm:px-6 lg:max-w-6xl">
          <img
            src={logo}
            alt="Tenis Fresonas"
            className="h-7 w-auto object-contain sm:h-8"
          />
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10 lg:max-w-6xl lg:py-16">
        <div className="mb-6 sm:mb-8">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-primary sm:mb-2 sm:text-xs">
            Catálogo
          </p>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Tenis Fresonas
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Descubre nuestra colección de tenis disponibles.
          </p>
        </div>

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
            {isFetching && !isLoading && (
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actualizando…
              </p>
            )}

            {total === 0 ? (
              <div className="flex h-40 items-center justify-center border border-dashed border-input bg-muted/30 text-sm text-muted-foreground">
                {hasActiveFilters(appliedFilters)
                  ? "Ningún producto coincide con los filtros aplicados."
                  : "Pronto habrá productos disponibles."}
              </div>
            ) : (
              <>
                <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {products.map((p) => (
                    <li
                      key={p.id}
                      className="border border-input bg-white"
                    >
                      <Link
                        to={`/products/${p.id}`}
                        className="block transition active:scale-[0.98]"
                      >
                        <div className="aspect-square w-full">
                          <ImageLoader
                            src={p.image_url}
                            alt={p.name}
                            spinnerSize="sm"
                          />
                        </div>
                        <div className="space-y-0.5 p-2 sm:space-y-1 sm:p-3 lg:p-4">
                          <p className="line-clamp-1 text-xs font-bold uppercase tracking-wide text-foreground sm:text-sm">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground sm:text-xs">
                            {getLabel(PRODUCT_BRANDS, p.brand)} ·{" "}
                            {getLabel(PRODUCT_TYPES, p.type)}
                          </p>
                          <p className="text-xs font-semibold text-primary sm:text-sm">
                            {formatCRC(String(p.price))}
                          </p>
                        </div>
                      </Link>
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

      <Footer />
    </main>
  );
}