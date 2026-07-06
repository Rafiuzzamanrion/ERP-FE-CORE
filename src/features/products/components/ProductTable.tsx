import { Link } from "react-router-dom";
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
import { useAppSelector } from "@/app/hooks";
import type { Product, PaginationMeta } from "@/types";

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
}

function getStockVariant(qty: number): "success" | "warning" | "destructive" {
  if (qty > 10) return "success";
  if (qty >= 5) return "warning";
  return "destructive";
}

export default function ProductTable({
  products,
  isLoading,
  meta,
  onPageChange,
  onDelete,
}: ProductTableProps) {
  const user = useAppSelector((state) => state.auth.user);
  const isEmployee = user?.role === "employee";

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Purchase Price</TableHead>
            <TableHead className="text-right">Selling Price</TableHead>
            <TableHead className="text-center">Stock</TableHead>
            {!isEmployee && <TableHead className="w-24 text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isLoading && products.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={isEmployee ? 7 : 8}
                className="text-center text-muted-foreground py-8"
              >
                No products found
              </TableCell>
            </TableRow>
          )}
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    N/A
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="font-mono text-xs">{product.sku}</TableCell>
              <TableCell>
                <Badge variant="secondary">{product.category}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(product.purchasePrice)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(product.sellingPrice)}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={getStockVariant(product.stockQuantity)}>
                  {product.stockQuantity}
                </Badge>
              </TableCell>
              {!isEmployee && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/products/${product._id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
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

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => onPageChange(meta.page - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === meta.page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPageChange(meta.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
