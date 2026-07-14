import { apiSlice } from "@/store/baseApi";
import type { Product, PaginationMeta, ApiResponse } from "@/types";

interface GetProductsParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

interface GetProductsResult {
  data: Product[];
  meta: PaginationMeta;
}

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<GetProductsResult, GetProductsParams>({
      query: (params) => ({
        url: "/products",
        params,
      }),
      transformResponse: (response: {
        data: Product[];
        meta: PaginationMeta;
      }) => ({
        data: response.data,
        meta: response.meta,
      }),
      providesTags: ["Product"],
    }),
    getProduct: builder.query<ApiResponse<Product>, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: "ProductDetail", id }],
    }),
    createProduct: builder.mutation<ApiResponse<Product>, FormData>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation<
      ApiResponse<Product>,
      { id: string; body: FormData }
    >({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Product",
        { type: "ProductDetail", id },
      ],
    }),
    deleteProduct: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        "Product",
        { type: "ProductDetail", id },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApiSlice;
