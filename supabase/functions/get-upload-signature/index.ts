// ===========================================================================
// Edge Function: get-upload-signature
//
// Genera los parámetros firmados que el cliente necesita para subir
// directamente a ImageKit (signed upload). Esto evita que la imagen pase por
// Supabase y solo viaje una vez: Cliente → ImageKit.
//
// - Autentica al usuario con el JWT de Supabase (Authorization header).
// - Construye el signing string canónico de ImageKit:
//     folder=<urlencoded>&fileName=<urlencoded>&token=<token>&expire=<expire>&publicKey=<publicKey>
// - Firma con HMAC-SHA1(privateKey, signingString) en hex.
//
// Endpoint: POST /functions/v1/get-upload-signature
//   body: { fileName: string, fileSize?: number, fileType?: string }
//   resp: { signature, expire, token, publicKey, folder, transformation }
// ===========================================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

// Transformación aplicada al subir (compresión server-side de ImageKit).
const IK_TRANSFORM = "w-800,h-800,c-maintain_ratio,q-auto,f-webp";

const EXPIRE_SECONDS = 30 * 60; // 30 minutos

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function randomToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
}

async function hmacSha1Hex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  let hex = "";
  const bytes = new Uint8Array(sig);
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // --- Auth ---
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    return json({ error: "Server misconfigured" }, 500);
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return json({ error: "Unauthorized" }, 401);
  }

  // --- Body ---
  let body: { fileName?: unknown; fileSize?: unknown; fileType?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  // fileName es obligatorio; si no viene, no podemos firmar la subida.
  if (typeof body.fileName !== "string" || body.fileName.trim().length === 0) {
    return json({ error: "Missing fileName" }, 400);
  }
  if (body.fileName.length > 255) {
    return json({ error: "fileName too long" }, 400);
  }

  // Defense in depth: validamos tamaño y MIME también en server.
  if (
    typeof body.fileSize === "number" &&
    (body.fileSize <= 0 || body.fileSize > MAX_SIZE)
  ) {
    return json({ error: "File size invalid or exceeds 5MB limit" }, 400);
  }

  if (typeof body.fileType === "string" && !ALLOWED.has(body.fileType)) {
    return json({ error: `Unsupported file type: ${body.fileType}` }, 400);
  }

  // --- Config from secrets ---
  const ikPrivate = Deno.env.get("IMAGEKIT_PRIVATE_KEY");
  const ikPublic = Deno.env.get("IMAGEKIT_PUBLIC_KEY");
  const ikFolder = Deno.env.get("IMAGEKIT_FOLDER") ?? "tenis fresonas";

  if (!ikPrivate || !ikPublic) {
    return json(
      { error: "IMAGEKIT_PRIVATE_KEY / IMAGEKIT_PUBLIC_KEY not configured" },
      500
    );
  }

  // --- Build signature ---
  const token = randomToken();
  const expire = Math.floor(Date.now() / 1000) + EXPIRE_SECONDS;
  const fileName = body.fileName.trim();

  const signingString =
    `folder=${encodeURIComponent(ikFolder)}` +
    `&fileName=${encodeURIComponent(fileName)}` +
    `&token=${token}` +
    `&expire=${expire}` +
    `&publicKey=${ikPublic}`;

  const signature = await hmacSha1Hex(ikPrivate, signingString);

  return json({
    signature,
    expire,
    token,
    publicKey: ikPublic,
    folder: ikFolder,
    transformation: IK_TRANSFORM,
  });
});