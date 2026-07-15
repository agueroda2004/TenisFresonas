import { z } from "zod";
import { PRODUCT_BRANDS, PRODUCT_TYPES } from "../../constants/data";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "../../shared/components/imageUploader.constants";

const PRODUCT_TYPE_VALUES = PRODUCT_TYPES.map((t) => t.value) as [
  string,
  ...string[],
];
const PRODUCT_BRAND_VALUES = PRODUCT_BRANDS.map((b) => b.value) as [
  string,
  ...string[],
];

export const productCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(120, "Máximo 120 caracteres."),
  type: z.enum(PRODUCT_TYPE_VALUES, {
    error: () => ({ message: "Selecciona un tipo de producto." }),
  }),
  brand: z.enum(PRODUCT_BRAND_VALUES, {
    error: () => ({ message: "Selecciona una marca." }),
  }),
  price: z
    .number({ error: "Ingresa un precio válido." })
    .positive("El precio debe ser mayor a 0.")
    .max(99_999_999.99, "Precio demasiado grande."),
  image: z
    .instanceof(File, { error: "Sube una imagen." })
    .refine((f) => ACCEPTED_IMAGE_TYPES.includes(f.type), {
      message: "Formato no permitido.",
    })
    .refine((f) => f.size <= MAX_IMAGE_SIZE_BYTES, {
      message: "La imagen supera 5 MB.",
    }),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;

export type ProductFieldErrors = Partial<
  Record<keyof Omit<ProductCreateInput, "image"> | "image", string>
>;