export interface Product {
  id: string;
  name: string;
  type: string;
  brand: string;
  price: number;
  image_url: string;
  image_file_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductPayload {
  name: string;
  type: string;
  brand: string;
  price: number;
  image_url: string;
  image_file_id: string;
}

export interface UploadedImage {
  url: string;
  thumbnailUrl: string;
  fileId: string;
  name: string;
}

export interface UploadImageResult {
  ok: boolean;
  data?: UploadedImage;
  error?: string;
}

export interface DeleteImageResult {
  ok: boolean;
  error?: string;
}