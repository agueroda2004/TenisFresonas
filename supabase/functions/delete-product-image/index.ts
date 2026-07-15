// ===========================================================================
// Edge Function: delete-product-image
//
// Elimina una imagen de ImageKit por fileId. Útil para hacer rollback cuando
// falla la creación del producto en la base de datos (evita imágenes huérfanas).
//
// Endpoint: POST /functions/v1/delete-product-image
//   body: { "fileId": "string" }
// ===========================================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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
  let body: { fileId?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (typeof body.fileId !== "string" || body.fileId.length === 0) {
    return json({ error: "Missing fileId" }, 400);
  }

  const ikPrivate = Deno.env.get("IMAGEKIT_PRIVATE_KEY");
  if (!ikPrivate) {
    return json({ error: "IMAGEKIT_PRIVATE_KEY not configured" }, 500);
  }

  // --- ImageKit delete ---
  const ikRes = await fetch(
    `https://api.imagekit.io/v1/files/${encodeURIComponent(body.fileId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: "Basic " + btoa(`${ikPrivate}:`),
      },
    }
  );

  if (!ikRes.ok) {
    let detail = "";
    try {
      detail = await ikRes.text();
    } catch {
      /* ignore */
    }
    return json({ error: "ImageKit delete failed", detail }, 502);
  }

  return json({ ok: true });
});