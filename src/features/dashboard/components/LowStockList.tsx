import { memo } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { slideUp } from "@/lib/motion";
import type { LowStockProduct } from "@/types";
import { cn } from "@/lib/utils";

interface LowStockListProps {
  products: LowStockProduct[];
  isLoading?: boolean;
}

export default memo(function LowStockList({
  products,
  isLoading = false,
}: LowStockListProps) {
  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
          {products.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {products.length} items
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ) : products.length === 0 ? (
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              All stock levels healthy
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No products are running low
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <motion.div
                key={product._id}
                variants={slideUp}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-shadow"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    product.stockQuantity === 0
                      ? "bg-destructive/10 text-destructive"
                      : "bg-warning/10 text-warning"
                  )}
                >
                  {product.stockQuantity === 0 ? (
                    <Package className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {product.sku}
                  </p>
                </div>
                <Badge
                  variant={
                    product.stockQuantity === 0 ? "destructive" : "warning"
                  }
                >
                  {product.stockQuantity} left
                </Badge>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
