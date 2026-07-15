import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  getProductById,
  getProducts,
  uploadProductImage,
  type GetProductsResult,
  type ProductFilters,
} from "../services/product.service";
import type {
  CreateProductPayload,
  DeleteImageResult,
  Product,
  UploadImageResult,
} from "../product.d";

export const PRODUCTS_QUERY_KEY = ["products"] as const;

function productsListKey(
  filters: ProductFilters,
  page: number,
  pageSize: number,
  columns: string
) {
  return [...PRODUCTS_QUERY_KEY, "list", { filters, page, pageSize, columns }] as const;
}

interface UseProductArgs {
  id?: string;
  filters?: ProductFilters;
  page?: number;
  pageSize?: number;
  columns?: string;
}

export function useProduct(args: UseProductArgs = {}) {
  const queryClient = useQueryClient();

  const filters = args.filters ?? {};
  const page = args.page ?? 1;
  const pageSize = args.pageSize ?? 12;
  const columns = args.columns ?? "*";

  const listQuery = useQuery<GetProductsResult>({
    queryKey: productsListKey(filters, page, pageSize, columns),
    queryFn: () => getProducts({ filters, page, pageSize, columns }),
    enabled: args.pageSize !== undefined && args.page !== undefined,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });

  const detailQuery = useQuery<Product | null, Error>({
    queryKey: [...PRODUCTS_QUERY_KEY, "detail", args.id, args.columns ?? "*"],
    queryFn: () => getProductById({ id: args.id as string, columns: args.columns }),
    enabled: Boolean(args.id),
    staleTime: 60_000,
  });

  const createMutation = useMutation<Product, Error, CreateProductPayload>({
    mutationFn: (payload) => createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });

  const uploadMutation = useMutation<UploadImageResult, Error, File>({
    mutationFn: (file) => uploadProductImage(file),
  });

  const deleteImageMutation = useMutation<DeleteImageResult, Error, string>({
    mutationFn: (fileId) => deleteProductImage(fileId),
  });

  const deleteProductMutation = useMutation<void, Error, string>({
    mutationFn: (productId) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });

  return {
    products: listQuery.data?.products ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    error: listQuery.error,
    refetch: listQuery.refetch,

    product: detailQuery.data ?? null,
    isLoadingProduct: detailQuery.isLoading,
    isFetchingProduct: detailQuery.isFetching,
    productError: detailQuery.error,

    createProduct: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    resetCreate: createMutation.reset,

    uploadImage: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,
    resetUpload: uploadMutation.reset,

    deleteImage: deleteImageMutation.mutateAsync,
    isDeletingImage: deleteImageMutation.isPending,
    deleteImageError: deleteImageMutation.error,
    resetDeleteImage: deleteImageMutation.reset,

    deleteProduct: deleteProductMutation.mutateAsync,
    isDeletingProduct: deleteProductMutation.isPending,
    deleteProductError: deleteProductMutation.error,
    resetDeleteProduct: deleteProductMutation.reset,
  };
}