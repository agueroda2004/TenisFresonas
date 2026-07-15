import { Link } from "react-router";
import logo from "../../../assets/logo.png";
import { Footer } from "../../../shared/components/Footer";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-center px-4 sm:h-16 sm:px-6 lg:max-w-6xl">
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
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:px-6 lg:max-w-6xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary sm:text-xs">
          Error 404
        </p>
        <h1 className="mt-3 text-5xl font-black uppercase tracking-tight text-foreground sm:text-7xl">
          Página no encontrada
        </h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
          La ruta que buscas no existe o fue movida.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex h-12 items-center justify-center bg-primary px-8 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover active:scale-95"
        >
          Volver al catálogo
        </Link>
      </section>

      <Footer />
    </main>
  );
}