"use client";

import { memo, useMemo, useState } from "react";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Download, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import type { RecentSale } from "@/types";
import { DataTable } from "@/components/shared/DataTable";
import { popup } from "@/components/shared/popup";

interface RecentSalesProps {
  sales: RecentSale[];
  isLoading?: boolean;
}

export default memo(function RecentSales({
  sales,
  isLoading = false,
}: RecentSalesProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [search, setSearch] = useState("");

  // Client-side search for this pre-fetched dataset.
  // In a real paginated API endpoint, pass `search` to the query params instead.
  const filtered = useMemo(() => {
    if (!search.trim()) return sales;
    const lower = search.toLowerCase();
    return sales.filter((s) => {
      const itemMatch = s.items.some((i) =>
        i.productName.toLowerCase().includes(lower)
      );
      const soldByMatch = s.soldBy.name.toLowerCase().includes(lower);
      return itemMatch || soldByMatch;
    });
  }, [sales, search]);

  const totalCount = filtered.length;
  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const columns: ColumnDef<RecentSale>[] = useMemo(
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
        accessorKey: "items",
        header: "Products",
        cell: ({ row }) => {
          const items = row.original.items;
          const label = items
            .slice(0, 2)
            .map((i) => `${i.productName} (${i.quantity})`)
            .join(", ");
          return (
            <div className="flex flex-col min-w-0">
              <span
                className="font-medium text-foreground truncate max-w-[220px]"
                title={label}
              >
                {label}
                {items.length > 2 && "…"}
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "soldBy.name",
        header: "Sold By",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-normal text-xs">
            {row.original.soldBy.name}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-4 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm whitespace-nowrap">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "grandTotal",
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              className="hover:bg-transparent pr-0"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Amount
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-semibold text-primary whitespace-nowrap">
            {formatCurrency(row.original.grandTotal)}
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const sale = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(sale._id);
                    popup.success("Order ID copied to clipboard");
                  }}
                >
                  Copy Order ID
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Download Receipt
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  return (
    <DataTable
      className="flex flex-col h-[calc(100vh-12rem)] relative bg-card/50 backdrop-blur-sm"
      headerNode={
        <>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <CardHeader className="pb-5 pt-6 px-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <CardTitle className="text-xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Recent Sales
                  </CardTitle>
                </div>
                <p className="text-sm text-muted-foreground ml-10">
                  Manage and review your latest transactions and orders.
                </p>
              </div>
            </div>
          </CardHeader>
        </>
      }
      columns={columns}
      data={paginated}
      isLoading={isLoading}
      skeletonRows={5}
      emptyTitle={search ? "No sales match your search" : "No sales yet"}
      emptyDescription={
        search
          ? "Try a different product name or staff member."
          : "Sales will appear here once orders are created."
      }
      enableSearch
      searchPlaceholder="Search products or staff…"
      searchValue={search}
      onSearchChange={(val) => {
        setSearch(val);
        setCurrentPage(1);
      }}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      bulkActions={[
        {
          label: "Export selected",
          icon: <Download className="h-3.5 w-3.5" />,
          variant: "outline",
          onClick: (rows) => popup.success(`Exporting ${rows.length} records…`),
        },
        {
          label: "Delete selected",
          icon: <Trash2 className="h-3.5 w-3.5" />,
          variant: "destructive",
          onClick: (rows) => popup.error(`Deleted ${rows.length} records`),
        },
      ]}
      pagination={{
        currentPage,
        totalCount,
        rowsPerPage,
        pageSizeOptions: [5, 10, 20],
        onPageChange: setCurrentPage,
        onRowsPerPageChange: (size) => {
          setRowsPerPage(size);
          setCurrentPage(1);
        },
      }}
    />
  );
});
