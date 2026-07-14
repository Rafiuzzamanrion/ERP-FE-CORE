import { apiSlice } from "@/store/baseApi";
import type { User, ApiResponse } from "@/types";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], string | void>({
      query: (search) => ({
        url: "/users",
        params: search ? { search } : undefined,
      }),
      transformResponse: (response: ApiResponse<User[]>) => response.data ?? [],
      providesTags: ["User"],
    }),
    createUser: builder.mutation<
      ApiResponse<User>,
      { name: string; email: string; password: string; role?: string }
    >({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation<
      ApiResponse<User>,
      {
        id: string;
        name?: string;
        email?: string;
        password?: string;
        role?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApiSlice;
