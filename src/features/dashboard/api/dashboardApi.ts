import { apiSlice } from "@/store/baseApi";
import type { DashboardStats, LowStockProduct } from "@/types";

interface LowStockAlerts {
  lowStockCount: number;
  lowStockProducts: LowStockProduct[];
}

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query<{ success: boolean; data: DashboardStats }, void>({
      query: () => "/dashboard/stats",
      providesTags: ["Dashboard"],
    }),
    getLowStockAlerts: builder.query<
      { success: boolean; data: LowStockAlerts },
      void
    >({
      query: () => "/dashboard/low-stock-alerts",
      providesTags: ["Dashboard"],
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetStatsQuery, useLazyGetLowStockAlertsQuery } = dashboardApi;
