import { apiSlice } from "@/store/baseApi";
import type { LoginInput, LoginResponse } from "@/types";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginInput>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    getMe: builder.query<
      {
        success: boolean;
        data: {
          _id: string;
          name: string;
          email: string;
          role: string;
          isActive: boolean;
        };
      },
      void
    >({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery } = authApi;
