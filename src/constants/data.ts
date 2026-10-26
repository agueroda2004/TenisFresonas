export const PRODUCT_TYPES = [
  { value: "tenis", label: "Tenis" },
  { value: "medias", label: "Medias" },
  { value: "chancletas", label: "Chancletas" },
];

const FOOTWEAR_SIZES = [
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
];

// Tallas estáticas por tipo de producto (solo se muestran en el detalle).
export const PRODUCT_SIZES: Record<string, string[]> = {
  tenis: FOOTWEAR_SIZES,
  chancletas: FOOTWEAR_SIZES,
  medias: ["S", "M", "L"],
};

export const PRODUCT_BRANDS = [
  { value: "nike", label: "Nike" },
  { value: "adidas", label: "Adidas" },
  { value: "newBalance", label: "New Balance" },
  { value: "jordan", label: "Jordan" },
  { value: "asics", label: "Asícs" },
  { value: "puma", label: "Puma" },
  { value: "converse", label: "Converse" },
  { value: "vans", label: "Vans" },
];
