import { memo, useMemo } from "react";
import Link from "next/link";
import { Pencil, Trash2, SlidersHorizontal, Download } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { DataTable } from "@/components/shared/DataTable";
import { popup } from "@/components/shared/popup";
import type { Product, PaginationMeta } from "@/types";
import { ReactNode } from "react";

interface ProductTableProps {
  products: Product[];
  meta?: PaginationMeta;
  isLoading?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  setCurrentPage: (page: number) => void;
  setRowsPerPage: (limit: number) => void;
  onDelete: (id: string) => void;
  extraToolbar?: ReactNode;
}

function getStockVariant(qty: number): "success" | "warning" | "destructive" {
  if (qty > 10) return "success";
  if (qty >= 5) return "warning";
  return "destructive";
}

export default memo(function ProductTable({
  products,
  meta,
  isLoading,
  search,
  onSearchChange,
  setCurrentPage,
  setRowsPerPage,
  onDelete,
  extraToolbar,
}: ProductTableProps) {
  const user = useAppSelector((state) => state.auth.user);
  const isEmployee = user?.role === "employee";

  const columns: ColumnDef<Product>[] = useMemo(() => {
    const cols: ColumnDef<Product>[] = [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "image",
        header: "Product",
        cell: ({ row }) => {
          const product = row.original;
          return product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-11 w-11 rounded-lg object-cover border border-border/60 shadow-sm"
            />
          ) : (
            <div className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center text-[10px] text-muted-foreground border border-border/60">
              N/A
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium text-foreground">
            {row.getValue("name")}
          </div>
        ),
      },
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ row }) => (
          <div className="font-mono text-xs text-muted-foreground">
            {row.getValue("sku")}
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <Badge variant="secondary" className="capitalize font-normal text-xs">
            {row.getValue("category")}
          </Badge>
        ),
      },
      {
        accessorKey: "purchasePrice",
        header: () => <div className="text-right">Purchase</div>,
        cell: ({ row }) => (
          <div className="text-right text-muted-foreground text-sm whitespace-nowrap">
            {formatCurrency(row.getValue("purchasePrice"))}
          </div>
        ),
      },
      {
        accessorKey: "sellingPrice",
        header: () => <div className="text-right">Selling</div>,
        cell: ({ row }) => (
          <div className="text-right font-semibold text-primary whitespace-nowrap">
            {formatCurrency(row.getValue("sellingPrice"))}
          </div>
        ),
      },
      {
        accessorKey: "stockQuantity",
        header: () => <div className="text-center">Stock</div>,
        cell: ({ row }) => {
          const qty = row.getValue("stockQuantity") as number;
          return (
            <div className="flex justify-center">
              <Badge
                variant={getStockVariant(qty)}
                className="font-semibold shadow-sm"
              >
                {qty}
              </Badge>
            </div>
          );
        },
      },
    ];

    if (!isEmployee) {
      cols.push({
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const product = row.original;
          return (
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
          );
        },
      });
    }

    return cols;
  }, [isEmployee, onDelete]);

  return (
    <DataTable
      columns={columns}
      data={products}
      isLoading={isLoading}
      skeletonRows={6}
      enableSearch
      searchPlaceholder="Search products by name or SKU…"
      searchValue={search}
      onSearchChange={onSearchChange}
      extraToolbar={extraToolbar}
      pagination={{
        currentPage: meta?.page ?? 1,
        totalCount: meta?.total ?? 0,
        rowsPerPage: meta?.limit ?? 10,
        pageSizeOptions: [10, 20, 50, 100],
        setCurrentPage,
        setRowsPerPage,
      }}
      bulkActions={[
        {
          label: "Export selected",
          icon: <Download className="h-3.5 w-3.5" />,
          variant: "outline",
          onClick: (rows) =>
            popup.success(`Exporting ${rows.length} products…`),
        },
        ...(!isEmployee
          ? [
              {
                label: "Delete selected",
                icon: <Trash2 className="h-3.5 w-3.5" />,
                variant: "destructive" as const,
                onClick: (rows: Product[]) =>
                  popup.error(`Deleted ${rows.length} products`),
              },
            ]
          : []),
      ]}
      emptyTitle="No products found"
      emptyDescription="Try adjusting your filters or search query."
    />
  );
});
