"use client";

import { ReactNode, useId, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  RowSelectionState,
  OnChangeFn,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchInput } from "@/components/shared/SearchInput";
import { NoDataFound } from "@/components/shared/NoDataFound";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ServerPaginationProps {
  /** 1-based current page */
  currentPage: number;
  /** Total number of rows across ALL pages (from the API response) */
  totalCount: number;
  /** How many rows per page */
  rowsPerPage: number;
  /** Available page-size choices */
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (size: number) => void;
}

interface BulkActionConfig<TData> {
  /**
   * Render the action button(s). They receive the array of selected rows
   * AND a boolean `disabled` flag — use it to disable the button when
   * nothing is selected (the toolbar is always visible).
   */
  render: (selectedRows: TData[], disabled: boolean) => ReactNode;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  // Server-side pagination — required for backend-driven tables
  pagination: ServerPaginationProps;

  // Optional server-side search — all debouncing / API calls are in the parent
  enableSearch?: boolean;
  searchPlaceholder?: string;
  /** Controlled search value (parent owns state) */
  searchValue?: string;
  /** Called with the debounced string; parent resets page to 1 + re-fetches */
  onSearchChange?: (value: string) => void;

  // Optional sorting (server-side) — parent owns state
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;

  // Row selection — parent owns state so it can act on selections
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  /**
   * Always-visible bulk action toolbar config.
   * Buttons are disabled when no rows are selected.
   */
  bulkActions?: BulkActionConfig<TData>;

  // Loading / empty states
  isLoading?: boolean;
  /** Number of skeleton rows to show while loading */
  skeletonRows?: number;

  /** Optional extra content to render in the toolbar (e.g. additional filters) */
  extraToolbar?: ReactNode;

  // Empty-state customisation passed through to <NoDataFound>
  emptyTitle?: string;
  emptyDescription?: string;

  /** Optional class override for the root wrapper */
  className?: string;
}

// ---------------------------------------------------------------------------
// Skeleton body — mirrors the real table structure exactly
// ---------------------------------------------------------------------------

function TableSkeletonRows({
  rows,
  columns,
}: {
  rows: number;
  columns: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <TableRow key={rowIdx} className="hover:bg-transparent animate-pulse">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <TableCell key={colIdx}>
              {colIdx === 0 ? (
                <Skeleton className="h-4 w-4 rounded" />
              ) : colIdx === columns - 1 ? (
                <Skeleton className="h-7 w-7 rounded-full" />
              ) : (
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-full rounded" />
                  {colIdx === 1 && <Skeleton className="h-2.5 w-1/2 rounded" />}
                </div>
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// DataTable
// ---------------------------------------------------------------------------

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  enableSearch = false,
  searchPlaceholder = "Search…",
  searchValue = "",
  onSearchChange,
  sorting,
  onSortingChange,
  rowSelection = {},
  onRowSelectionChange,
  bulkActions,
  isLoading = false,
  skeletonRows = 5,
  extraToolbar,
  emptyTitle = "No results found",
  emptyDescription,
  className,
}: DataTableProps<TData, TValue>) {
  const tableId = useId();

  const {
    currentPage,
    totalCount,
    rowsPerPage,
    pageSizeOptions = [10, 20, 30, 50],
    onPageChange,
    onRowsPerPageChange,
  } = pagination;

  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>({});
  const resolvedRowSelection = onRowSelectionChange
    ? rowSelection
    : internalRowSelection;
  const resolvedOnRowSelectionChange =
    onRowSelectionChange || setInternalRowSelection;

  const table = useReactTable({
    data,
    columns,
    getRowId: (row: any, index) => row._id || row.id || index.toString(),
    getCoreRowModel: getCoreRowModel(),
    ...(onSortingChange ? { getSortedRowModel: getSortedRowModel() } : {}),
    onSortingChange,
    onRowSelectionChange: resolvedOnRowSelectionChange,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: totalPages,
    state: {
      ...(sorting ? { sorting } : {}),
      rowSelection: resolvedRowSelection,
    },
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const selectionCount = selectedRows.length;
  const hasSelection = selectionCount > 0;

  const startRow = Math.min(totalCount, (currentPage - 1) * rowsPerPage + 1);
  const endRow = Math.min(currentPage * rowsPerPage, totalCount);
  const showEmpty = !isLoading && data.length === 0;
  const showToolbar = enableSearch || !!bulkActions || !!extraToolbar;

  return (
    <div className={cn("space-y-3 w-full min-w-0", className)}>
      {/* ── Premium Toolbar ── */}
      {showToolbar && (
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
          {/* Subtle gradient accent on the left edge */}
          <div className="absolute inset-y-0 left-0 w-0.5 rounded-l-xl bg-gradient-to-b from-primary/60 via-primary/30 to-transparent" />

          {/* Search */}
          {enableSearch && (
            <div className="flex-1 min-w-0">
              <SearchInput
                key={tableId}
                initialValue={searchValue}
                placeholder={searchPlaceholder}
                onSearch={(val) => {
                  onPageChange(1);
                  onSearchChange?.(val);
                }}
              />
            </div>
          )}

          {/* Extra Toolbar (e.g. Filters) */}
          {extraToolbar && (
            <div className="flex items-center gap-3 shrink-0">
              {extraToolbar}
            </div>
          )}

          {/* Divider (only on sm+) */}
          {(enableSearch || extraToolbar) && bulkActions && (
            <div className="hidden sm:block h-8 w-px bg-border/60 shrink-0" />
          )}

          {/* Bulk Actions — always visible, disabled until selection */}
          {bulkActions && (
            <div className="flex items-center gap-2 shrink-0">
              {/* Selection pill */}
              <motion.div
                animate={{
                  opacity: hasSelection ? 1 : 0,
                  scale: hasSelection ? 1 : 0.8,
                  width: hasSelection ? "auto" : 0,
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {selectionCount}
                  </span>
                  selected
                </div>
              </motion.div>

              {/* The actual action buttons — always rendered */}
              {bulkActions.render(selectedRows, !hasSelection)}
            </div>
          )}
        </div>
      )}

      {/* ── Table ── */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm w-full min-w-0 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableSkeletonRows rows={skeletonRows} columns={columns.length} />
            ) : showEmpty ? null : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {showEmpty && (
          <div className="p-6">
            <NoDataFound
              variant={searchValue ? "search" : "empty"}
              title={emptyTitle}
              description={emptyDescription}
            />
          </div>
        )}
      </div>

      {/* ── Pagination footer ── */}
      {!showEmpty && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 pt-1">
          {/* Left: rows-per-page + entry count */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap justify-center sm:justify-start">
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap text-xs">Rows per page</span>
              <Select
                value={`${rowsPerPage}`}
                onValueChange={(val) => {
                  onRowsPerPageChange(Number(val));
                  onPageChange(1);
                }}
              >
                <SelectTrigger className="h-7 w-[65px] bg-card text-xs border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map((size) => (
                    <SelectItem
                      key={size}
                      value={`${size}`}
                      className="text-xs"
                    >
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="hidden sm:block h-4 w-px bg-border/60" />

            <span className="text-xs">
              {isLoading ? (
                <Skeleton className="h-3.5 w-36 rounded" />
              ) : (
                <>
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {startRow}
                  </span>
                  {" – "}
                  <span className="font-semibold text-foreground">
                    {endRow}
                  </span>
                  {" of "}
                  <span className="font-semibold text-foreground">
                    {totalCount}
                  </span>
                  {" entries"}
                </>
              )}
            </span>
          </div>

          {/* Right: page navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="hidden h-7 w-7 p-0 lg:flex rounded-lg border-border/60 text-muted-foreground hover:text-foreground"
              onClick={() => onPageChange(1)}
              disabled={currentPage <= 1 || isLoading}
              aria-label="First page"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              className="h-7 w-7 p-0 rounded-lg border-border/60 text-muted-foreground hover:text-foreground"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            <div className="px-2 text-xs text-muted-foreground whitespace-nowrap">
              <span className="font-semibold text-foreground">
                {currentPage}
              </span>
              {" / "}
              <span className="font-semibold text-foreground">
                {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              className="h-7 w-7 p-0 rounded-lg border-border/60 text-muted-foreground hover:text-foreground"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-7 w-7 p-0 lg:flex rounded-lg border-border/60 text-muted-foreground hover:text-foreground"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages || isLoading}
              aria-label="Last page"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
