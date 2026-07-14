import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { io as socketIO } from "socket.io-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { apiSlice } from "@/store/baseApi";
import { staggerContainer, pageTransition } from "@/lib/motion";
import { formatCurrency } from "@/lib/utils";
import {
  useGetStatsQuery,
  useLazyGetLowStockAlertsQuery,
} from "../api/dashboardApi";
import { default as LowStockListComponent } from "../components/LowStockList";
import { StatCard } from "@/components/shared/StatCard";
import DashboardSkeleton from "@/components/shared/DashboardSkeleton";
import RevenueChart from "../components/RevenueChart";
import CategoryChart from "../components/CategoryChart";
import RecentSales from "../components/RecentSales";

import env from "@/config/env";

const SOCKET_URL = env.socketUrl;

const POLL_INTERVAL = 15_000;

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const { data, isLoading, isError, error, refetch } = useGetStatsQuery();
  const prevLowStockRef = useRef<string[]>([]);
  const [fetchLowStockAlerts] = useLazyGetLowStockAlertsQuery();

  const checkForNewLowStock = useCallback(async () => {
    try {
      const result = await fetchLowStockAlerts().unwrap();
      if (!result.data) return;

      const currentIds = result.data.lowStockProducts.map((p) => p._id);
      const prevIds = prevLowStockRef.current;
      const newIds = currentIds.filter((id) => !prevIds.includes(id));

      for (const id of newIds) {
        const product = result.data.lowStockProducts.find((p) => p._id === id);
        if (product) {
          toast.warning(
            `${product.name} is running low on stock (${product.stockQuantity} remaining)`
          );
          dispatch(apiSlice.util.invalidateTags(["Dashboard"]));
        }
      }

      prevLowStockRef.current = currentIds;
    } catch {
      toast.error("Failed to fetch low stock alerts");
    }
  }, [fetchLowStockAlerts, dispatch]);

  useEffect(() => {
    if (!token) return;

    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let connectionTimeout: ReturnType<typeof setTimeout>;

    const socket = socketIO(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 2,
      timeout: 5_000,
    });

    connectionTimeout = setTimeout(() => {
      if (!socket.connected) {
        socket.close();
        pollTimer = setInterval(checkForNewLowStock, POLL_INTERVAL);
        checkForNewLowStock();
      }
    }, 3_000);

    socket.on("connect", () => {
      clearTimeout(connectionTimeout);
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    });

    socket.on("stock:low", (alertData: unknown) => {
      const data =
        alertData && typeof alertData === "object" && "name" in alertData
          ? (alertData as { name: string; stockQuantity: number })
          : null;
      const message = data
        ? `${data.name} is running low on stock (${data.stockQuantity} remaining)`
        : "A product is running low on stock";
      toast.warning(message);
      dispatch(apiSlice.util.invalidateTags(["Dashboard"]));
    });

    return () => {
      clearTimeout(connectionTimeout);
      if (pollTimer) clearInterval(pollTimer);
      socket.close();
    };
  }, [token, dispatch, checkForNewLowStock]);

  if (isLoading) {
    return (
      <motion.div variants={pageTransition} initial="hidden" animate="visible">
        <DashboardSkeleton />
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-center py-24"
      >
        <p className="text-lg text-destructive">
          {error && "data" in error && error.data
            ? (error.data as { message?: string }).message
            : "Failed to load dashboard data"}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </motion.div>
    );
  }

  const stats = data?.data;

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your inventory and sales performance
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Total Products"
          value={String(stats?.totalProducts ?? 0)}
          icon={<Package className="h-5 w-5" />}
          accent="teal"
          index={0}
          sparklineData={stats?.categoryRevenue.map((c) => c.revenue)}
        />
        <StatCard
          title="Total Sales"
          value={String(stats?.totalSales ?? 0)}
          icon={<ShoppingCart className="h-5 w-5" />}
          accent="blue"
          index={1}
          sparklineData={stats?.dailyRevenue.map((d) => d.sales)}
        />
        <StatCard
          title="Low Stock"
          value={String(stats?.lowStockCount ?? 0)}
          icon={<AlertTriangle className="h-5 w-5" />}
          accent="amber"
          index={2}
          sparklineData={stats?.lowStockProducts.map((p) => p.stockQuantity)}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          icon={<DollarSign className="h-5 w-5" />}
          accent="rose"
          index={3}
          sparklineData={stats?.dailyRevenue.map((d) => d.revenue)}
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={stats?.dailyRevenue ?? []} />
        </div>
        <LowStockListComponent products={stats?.lowStockProducts ?? []} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-xl border bg-card shadow-sm p-6 h-full min-h-[420px]">
          <CategoryChart data={stats?.categoryRevenue ?? []} />
        </div>
        <div className="lg:col-span-2">
          <RecentSales sales={stats?.recentSales ?? []} />
        </div>
      </div>
    </motion.div>
  );
}
