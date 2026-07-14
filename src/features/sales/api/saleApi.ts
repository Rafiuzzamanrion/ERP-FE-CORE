import { apiSlice } from "@/store/baseApi";
import type { CreateSaleInput, PaginatedResponse, Sale } from "@/types";

export const saleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createSale: builder.mutation<
      { success: boolean; message: string; data: Sale },
      CreateSaleInput
    >({
      query: (body) => ({
        url: "/sales",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Sale", "Product", "Dashboard"],
    }),
    getSales: builder.query<
      PaginatedResponse<Sale>,
      { page?: number; limit?: number; sort?: string; search?: string }
    >({
      query: (params) => ({
        url: "/sales",
        params,
      }),
      providesTags: ["Sale"],
    }),
    getSale: builder.query<
      { success: boolean; message: string; data: Sale },
      string
    >({
      query: (id) => `/sales/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Sale", id }],
    }),
  }),
});

export const { useCreateSaleMutation, useGetSalesQuery, useGetSaleQuery } =
  saleApi;
