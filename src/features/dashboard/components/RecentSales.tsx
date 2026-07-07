import { memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { slideUp } from "@/lib/motion";
import type { RecentSale } from "@/types";

interface RecentSalesProps {
  sales: RecentSale[];
}

export default memo(function RecentSales({ sales }: RecentSalesProps) {
  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sales.map((sale, index) => (
            <motion.div
              key={sale._id}
              variants={slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.05 }}
              className="flex items-start justify-between p-3 rounded-xl border bg-card hover:shadow-sm transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {sale.items
                    .map((item) => `${item.productName} (${item.quantity})`)
                    .join(", ")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {sale.soldBy.name} ·{" "}
                  {new Date(sale.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="text-sm font-semibold text-primary">
                  {formatCurrency(sale.grandTotal)}
                </p>
                <Badge variant="secondary" className="text-[10px] mt-1">
                  {sale.items.length} item{sale.items.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
