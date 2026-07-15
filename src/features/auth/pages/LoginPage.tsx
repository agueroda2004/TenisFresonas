import { LoginForm } from "../components/LoginForm";
import logo from "../../../assets/logo.png";

export function LoginPage() {
  return (
    <main className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between bg-foreground p-12 text-white lg:flex">
        <header>
          <img
            src={logo}
            alt="Tenis Fresonas"
            className="h-14 w-auto object-contain brightness-0 invert"
          />
        </header>

        <div className="space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
            Panel de administración
          </p>
          <h1 className="text-5xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl">
            Gestiona
            <br />
            tu tienda
            <br />
            <span className="text-primary">en un lugar.</span>
          </h1>
          <p className="max-w-md text-sm text-white/70">
            Acceso restringido para administradores de Tenis Fresonas.
            Ingresa tus credenciales para administrar productos, pedidos
            e inventario.
          </p>
        </div>

        <footer className="flex items-center justify-between text-[11px] font-medium uppercase tracking-widest text-white/50">
          <span>© {new Date().getFullYear()} Tenis Fresonas</span>
          <span>CR</span>
        </footer>
      </section>

      <section className="flex items-center justify-center bg-background px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <img
              src={logo}
              alt="Tenis Fresonas"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="mb-10">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Solo personal autorizado
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">
              Acceso administrador
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Inicia sesión con tu cuenta de administrador para acceder al panel.
            </p>
          </div>

          <LoginForm />
        </div>
      </section>
    </main>
  );
}
