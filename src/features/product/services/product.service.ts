import { supabase } from "../../../supabase/client";
import type {
  CreateProductPayload,
  DeleteImageResult,
  Product,
  UploadedImage,
  UploadImageResult,
} from "../product.d";

const SIGNATURE_FN = "get-upload-signature";
const DELETE_FN = "delete-product-image";
const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

interface SignatureResponse {
  signature: string;
  expire: number;
  token: string;
  publicKey: string;
  folder: string;
  transformation: string;
}

function readErrorMessage(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof (payload as { message: unknown }).message === "object"
  ) {
    return JSON.stringify((payload as { message: unknown }).message);
  }
  try {
    return JSON.stringify(payload);
  } catch {
    return "Unknown error";
  }
}

export async function uploadProductImage(file: File): Promise<UploadImageResult> {
  // (1) Pedir parámetros firmados al edge function
  const { data: sig, error: sigErr } = await supabase.functions.invoke<SignatureResponse>(
    SIGNATURE_FN,
    {
      body: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
    }
  );

  if (sigErr || !sig) {
    return {
      ok: false,
      error: sigErr?.message ?? "No se pudo obtener la firma de subida.",
    };
  }

  // (2) Subir directo a ImageKit
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("folder", sig.folder);
  formData.append("publicKey", sig.publicKey);
  formData.append("signature", sig.signature);
  formData.append("expire", String(sig.expire));
  formData.append("token", sig.token);
  formData.append("useUniqueFileName", "true");
  formData.append("transformation", sig.transformation);

  let res: Response;
  try {
    res = await fetch(IMAGEKIT_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return { ok: false, error: `Error de red al subir la imagen: ${message}` };
  }

  if (!res.ok) {
    let detail = "";
    try {
      detail = readErrorMessage(await res.json());
    } catch {
      try {
        detail = await res.text();
      } catch {
        /* swallow */
      }
    }
    return {
      ok: false,
      error: `ImageKit rechazó la subida (${res.status})${detail ? `: ${detail}` : ""}`,
    };
  }

  const ik = (await res.json()) as {
    url?: string;
    thumbnailUrl?: string;
    fileId?: string;
    name?: string;
  };

  if (!ik.url || !ik.fileId) {
    return { ok: false, error: "Respuesta inválida de ImageKit." };
  }

  const uploaded: UploadedImage = {
    url: ik.url,
    thumbnailUrl: ik.thumbnailUrl ?? ik.url,
    fileId: ik.fileId,
    name: ik.name ?? file.name,
  };

  return { ok: true, data: uploaded };
}

export async function deleteProductImage(fileId: string): Promise<DeleteImageResult> {
  const { error } = await supabase.functions.invoke<{ ok: boolean; error?: string }>(
    DELETE_FN,
    { body: { fileId } }
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function createProduct(
  payload: CreateProductPayload
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: payload.name,
      type: payload.type,
      brand: payload.brand,
      price: payload.price,
      image_url: payload.image_url,
      image_file_id: payload.image_file_id,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      error.message ?? "No se pudo crear el producto en la base de datos."
    );
  }

  return data as Product;
}

export interface ProductFilters {
  name?: string;
  type?: string;
  brand?: string;
}

export interface GetProductsParams {
  filters: ProductFilters;
  page: number;
  pageSize: number;
  columns?: string;
}

export interface GetProductsResult {
  products: Product[];
  total: number;
}

export const PUBLIC_PRODUCT_COLUMNS =
  "id, name, type, brand, price, image_url";

export async function getProductById({
  id,
  columns = "*",
}: {
  id: string;
  columns?: string;
}): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(columns)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message ?? "No se pudo obtener el producto.");
  }

  return (data ?? null) as unknown as Product | null;
}

export async function deleteProduct(productId: string): Promise<void> {
  const { data: row, error: fetchErr } = await supabase
    .from("products")
    .select("image_file_id")
    .eq("id", productId)
    .single();

  if (fetchErr || !row) {
    throw new Error(fetchErr?.message ?? "No se encontró el producto a eliminar.");
  }

  const { error: deleteErr } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (deleteErr) {
    throw new Error(deleteErr.message ?? "No se pudo eliminar el producto.");
  }

  await deleteProductImage((row as { image_file_id: string }).image_file_id);
}

export async function getProducts({
  filters,
  page,
  pageSize,
  columns = "*",
}: GetProductsParams): Promise<GetProductsResult> {
  const name = filters.name?.trim() ?? "";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select(columns, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (name) {
    query = query.ilike("name", `%${name}%`);
  }
  if (filters.type) {
    query = query.eq("type", filters.type);
  }
  if (filters.brand) {
    query = query.eq("brand", filters.brand);
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error(error.message ?? "No se pudieron obtener los productos.");
  }

  return {
    products: (data ?? []) as unknown as Product[],
    total: count ?? 0,
  };
}