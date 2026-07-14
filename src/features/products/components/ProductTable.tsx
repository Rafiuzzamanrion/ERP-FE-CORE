import { memo } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { Pagination } from "@/components/shared/Pagination";
import type { Product, PaginationMeta } from "@/types";

interface ProductTableProps {
  products: Product[];
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
}

function getStockVariant(qty: number): "success" | "warning" | "destructive" {
  if (qty > 10) return "success";
  if (qty >= 5) return "warning";
  return "destructive";
}

export default memo(function ProductTable({
  products,
  meta,
  onPageChange,
  onDelete,
}: ProductTableProps) {
  const user = useAppSelector((state) => state.auth.user);
  const isEmployee = user?.role === "employee";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Product</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Purchase</TableHead>
              <TableHead className="text-right">Selling</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              {!isEmployee && (
                <TableHead className="w-24 text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id} className="group">
                <TableCell>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-11 w-11 rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground border">
                      N/A
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {product.sku}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrency(product.purchasePrice)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(product.sellingPrice)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getStockVariant(product.stockQuantity)}>
                    {product.stockQuantity}
                  </Badge>
                </TableCell>
                {!isEmployee && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        aria-label={`Edit ${product.name}`}
                      >
                        <Link href={`/products/${product._id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${product.name}`}
                        onClick={() => onDelete(product._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
});
