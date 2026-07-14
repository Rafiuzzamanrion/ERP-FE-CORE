import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store";

import env from "@/config/env";

export const baseQuery = fetchBaseQuery({
  baseUrl: env.apiUrl,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: typeof baseQuery = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    const { logout } = await import("@/features/auth/api/authSlice");
    api.dispatch(logout());
    document.cookie = "token=; path=/; max-age=0";
    window.location.href = "/login";
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Product",
    "ProductDetail",
    "Sale",
    "Dashboard",
    "Auth",
    "User",
    "Role",
    "Category",
  ],
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
