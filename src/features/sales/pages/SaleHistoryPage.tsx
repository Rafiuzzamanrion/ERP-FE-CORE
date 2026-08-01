import { useState, useMemo } from "react";
import { Eye, Plus, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import PageHeader from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { useGetSalesQuery } from "../api/saleApi";
import { popup } from "@/components/shared/popup";
import type { Sale } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

export default function SaleHistoryPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isFetching } = useGetSalesQuery({
    page,
    limit,
    sort: "-createdAt",
    search: searchInput || undefined,
  });

  const sales = data?.data ?? [];
  const meta = data?.meta;

  const columns: ColumnDef<Sale>[] = useMemo(
    () => [
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
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-medium">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "items",
        header: "# Items",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-medium shadow-sm">
            {row.original.items.length} items
          </Badge>
        ),
      },
      {
        accessorKey: "grandTotal",
        header: "Grand Total",
        cell: ({ row }) => (
          <span className="font-bold text-primary">
            {formatCurrency(row.original.grandTotal)}
          </span>
        ),
      },
      {
        accessorKey: "soldBy",
        header: "Sold By",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {typeof row.original.soldBy === "object" &&
            row.original.soldBy !== null
              ? row.original.soldBy.name
              : "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const sale = row.original;
          return (
            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                size="icon"
                aria-label="View sale details"
                onClick={() => setSelectedSale(sale)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sale History"
        description="View and track all sales transactions"
      >
        <Button asChild>
          <Link href="/sales/new">
            <Plus className="h-4 w-4 mr-1.5" />
            New Sale
          </Link>
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={sales}
        isLoading={isLoading || isFetching}
        skeletonRows={7}
        enableSearch
        searchPlaceholder="Search by product or seller..."
        searchValue={searchInput}
        onSearchChange={(val) => {
          setSearchInput(val);
          setPage(1);
        }}
        pagination={{
          currentPage: meta?.page ?? 1,
          totalCount: meta?.total ?? 0,
          rowsPerPage: meta?.limit ?? 10,
          pageSizeOptions: [10, 20, 50],
          onPageChange: setPage,
          onRowsPerPageChange: (size) => {
            setLimit(size);
            setPage(1);
          },
        }}
        bulkActions={[
          {
            label: "Export selected",
            icon: <Download className="h-3.5 w-3.5" />,
            variant: "outline",
            onClick: (rows) =>
              popup.success(`Exporting ${rows.length} sales records…`),
          },
        ]}
        emptyTitle={searchInput ? "No sales match your search" : "No sales yet"}
        emptyDescription={
          searchInput
            ? "Try a different search term."
            : "Create your first sale to get started."
        }
      />

      <Dialog
        open={!!selectedSale}
        onOpenChange={(open) => {
          if (!open) setSelectedSale(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Sale Details —{" "}
              {selectedSale &&
                new Date(selectedSale.createdAt).toLocaleDateString()}
            </DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="border border-border/60 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {item.productName}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-bold">Grand Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(selectedSale.grandTotal)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
