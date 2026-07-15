# Edge Functions · Setup paso a paso

Estas funciones corren en Deno dentro de Supabase. Manejan dos cosas:

- `get-upload-signature` → genera los parámetros firmados para que el cliente
  suba directo a ImageKit (sin pasar la imagen por Supabase).
- `delete-product-image` → borra una imagen de ImageKit por `fileId`, usado
  para hacer rollback cuando falla la creación del producto (evita huérfanas).

---

## 1) Instalar el Supabase CLI (si no lo tienes)

```bash
# con npm
npm install -g supabase

# o con scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

Verifica:
```bash
supabase --version
```

## 2) Vincular el proyecto local a tu proyecto de Supabase

```bash
cd C:\Users\DevDani\Desktop\Proyectos\TenisFresonas
supabase login
supabase link --project-ref <tu-project-ref>
```

El `<project-ref>` lo encuentras en la URL del dashboard de Supabase
(`https://app.supabase.com/project/<tu-project-ref>`).

## 3) Crear cuenta y obtener credenciales de ImageKit

1. Entra a https://imagekit.io y crea una cuenta gratuita.
2. En el dashboard ve a **Developer → API Keys**.
3. Copia:
   - **Public Key**  → `IMAGEKIT_PUBLIC_KEY`
   - **Private Key** → `IMAGEKIT_PRIVATE_KEY` (⚠️ nunca exponerla al cliente).

## 4) Configurar los secrets en Supabase

Los secrets son las variables de entorno que verán las Edge Functions **en el
servidor**. NO los pongas en el `.env` del frontend.

```bash
supabase secrets set IMAGEKIT_PRIVATE_KEY=tu_private_key
supabase secrets set IMAGEKIT_PUBLIC_KEY=tu_public_key
supabase secrets set IMAGEKIT_FOLDER="tenis fresonas"
```

## 5) Desplegar las funciones

```bash
supabase functions deploy get-upload-signature --no-verify-jwt=false
supabase functions deploy delete-product-image --no-verify-jwt=false
```

> `--no-verify-jwt=false` significa que la función SÍ exige el JWT del
> usuario en el header `Authorization`. El cliente lo envía automáticamente
> porque usa `supabase.functions.invoke()`.

## 6) Probar local (opcional)

```bash
supabase functions serve get-upload-signature --no-verify-jwt=false --env-file ./supabase/.env.local
supabase functions serve delete-product-image --no-verify-jwt=false --env-file ./supabase/.env.local
```

Crea `supabase/.env.local`:
```
IMAGEKIT_PRIVATE_KEY=tu_private_key
IMAGEKIT_PUBLIC_KEY=tu_public_key
IMAGEKIT_FOLDER="tenis fresonas"
```

---

## Cómo funciona cada función

### `get-upload-signature`

**Lo que hace:** Le pide al cliente parámetros firmados (signing string canónico
de ImageKit) para autorizar una subida directa desde el browser.

**Input (JSON):**
```json
{
  "fileName": "tenis.jpg",
  "fileSize": 2456789,
  "fileType": "image/jpeg"
}
```

`fileName` es obligatorio. `fileSize` y `fileType` son opcionales pero
recomendados para validación temprana.

**Output (JSON):**
```json
{
  "signature":   "<HMAC-SHA1 hex>",
  "expire":      1730000000,
  "token":       "<random hex>",
  "publicKey":   "public_xxx",
  "folder":      "tenis fresonas",
  "transformation": "w-800,h-800,c-maintain_ratio,q-auto,f-webp"
}
```

**Signing string (orden estricto):**
```
folder=<urlencoded>&fileName=<urlencoded>&token=<token>&expire=<expire>&publicKey=<publicKey>
```

**Uso desde el cliente (referencia):**
```ts
const { data: sig } = await supabase.functions.invoke("get-upload-signature", {
  body: { fileName: file.name, fileSize: file.size, fileType: file.type },
});

const fd = new FormData();
fd.append("file", file);
fd.append("fileName", file.name);
fd.append("folder", sig.folder);
fd.append("publicKey", sig.publicKey);
fd.append("signature", sig.signature);
fd.append("expire", String(sig.expire));
fd.append("token", sig.token);
fd.append("useUniqueFileName", "true");
fd.append("transformation", sig.transformation);

await fetch("https://upload.imagekit.io/api/v1/files/upload", {
  method: "POST",
  body: fd,
});
```

**Errores comunes:**
- `401 Unauthorized` → sesión expirada o inválida. Re-loginear.
- `400 Missing fileName` → no enviaste `fileName`.
- `400 File size invalid or exceeds 5MB limit` → la imagen excede 5MB.
- `400 Unsupported file type` → MIME no permitido.
- `500 IMAGEKIT_PRIVATE_KEY / IMAGEKIT_PUBLIC_KEY not configured` → falta secret.

### `delete-product-image`

**Lo que hace:** Borra una imagen de ImageKit usando el `fileId` guardado en
la tabla `products`. Se usa para rollback si el INSERT en `products` falla
después de una subida exitosa.

**Input (JSON):**
```json
{ "fileId": "string" }
```

**Output:**
```json
{ "ok": true }
```

---

## Resumen de archivos

```
supabase/
├── migrations/
│   └── 0001_create_products.sql      ← pegar en SQL Editor de Supabase
└── functions/
    ├── get-upload-signature/index.ts
    └── delete-product-image/index.ts
```

---

## Variables de entorno

### Frontend (`.env` del proyecto Vite)

```
VITE_SUPABASE_URL=https://<tu-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

> No hace falta exponer las credenciales de ImageKit en el frontend:
> el cliente recibe el `publicKey` y el resto de los parámetros firmados
> desde el edge function cuando los solicita.

### Backend (secrets de Supabase)

```
IMAGEKIT_PRIVATE_KEY=<tu-private-key>
IMAGEKIT_PUBLIC_KEY=<tu-public-key>
IMAGEKIT_FOLDER="tenis fresonas"
```

> `SUPABASE_URL` y `SUPABASE_ANON_KEY` ya los inyecta Supabase automáticamente
> a las Edge Functions, no hace falta setearlos como secrets.