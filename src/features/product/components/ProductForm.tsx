import { useState, type FormEvent } from "react";
import { Input } from "../../../shared/components/Input";
import { Dropdown } from "../../../shared/components/Dropdown";
import { PriceInput } from "../../../shared/components/PriceInput";
import { ImageUploader } from "../../../shared/components/ImageUploader";
import { Spinner } from "../../../shared/components/Spinner";
import { notifyError, notifySuccess } from "../../../shared/utils/notify";
import { parseCRCToNumber } from "../../../shared/utils/formatCurrency";
import { PRODUCT_TYPES, PRODUCT_BRANDS } from "../../../constants/data";
import {
  productCreateSchema,
  type ProductFieldErrors,
} from "../product.schema";
import { useProduct } from "../hooks/useProduct";

interface ProductFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

function resetForm(setters: {
  setName: (v: string) => void;
  setType: (v: string | null) => void;
  setBrand: (v: string | null) => void;
  setPrice: (v: string) => void;
  setImage: (v: File | null) => void;
  setFieldErrors: (v: ProductFieldErrors) => void;
  setFormError: (v: string | null) => void;
}) {
  setters.setName("");
  setters.setType(null);
  setters.setBrand(null);
  setters.setPrice("");
  setters.setImage(null);
  setters.setFieldErrors({});
  setters.setFormError(null);
}

export function ProductForm({ onCancel, onSuccess }: ProductFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const { createProduct, isCreating, uploadImage, isUploading, deleteImage } =
    useProduct();

  function mapZodErrors(errs: import("zod").ZodError): ProductFieldErrors {
    const result: ProductFieldErrors = {};
    for (const issue of errs.issues) {
      const key = issue.path[0] as
        | "name"
        | "type"
        | "brand"
        | "price"
        | "image"
        | undefined;
      if (key && !result[key]) result[key] = issue.message;
    }
    return result;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    // 1) Zod validation
    const parsed = productCreateSchema.safeParse({
      name,
      type,
      brand,
      price: parseCRCToNumber(price),
      image,
    });

    if (!parsed.success) {
      setFieldErrors(mapZodErrors(parsed.error));
      return;
    }

    if (!image) {
      setFieldErrors({ image: "Sube una imagen." });
      return;
    }

    let uploadedFileId: string | null = null;

    try {
      // 2) Upload image → ImageKit via edge function
      const upload = await uploadImage(parsed.data.image);
      if (!upload.ok || !upload.data) {
        const msg = upload.error ?? "No se pudo subir la imagen.";
        setFormError(msg);
        notifyError(msg);
        return;
      }

      uploadedFileId = upload.data.fileId;

      // 3) Create product
      await createProduct({
        name: parsed.data.name,
        type: parsed.data.type,
        brand: parsed.data.brand,
        price: parsed.data.price,
        image_url: upload.data.url,
        image_file_id: upload.data.fileId,
      });

      notifySuccess("Producto creado correctamente.");
      resetForm({
        setName,
        setType,
        setBrand,
        setPrice,
        setImage,
        setFieldErrors,
        setFormError,
      });
      onSuccess?.();
      onCancel();
    } catch (err) {
      // 4) Rollback: delete uploaded image to avoid orphans
      if (uploadedFileId) {
        await deleteImage(uploadedFileId);
      }
      const message =
        err instanceof Error ? err.message : "No se pudo crear el producto.";
      setFormError(message);
      notifyError(message);
    }
  }

  const submitting = isUploading || isCreating;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full flex-col gap-5"
      aria-busy={submitting}
    >
      {formError && (
        <div
          role="alert"
          aria-live="assertive"
          className="border border-primary bg-primary/5 px-4 py-3 text-sm font-medium text-primary"
        >
          {formError}
        </div>
      )}

      <Input
        label="Nombre"
        name="name"
        type="text"
        placeholder="Ej. Nike Air Max 90"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={fieldErrors.name}
        disabled={submitting}
      />

      <Dropdown
        label="Tipo de producto"
        options={PRODUCT_TYPES}
        value={type}
        onChange={setType}
        placeholder="Selecciona un tipo"
        error={fieldErrors.type}
        disabled={submitting}
      />

      <Dropdown
        label="Marca"
        options={PRODUCT_BRANDS}
        value={brand}
        onChange={setBrand}
        placeholder="Selecciona una marca"
        error={fieldErrors.brand}
        disabled={submitting}
      />

      <PriceInput
        label="Precio (colones)"
        value={price}
        onChange={setPrice}
        error={fieldErrors.price}
        showFormattedHint={!fieldErrors.price}
      />

      <ImageUploader
        value={image}
        onChange={setImage}
        error={fieldErrors.image}
        disabled={submitting}
      />

      <footer className="mt-2 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex h-12 items-center justify-center border border-foreground bg-background px-6 text-sm font-bold uppercase tracking-wider text-foreground transition hover:bg-muted active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex h-12 items-center justify-center gap-2 bg-primary px-6 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Spinner size="sm" className="text-primary-foreground" />
              <span>Creando producto…</span>
            </>
          ) : (
            <span>Crear producto</span>
          )}
        </button>
      </footer>
    </form>
  );
}