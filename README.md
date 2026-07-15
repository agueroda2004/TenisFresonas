# Tenis Fresonas

Catálogo público y panel de administración para una tienda de tenis costarricense. El proyecto está construido con **React 19 + TypeScript + Vite**, **Supabase** (Auth, Postgres con RLS, Edge Functions) e **ImageKit** para imágenes con transformaciones on-the-fly.

<p align="left">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000&style=for-the-badge" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=fff&style=for-the-badge" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=fff&style=for-the-badge" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?logo=tailwindcss&logoColor=fff&style=for-the-badge" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Postgres+Auth+Edge_Fns-3FCF8E?logo=supabase&logoColor=fff&style=for-the-badge" />
  <img alt="TanStack Query" src="https://img.shields.io/badge/TanStack_Query-5-FF4154?logo=reactquery&logoColor=fff&style=for-the-badge" />
  <img alt="React Router" src="https://img.shields.io/badge/React_Router-8-CA4245?logo=reactrouter&logoColor=fff&style=for-the-badge" />
  <img alt="Zod" src="https://img.shields.io/badge/Zod-4-3068B7?logo=zod&logoColor=fff&style=for-the-badge" />
  <img alt="ImageKit" src="https://img.shields.io/badge/ImageKit-CDN-1A6BFF?logo=imagekit&logoColor=fff&style=for-the-badge" />
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-Deploy-000?logo=vercel&logoColor=fff&style=for-the-badge" />
  <img alt="ESLint" src="https://img.shields.io/badge/ESLint-10-4B32C3?logo=eslint&logoColor=fff&style=for-the-badge" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-22C55E?style=for-the-badge" />
</p>

---

## Tabla de contenidos

1. [Visión general](#visión-general)
2. [Stack](#stack)
3. [Arquitectura](#arquitectura)
4. [Estructura del proyecto](#estructura-del-proyecto)
5. [Setup local](#setup-local)
6. [Base de datos y RLS](#base-de-datos-y-rls)
7. [Edge Functions](#edge-functions)
8. [Frontend](#frontend)
9. [Filtrado y paginación server-side](#filtrado-y-paginación-server-side)
10. [Optimización de imágenes](#optimización-de-imágenes)
11. [Prevención de memory leaks](#prevención-de-memory-leaks)
12. [Optimizaciones de rendimiento](#optimizaciones-de-rendimiento)
13. [Routing y autenticación](#routing-y-autenticación)
14. [Deploy a Vercel](#deploy-a-vercel)
15. [Scripts](#scripts)
16. [Créditos](#créditos)

---

## Visión general

Tenis Fresonas es una aplicación con dos caras:

- **Landing pública (`/`)** — visible sin login. Catálogo mobile-first con 2 cards por columna en mobile que escala a 3 / 4 / 6 según el viewport. Filtros por nombre, tipo de producto y marca; paginación a 12 productos por página servida directamente por Supabase. Página de detalle (`/products/:id`) con botón **Comprar por Instagram** que abre un DM pre-llenado a `@tenis_fresonas`.
- **Panel admin (`/admin/products`)** — requiere login (Supabase Auth). Permite crear, listar y eliminar productos. Las imágenes se suben directo a ImageKit (signed upload) sin pasar por Supabase.

```
┌──────────────────────────────────────────────────────────────────┐
│  Browser                                                         │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐  │
│  │  LandingPage   │    │ ProductDetail  │    │  AdminPanel    │  │
│  └────────┬───────┘    └────────┬───────┘    └────────┬───────┘  │
│           │                     │                     │          │
│           ▼                     ▼                     ▼          │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  React 19 + TanStack Query + React Router 8 + Zod        │    │
│  └──────────────────────────────┬───────────────────────────┘    │
└─────────────────────────────────┼────────────────────────────────┘
                                  │ HTTPS
              ┌───────────────────┼─────────────────────┐
              ▼                                         ▼
   ┌──────────────────────┐                  ┌──────────────────────┐
   │  Supabase Postgres   │                  │  Supabase Edge Fns   │
   │  (products + RLS)    │                  │  get-upload-signature│
   │  anon / authenticated│                  │  delete-product-image│
   └──────────────────────┘                  └──────────┬───────────┘
                                                        │ HMAC-SHA1
                                                        ▼
                                              ┌──────────────────────┐
                                              │  ImageKit CDN        │
                                              │  (w/h/q/f transforms)│
                                              └──────────────────────┘
```

---

## Stack

| Capa            | Tecnología              | Uso                                                                                      |
| --------------- | ----------------------- | ---------------------------------------------------------------------------------------- |
| UI              | **React 19**            | Componentes, hooks, portales (`Modal`)                                                   |
| Lenguaje        | **TypeScript** (strict) | Tipado end-to-end, `verbatimModuleSyntax`, `erasableSyntaxOnly`                          |
| Build           | **Vite 8**              | HMR, build de producción optimizado                                                      |
| Estilos         | **Tailwind CSS v4**     | Tema en `src/index.css` con `@theme`, sin `tailwind.config.js`                           |
| Routing         | **React Router 8**      | `BrowserRouter`, `Routes`, `Navigate`, `useParams`                                       |
| Estado servidor | **TanStack Query v5**   | `useQuery` con `placeholderData` para paginación sin parpadeo                            |
| Validación      | **Zod 4**               | Schemas de login y creación de producto                                                  |
| Backend         | **Supabase**            | Postgres + Auth + Edge Functions (Deno)                                                  |
| Imágenes        | **ImageKit**            | Almacenamiento + transformaciones on-the-fly                                             |
| Feedback        | **React Hot Toast**     | Notificaciones globales (`notifySuccess`, `notifyError`, …)                              |
| Deploy          | **Vercel**              | SPA con `rewrites` en `vercel.json` para que `/products/:id` no caiga en 404 al recargar |

---

## Estructura del proyecto

```
tenisfresonas/
├── public/                       # assets estáticos servidos tal cual
├── src/
│   ├── App.tsx                   # Router + QueryClient + AuthProvider + Toaster
│   ├── main.tsx                  # createRoot + StrictMode
│   ├── index.css                 # Tailwind v4 + theme tokens
│   ├── assets/                   # logo.png
│   ├── constants/data.ts         # PRODUCT_TYPES, PRODUCT_BRANDS
│   ├── context/                  # AuthContext (provider + hook)
│   ├── supabase/client.ts        # createClient con anon key
│   ├── shared/
│   │   ├── components/           # Spinner, Modal, Input, Dropdown,
│   │   │                         # ImageUploader, ImageLoader, Footer…
│   │   ├── hooks/                # useAuth (re-export del context)
│   │   └── utils/                # formatCurrency, notify, optimizedImage
│   └── features/
│       ├── auth/                 # Login (page, form, schema, service)
│       ├── landing/              # /, /products/:id, 404
│       └── product/              # /admin/products + componentes
├── supabase/
│   ├── migrations/
│   │   ├── 0001_create_products.sql
│   │   └── 0002_products_public_read.sql
│   └── functions/
│       ├── get-upload-signature/index.ts
│       ├── delete-product-image/index.ts
│       └── README.md             # setup detallado de las funciones
├── .env.example
├── vercel.json                   # SPA rewrites
├── vite.config.ts
├── tailwindcss via @tailwindcss/vite
├── eslint.config.js
├── tsconfig.app.json
└── package.json
```

---

## Setup local

### 1. Clonar e instalar

```bash
git clone <repo>
cd tenisfresonas
pnpm install    # o npm install / yarn
```

### 2. Variables de entorno

Copia `.env.example` a `.env` y rellena:

```env
VITE_SUPABASE_URL=https://<tu-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

> **Las credenciales de ImageKit NO van en el frontend.** El cliente recibe `publicKey` + firma desde la edge function `get-upload-signature` cuando las necesita.

### 3. Base de datos

En el **SQL Editor** de Supabase, ejecuta en orden:

1. `supabase/migrations/0001_create_products.sql` — crea tabla, índices, trigger `updated_at` y políticas RLS para usuarios autenticados.
2. `supabase/migrations/0002_products_public_read.sql` — agrega la policy `products_select_anon` para que la landing pública pueda leer sin autenticarse.

### 4. Edge Functions

Sigue el paso a paso en [`supabase/functions/README.md`](./supabase/functions/README.md). Resumen:

```bash
supabase login
supabase link --project-ref <tu-project-ref>

supabase secrets set IMAGEKIT_PRIVATE_KEY=<private>
supabase secrets set IMAGEKIT_PUBLIC_KEY=<public>
supabase secrets set IMAGEKIT_FOLDER="tenis fresonas"

supabase functions deploy get-upload-signature --no-verify-jwt=false
supabase functions deploy delete-product-image --no-verify-jwt=false
```

### 5. Crear usuario admin

En Supabase Auth → Users → Add user con email/password. Ese usuario podrá entrar a `/login` y acceder al panel.

### 6. Arrancar

```bash
npm run dev
```

---

## Base de datos y RLS

```sql
create table public.products (
  id            uuid          primary key default gen_random_uuid(),
  name          text          not null,
  type          text          not null,
  brand         text          not null,
  price         numeric(12,2) not null check (price >= 0),
  image_url     text          not null,
  image_file_id text          not null,
  created_at    timestamptz   not null default now(),
  updated_at    timestamptz   not null default now()
);

create index products_created_at_idx on public.products (created_at desc);
create index products_brand_idx      on public.products (brand);
create index products_type_idx       on public.products (type);
```

### Policies

| Policy                          | Rol             | Operación                             |
| ------------------------------- | --------------- | ------------------------------------- |
| `products_select_authenticated` | `authenticated` | SELECT, INSERT, UPDATE, DELETE        |
| `products_insert_authenticated` | `authenticated` | INSERT                                |
| `products_update_authenticated` | `authenticated` | UPDATE                                |
| `products_delete_authenticated` | `authenticated` | DELETE                                |
| `products_select_anon`          | `anon`          | SELECT (solo lectura para la landing) |

> Los índices `brand`, `type` y `created_at desc` cubren los tres patrones de filtrado/orden más comunes. El `count: "exact"` que usa la paginación se calcula en Postgres a nivel del motor y se devuelve en la misma respuesta (cabecera `Content-Range` parseada por `@supabase/supabase-js`).

---

## Edge Functions

Ambas funciones corren en **Deno** dentro de Supabase, exigen el JWT del usuario en el header `Authorization` y devuelven CORS correctos.

### `get-upload-signature`

Genera los parámetros firmados para que el **cliente suba directo a ImageKit** sin pasar la imagen por Supabase (un solo viaje: Browser → ImageKit).

| Input      | Tipo              | Notas                    |
| ---------- | ----------------- | ------------------------ | ---- | ---- | ---- |
| `fileName` | string, requerido | máx. 255 chars           |
| `fileSize` | number, opcional  | validado 1 B – 5 MB      |
| `fileType` | string, opcional  | debe estar en `image/png | jpeg | webp | gif` |

**Signing string canónico de ImageKit (orden estricto):**

```
folder=<urlencoded>&fileName=<urlencoded>&token=<token>&expire=<expire>&publicKey=<publicKey>
```

Firmado con `HMAC-SHA1(privateKey, signingString)` en hex. `expire` se emite a **30 minutos** y `token` es aleatorio (16 bytes hex).

Además devuelve `transformation: "w-800,h-800,c-maintain_ratio,q-auto,f-webp"` que ImageKit aplica al subir: recorta, comprime y sirve WebP automáticamente.

### `delete-product-image`

Borra una imagen de ImageKit por `fileId`. Se usa en dos sitios:

1. **Rollback al crear un producto** — si el `INSERT` en `products` falla tras una subida exitosa, el cliente llama esta función con el `fileId` recién subido para no dejar huérfanas.
2. **Cleanup al eliminar un producto** — `deleteProduct()` en el service borra primero la fila de Postgres y luego invoca esta función con el `image_file_id` capturado.

### Defensa en profundidad

Las validaciones de tamaño/MIME se hacen **tanto en cliente como en servidor**. El cliente no es fuente de verdad: aunque alguien bypasee el formulario, la edge function rechaza payloads inválidos.

---

## Frontend

### Capa de servicios (`features/<feature>/services/`)

Funciones puras que hablan con Supabase. **No** usan React ni hooks. Fáciles de testear y reutilizar:

- `product.service.ts` → `getProducts`, `getProductById`, `createProduct`, `deleteProduct`, `uploadProductImage`, `deleteProductImage`
- `auth.service.ts` → `signInWithPassword`, `signOut`, `getSession`, `onAuthStateChange`

### Capa de hooks (`features/<feature>/hooks/`)

Un solo archivo por feature expone **todo lo relacionado a productos** con `useQuery`/`useMutation`:

```ts
const {
  products,
  total,
  isLoading,
  isFetching,
  error,
  refetch, // list
  product,
  isLoadingProduct,
  productError, // detail
  createProduct,
  isCreating,
  createError,
  resetCreate, // create
  uploadImage,
  isUploading,
  uploadError,
  resetUpload, // upload
  deleteImage,
  isDeletingImage,
  deleteImageError, // cleanup
  deleteProduct,
  isDeletingProduct,
  deleteProductError, // delete
} = useProduct({ filters, page, pageSize, columns, id });
```

Cada consumidor destructura solo lo que necesita. Las invalidaciones de caché (al crear/eliminar) invalidan `["products"]` para refrescar todas las variantes de la lista.

### Capa de UI (`features/<feature>/components/` + `shared/components/`)

- **`shared/`** → primitives reutilizables (`Spinner`, `Modal`, `Input`, `Dropdown`, `ImageUploader`, `ImageLoader`, `Footer`).
- **`features/<feature>/components/`** → específicos del feature (`ProductForm`, `ProductFilters`, `Pagination`, `DeleteProductModal`).

### Validación con Zod

- `auth.schema.ts` → `loginSchema`
- `product.schema.ts` → `productCreateSchema`

Los formularios validan con `safeParse` y mapean los `issues` a `fieldErrors` por path. Nunca se confía en tipos del payload — la fuente de verdad es el schema.

---

## Filtrado y paginación server-side

El catálogo público y el panel admin **nunca** reciben la tabla completa. Cada query viaja a Postgres con:

```ts
supabase
  .from("products")
  .select(columns, { count: "exact" }) // columnas + total en una sola request
  .order("created_at", { ascending: false })
  .range(from, to) // OFFSET/LIMIT
  .ilike("name", `%${name}%`) // opcional
  .eq("type", type) // opcional
  .eq("brand", brand); // opcional
```

`count: "exact"` activa `Prefer: count=exact` en PostgREST, que devuelve el total en la cabecera `Content-Range` parseada por el SDK — sin segunda request.

### Selección de columnas

```ts
export const PUBLIC_PRODUCT_COLUMNS = "id, name, type, brand, price, image_url";
```

La landing pasa este set explícito (no `*`) para **no transferir `image_file_id`, `created_at` ni `updated_at`** al cliente anónimo. El panel admin sigue recibiendo `*` por default. La `queryKey` incluye `columns`, así que la caché de TanStack Query diferencia ambas variantes.

### Pagination sin parpadeo

```ts
useQuery({
  queryKey: productsListKey(filters, page, pageSize, columns),
  queryFn: () => getProducts({ filters, page, pageSize, columns }),
  placeholderData: (previousData) => previousData, // v5 replacement de keepPreviousData
  staleTime: 60_000,
});
```

Mientras se carga la siguiente página, la lista anterior sigue visible.

### Clamp defensivo

```ts
const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
const safePage = Math.min(page, totalPages);
```

Si el `total` cambia (filtro que reduce resultados, borrado concurrente) y la página actual queda fuera de rango, `safePage` la acota sin re-disparar queries innecesarias.

---

## Optimización de imágenes

### Subida — ImageKit aplica transform on upload

`IK_TRANSFORM = "w-800,h-800,c-maintain_ratio,q-auto,f-webp"` se devuelve con la firma. Cuando ImageKit recibe el archivo, **lo redimensiona, recomprime y sirve WebP** automáticamente. Nunca guardas un PNG de 8 MB en disco.

### Lectura — `getOptimizedImageUrl(url, { width, height })`

Util en `src/shared/utils/optimizedImage.ts` que añade transformaciones específicas a URLs de `imagekit.io`:

```
?tr=w-200,h-200,c-maintain_ratio,q-80,f-auto
```

- **`f-auto`** → ImageKit sirve WebP/AVIF según el navegador (Accept header).
- **`q-80`** → compresión agresiva sin pérdida visible.
- **`w-/h-`** → el tamaño exacto del contenedor para no transferir píxeles de más.

### `ImageLoader` — `ResizeObserver` + spinner

El componente mide su contenedor con `ResizeObserver` y pide la URL optimizada para ese tamaño. Mientras la imagen carga, muestra un `Spinner`. Cuando cambia el `src`, resetea el estado (`isLoaded`, `hasError`) **durante el render** (patrón `trackedSrc`) en lugar de hacerlo dentro de un `useEffect`, evitando el warning de React `set-state-in-effect` y re-renders innecesarios.

```tsx
if (trackedSrc !== src) {
  setTrackedSrc(src);
  setIsLoaded(false);
  setHasError(false);
}
```

Las imágenes usan además `loading="lazy"` y `decoding="async"` para no bloquear el hilo principal.

---

## Prevención de memory leaks

### 1. Object URLs de previsualización

`ImageUploader` usa `URL.createObjectURL(file)` para mostrar la imagen seleccionada. Cada llamada reserva memoria nativa que **debe liberarse** con `URL.revokeObjectURL` cuando la URL ya no se usa o cuando el componente se desmonta:

```ts
function setPreview(next: string | null) {
  if (previewUrlRef.current && previewUrlRef.current !== next) {
    URL.revokeObjectURL(previewUrlRef.current); // libera la anterior
  }
  previewUrlRef.current = next;
  setPreviewUrl(next);
}

useEffect(() => {
  return () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current); // cleanup al desmontar
      previewUrlRef.current = null;
    }
  };
}, []);
```

El `ref` (no el estado) rastrea la URL actual para evitar race conditions con renders intermedios.

### 2. ResizeObserver cleanup

`ImageLoader` se subscribe a un `ResizeObserver` para detectar cambios de tamaño del contenedor (rotación de pantalla, resize de ventana, cambios de layout). El observer **debe desconectarse** al desmontar:

```ts
useEffect(() => {
  const observer = new ResizeObserver(update);
  observer.observe(el);
  return () => observer.disconnect(); // <- cleanup
}, []);
```

Sin esto, cada navegación entre páginas dejaría observers huérfanos referenciando nodos desmontados → leak garantizado.

### 3. Auth state subscription

`AuthContext` se suscribe a `supabase.auth.onAuthStateChange`. Esa subscripción devuelve un `subscription` con método `.unsubscribe()`:

```ts
useEffect(() => {
  let mounted = true;
  (async () => {
    const { session } = await getSession();
    if (!mounted) return;                  // <- evita setState tras unmount
    setSession(session);
    setIsLoading(false);
  })();

  const subscription = onAuthStateChange(...);
  return () => {
    mounted = false;                       // <- cleanup
    subscription.unsubscribe();            // <- libera el listener
  };
}, []);
```

La bandera `mounted` cubre el async path: `getSession()` es async y el componente puede desmontarse antes de que resuelva.

### 4. `document.body.style.overflow` en Modal

`Modal` cambia el overflow del body al abrirse para evitar scroll de fondo. El efecto guarda el valor anterior y lo restaura en cleanup:

```ts
useEffect(() => {
  if (!open) return;
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = previousOverflow; // <- restaura
  };
}, [open]);
```

Sin esto, cerrar un modal dejaría el body bloqueado permanentemente.

---

## Optimizaciones de rendimiento

- **`@supabase/supabase-js` con `persistSession: true`** — el JWT se cachea en `localStorage` (clave `tenisfresonas.auth`) y no requiere round-trip en cada page load.
- **`refetchOnWindowFocus: false`** — no re-fetch automático al cambiar de pestaña.
- **`staleTime: 60_000`** en todas las queries — los datos se consideran frescos por 1 minuto.
- **`placeholderData: keepPrevious`** — la lista anterior se mantiene visible mientras se carga la siguiente página.
- **`useMemo` en `filteredProducts`** se eliminó del lado cliente: el filtrado ocurre en Postgres.
- **Select explícito de columnas** — la landing nunca recibe `image_file_id`, `created_at`, `updated_at`.
- **`count: "exact"`** + `range(from, to)` — una sola request para slice + total, sin N+1.
- **Tailwind v4 con `@theme` en CSS** — sin `tailwind.config.js`, JIT nativo, menos CSS de salida.
- **Vite code-splitting** — cada chunk es lazy-friendly (los logos grandes se quedan fuera del bundle JS).
- **`loading="lazy"` + `decoding="async"`** en cada `<img>` — no bloquean el hilo principal al hacer scroll.
- **`onLoad` / `onError`** en `ImageLoader` para gestionar el spinner sin re-renders intermedios.
- **Active scale + transition** en todos los botones — feedback táctil sin librerías de animación.
- **Sin `useEffect` con `setState` síncrono** — cuando el `src` cambia, el reset de `isLoaded`/`hasError` se hace en render (patrón `trackedSrc`), evitando cascading renders.

---

## Routing y autenticación

| Ruta              | Acceso                                                  | Componente          |
| ----------------- | ------------------------------------------------------- | ------------------- |
| `/`               | público                                                 | `LandingPage`       |
| `/products/:id`   | público                                                 | `ProductDetailPage` |
| `/login`          | público (redirige a `/admin/products` si ya hay sesión) | `LoginPage`         |
| `/admin/products` | autenticado (sino → `/login`)                           | `ProductPage`       |
| `*`               | público                                                 | `NotFoundPage`      |

- `ProtectedRoute` espera a que `useAuth()` termine de cargar la sesión antes de decidir; mientras muestra un spinner para evitar parpadeo del redirect.
- `RedirectIfAuth` hace lo contrario en `/login`: si ya estás autenticado te manda al panel.
- `RedirectIfAuth` y `ProtectedRoute` usan `<Outlet />` para envolver rutas hijas sin necesidad de wrappers adicionales.

---

## Deploy a Vercel

1. Conecta el repo a Vercel.
2. Framework preset: **Vite**.
3. Variables de entorno: añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. Deploy. **No** hace falta configurar build command ni output directory — Vercel detecta Vite automáticamente.

El archivo `vercel.json` resuelve el problema clásico de las SPAs:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Sin esto, recargar `/products/<id>` o cualquier ruta interna devuelve 404 desde Vercel. Con el rewrite, cualquier path que no sea un asset estático se sirve desde `index.html` y React Router toma el control.

---

## Scripts

```bash
npm run dev       # Vite dev server (HMR)
npm run build     # tsc -b && vite build
npm run preview   # servir el build localmente
npm run lint      # ESLint
```

---

## Créditos

Catálogo desarrollado por **Daniel Aguero** · [agueroda.dev](https://www.agueroda.dev/)

---

<p align="left">
  <sub>Construido con React 19, TypeScript, Vite, Tailwind v4, Supabase e ImageKit. Desplegado en Vercel.</sub>
</p>
