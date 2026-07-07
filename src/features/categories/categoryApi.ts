import { apiSlice } from "@/lib/baseQuery";
import type { ApiResponse, PaginationMeta } from "@/types";

export interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface GetCategoriesParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

interface GetCategoriesResult {
  data: Category[];
  meta: PaginationMeta;
}

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<
      GetCategoriesResult,
      GetCategoriesParams | void
    >({
      query: (params) => ({
        url: "/categories",
        params: params || undefined,
      }),
      transformResponse: (response: ApiResponse<Category[]>) => ({
        data: response.data ?? [],
        meta: response.meta ?? {
          page: 1,
          limit: response.data?.length ?? 0,
          total: response.data?.length ?? 0,
          totalPages: 1,
        },
      }),
      providesTags: ["Category"],
    }),
    getCategory: builder.query<ApiResponse<Category>, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Category", id }],
    }),
    createCategory: builder.mutation<
      ApiResponse<Category>,
      { name: string; description?: string }
    >({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation<
      ApiResponse<Category>,
      { id: string; name?: string; description?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApiSlice;
