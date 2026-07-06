import { useEffect } from "react";
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
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { apiSlice } from "@/lib/baseQuery";
import { staggerContainer, pageTransition } from "@/lib/motion";
import { formatCurrency } from "@/lib/utils";
import { useGetStatsQuery } from "../dashboardApi";
import { default as LowStockListComponent } from "../components/LowStockList";
import { StatCard } from "@/components/shared/StatCard";
import DashboardSkeleton from "@/components/shared/DashboardSkeleton";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const { data, isLoading, isError, error, refetch } = useGetStatsQuery();

  useEffect(() => {
    if (!token) return;

    const socket = socketIO("http://localhost:5000", {
      auth: { token },
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
      socket.disconnect();
    };
  }, [token, dispatch]);

  if (isLoading) {
    return (
      <motion.div
        variants={pageTransition}
        initial="hidden"
        animate="visible"
      >
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
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => refetch()}
        >
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
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
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
        />
        <StatCard
          title="Total Sales"
          value={String(stats?.totalSales ?? 0)}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatCard
          title="Low Stock"
          value={String(stats?.lowStockCount ?? 0)}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </motion.div>

      <LowStockListComponent
        products={stats?.lowStockProducts ?? []}
        isLoading={isLoading}
      />
    </motion.div>
  );
}
