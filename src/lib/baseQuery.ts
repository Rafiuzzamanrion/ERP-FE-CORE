import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../app/store";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
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
    const { logout } = await import("../features/auth/authSlice");
    api.dispatch(logout());
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
  endpoints: () => ({}),
});
