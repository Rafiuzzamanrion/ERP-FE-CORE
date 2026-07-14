import { apiSlice } from "@/store/baseApi";
import type { ApiResponse } from "@/types";

interface PermissionRef {
  _id: string;
  key: string;
  description: string;
}

interface Role {
  _id: string;
  name: string;
  permissions: PermissionRef[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export const roleApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<Role[], void>({
      query: () => "/roles",
      transformResponse: (response: ApiResponse<Role[]>) => response.data ?? [],
      providesTags: ["Role"],
    }),
    createRole: builder.mutation<
      ApiResponse<Role>,
      { name: string; permissions?: string[] }
    >({
      query: (body) => ({
        url: "/roles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Role"],
    }),
    updateRole: builder.mutation<
      ApiResponse<Role>,
      { id: string; name?: string; permissions?: string[] }
    >({
      query: ({ id, ...body }) => ({
        url: `/roles/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Role"],
    }),
    deleteRole: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Role"],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleApiSlice;
