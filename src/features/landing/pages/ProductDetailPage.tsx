import { Link, useParams } from "react-router";
import logo from "../../../assets/logo.png";
import { Spinner } from "../../../shared/components/Spinner";
import { ImageLoader } from "../../../shared/components/ImageLoader";
import { Footer } from "../../../shared/components/Footer";
import { useProduct } from "../../product/hooks/useProduct";
import { PUBLIC_PRODUCT_COLUMNS } from "../../product/services/product.service";
import { formatCRC } from "../../../shared/utils/formatCurrency";
import { PRODUCT_BRANDS, PRODUCT_TYPES } from "../../../constants/data";
import { notifyInfo } from "../../../shared/utils/notify";

const INSTAGRAM_DM_URL = "https://ig.me/m/tenis_fresonas";

function getLabel(
  list: { value: string; label: string }[],
  value: string,
): string {
  return list.find((x) => x.value === value)?.label ?? value;
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { product, isLoadingProduct, productError } = useProduct({
    id,
    columns: PUBLIC_PRODUCT_COLUMNS,
  });

  async function handleBuy() {
    if (!product) return;
    const message = `Hola, me interesa comprar el producto "${product.name}". ¿Está disponible?`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
        notifyInfo("Mensaje copiado. Pégalo en el chat de Instagram.");
      }
    } catch {
      /* ignore clipboard errors */
    }

    window.open(INSTAGRAM_DM_URL, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:max-w-6xl">
          <Link
            to="/"
            aria-label="Volver al catálogo"
            className="transition active:scale-95"
          >
            <img
              src={logo}
              alt="Tenis Fresonas"
              className="h-7 w-auto object-contain sm:h-8"
            />
          </Link>
          <Link
            to="/"
            className="text-[11px] font-bold uppercase tracking-widest text-foreground transition hover:text-primary active:scale-95"
          >
            ← Volver
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:max-w-6xl">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted-foreground transition hover:text-foreground sm:mb-6"
        >
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="h-3 w-3"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 010 1.06L9.06 10l3.73 3.71a.75.75 0 11-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z"
              clipRule="evenodd"
            />
          </svg>
          Catálogo
        </Link>

        {isLoadingProduct ? (
          <div className="flex h-60 items-center justify-center">
            <Spinner
              size="lg"
              className="text-foreground"
              ariaLabel="Cargando producto"
            />
          </div>
        ) : productError ? (
          <div className="border border-primary bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
            {productError instanceof Error
              ? productError.message
              : "No se pudo cargar el producto."}
          </div>
        ) : !product ? (
          <div className="flex flex-col items-center gap-4 border border-dashed border-input bg-muted/30 px-6 py-16 text-center">
            <p className="text-4xl font-black uppercase tracking-tight text-foreground">
              404
            </p>
            <p className="text-sm font-medium text-foreground">
              Este producto no existe o fue eliminado.
            </p>
            <Link
              to="/"
              className="mt-2 inline-flex h-11 items-center justify-center border border-foreground bg-background px-6 text-xs font-bold uppercase tracking-wider text-foreground transition hover:bg-muted active:scale-95"
            >
              Volver al catálogo
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 md:items-start">
            <div className="aspect-square w-full border border-input bg-white">
              <ImageLoader
                src={product.image_url}
                alt={product.name}
                spinnerSize="lg"
              />
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary sm:text-xs">
                {getLabel(PRODUCT_TYPES, product.type)}
              </p>
              <h1 className="text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl md:text-4xl">
                {product.name}
              </h1>
              <p className="text-xs uppercase tracking-wider text-muted-foreground sm:text-sm">
                {getLabel(PRODUCT_BRANDS, product.brand)}
              </p>

              <p className="text-3xl font-black tracking-tight text-primary sm:text-4xl">
                {formatCRC(String(product.price))}
              </p>

              <div className="mt-2 border-t border-border pt-4 sm:mt-4 sm:pt-6">
                <button
                  type="button"
                  onClick={handleBuy}
                  className="flex h-12 w-full items-center justify-center gap-2 bg-primary px-6 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover active:scale-95"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="currentColor"
                  >
                    <path d="M12 2.2c-2.7 0-4.9 2.2-4.9 4.9 0 1.4.6 2.7 1.6 3.6-2.4 1.4-4.6 3.6-6 6.2-.4.8.1 1.7 1 1.7h16.6c.9 0 1.4-.9 1-1.7-1.4-2.6-3.6-4.8-6-6.2 1-.9 1.6-2.2 1.6-3.6 0-2.7-2.2-4.9-4.9-4.9zm0 1.8c1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1S8.9 8.8 8.9 7.1 10.3 4 12 4z" />
                  </svg>
                  Comprar por Instagram
                </button>
                <p className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                  Te redirigiremos a Instagram para ser atendido.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
