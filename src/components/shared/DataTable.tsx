"use client";

import {
  ReactNode,
  useId,
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  RowSelectionState,
  OnChangeFn,
  VisibilityState,
  Column,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SearchInput } from "@/components/shared/SearchInput";
import { NoDataFound } from "@/components/shared/NoDataFound";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Columns3,
  RefreshCw,
  AlignJustify,
  AlignCenter,
  AlignLeft,
  Download,
  CheckSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Public Types
// ---------------------------------------------------------------------------

export type ButtonVariant =
  "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

export type TableDensity = "compact" | "default" | "comfortable";

export interface BulkAction<TData> {
  label: string;
  icon: ReactNode;
  variant?: ButtonVariant;
  onClick: (selectedRows: TData[]) => void;
  hidden?: (selectedRows: TData[]) => boolean;
}

export interface RowAction<TData> {
  label: string;
  icon?: ReactNode;
  variant?: ButtonVariant;
  onClick: (row: TData) => void;
  hidden?: (row: TData) => boolean;
}

interface ServerPaginationProps {
  currentPage: number;
  totalCount: number;
  rowsPerPage: number;
  pageSizeOptions?: number[];
  setCurrentPage: (page: number) => void;
  setRowsPerPage: (size: number) => void;
}

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination: ServerPaginationProps;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  bulkActions?: BulkAction<TData>[];
  rowActions?: RowAction<TData>[];
  onRowClick?: (row: TData) => void;
  isLoading?: boolean;
  skeletonRows?: number;
  extraToolbar?: ReactNode;
  onRefetch?: () => void;
  enableExport?: boolean;
  exportFilename?: string;
  enableColumnToggle?: boolean;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  enableDensityToggle?: boolean;
  defaultDensity?: TableDensity;
  rowHeight?: string | number;
  emptyTitle?: string;
  emptyDescription?: string;
  headerNode?: ReactNode;
  className?: string;
  tableWrapperClassName?: string;
  tableClassName?: string;
  rowClassName?: string | ((row: TData) => string);
}

// ---------------------------------------------------------------------------
// Skeleton rows
// ---------------------------------------------------------------------------

function TableSkeletonRows<TData, TValue>({
  rows,
  columns,
}: {
  rows: number;
  columns: Column<TData, TValue>[];
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <TableRow key={rowIdx} className="hover:bg-transparent animate-pulse">
          {columns.map((column) => {
            const isSelect = column.id === "select";
            // BUG FIX: was checking "actions" but injected column id is "_actions"
            const isActions = column.id === "_actions";

            return (
              <TableCell key={column.id}>
                {isSelect ? (
                  <Skeleton className="h-4 w-4 rounded" />
                ) : isActions ? (
                  <div className="flex justify-end gap-1">
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                ) : (
                  <Skeleton className="h-4 w-[85%] rounded" />
                )}
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Density config
// ---------------------------------------------------------------------------

const densityClass: Record<TableDensity, string> = {
  compact: "[&_td]:py-1.5 [&_th]:py-2",
  default: "",
  comfortable: "[&_td]:py-4 [&_th]:py-4",
};

const densityIcons: Record<TableDensity, ReactNode> = {
  compact: <AlignJustify className="h-3.5 w-3.5" />,
  default: <AlignCenter className="h-3.5 w-3.5" />,
  comfortable: <AlignLeft className="h-3.5 w-3.5" />,
};

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

function exportToCSV<TData>(
  data: TData[],
  columns: ColumnDef<TData, unknown>[],
  filename: string
) {
  const filtered = columns.filter(
    (col) => col.id !== "select" && col.id !== "_actions"
  );
  const headers = filtered.map((col) => {
    if (typeof col.header === "string") return col.header;
    if ("accessorKey" in col && typeof col.accessorKey === "string")
      return col.accessorKey;
    return col.id ?? "";
  });
  const accessors = filtered.map((col) =>
    "accessorKey" in col && typeof col.accessorKey === "string"
      ? col.accessorKey
      : (col.id ?? "")
  );
  const rows = data.map((row: any) =>
    accessors.map((key) => {
      const val = key.split(".").reduce((acc: any, k: string) => acc?.[k], row);
      if (val === null || val === undefined) return "";
      if (typeof val === "string") return `"${val.replace(/"/g, '""')}"`;
      if (typeof val === "object")
        return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return val;
    })
  );
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Helper: format column id as a readable label
// ---------------------------------------------------------------------------
function formatColumnLabel(id: string): string {
  return id
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\s/, "")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// DataTable
// ---------------------------------------------------------------------------

export function DataTable<TData, TValue = unknown>({
  columns: rawColumns,
  data,
  pagination,
  enableSearch = false,
  searchPlaceholder = "Search\u2026",
  searchValue = "",
  onSearchChange,
  sorting,
  onSortingChange,
  rowSelection = {},
  onRowSelectionChange,
  bulkActions,
  rowActions,
  onRowClick,
  isLoading = false,
  skeletonRows = 5,
  extraToolbar,
  onRefetch,
  enableExport = false,
  exportFilename = "export",
  enableColumnToggle = false,
  columnVisibility: externalColumnVisibility,
  onColumnVisibilityChange,
  enableDensityToggle = false,
  defaultDensity = "default",
  rowHeight,
  emptyTitle = "No results found",
  emptyDescription,
  headerNode,
  className,
  tableWrapperClassName,
  tableClassName,
  rowClassName,
}: DataTableProps<TData, TValue>) {
  const tableId = useId();

  const {
    currentPage,
    totalCount,
    rowsPerPage,
    pageSizeOptions = [10, 20, 30, 50],
    setCurrentPage,
    setRowsPerPage,
  } = pagination;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>({});
  const [internalColumnVisibility, setInternalColumnVisibility] =
    useState<VisibilityState>({});
  const [density, setDensity] = useState<TableDensity>(defaultDensity);
  const [selectAllPages, setSelectAllPages] = useState(false);

  const resolvedRowSelection = onRowSelectionChange
    ? rowSelection
    : internalRowSelection;
  const resolvedOnRowSelectionChange =
    onRowSelectionChange || setInternalRowSelection;
  const resolvedColumnVisibility =
    externalColumnVisibility ?? internalColumnVisibility;
  const resolvedOnColumnVisibilityChange =
    onColumnVisibilityChange ?? setInternalColumnVisibility;

  // BUG FIX: memoize columns to prevent unnecessary re-renders of all rows
  const columns: ColumnDef<TData, any>[] = useMemo(
    () => [
      ...(rawColumns as ColumnDef<TData, any>[]),
      ...(rowActions && rowActions.length > 0
        ? [
            {
              id: "_actions",
              header: () => null,
              enableSorting: false,
              enableHiding: false,
              cell: ({ row }: { row: any }) => {
                const rowData = row.original as TData;
                const visibleActions = rowActions.filter(
                  (a) => !a.hidden?.(rowData)
                );
                if (!visibleActions.length) return null;
                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        <span className="text-base leading-none font-bold">
                          &#8942;
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {visibleActions.map((action, i) => (
                        // BUG FIX: use DropdownMenuItem for proper a11y + keyboard nav
                        <DropdownMenuItem
                          key={i}
                          className={cn(
                            "flex items-center gap-2 cursor-pointer text-sm",
                            action.variant === "destructive" &&
                              "text-destructive focus:text-destructive focus:bg-destructive/10"
                          )}
                          onSelect={(e) => {
                            e.preventDefault();
                            action.onClick(rowData);
                          }}
                        >
                          {action.icon && (
                            <span className="h-3.5 w-3.5 flex items-center">
                              {action.icon}
                            </span>
                          )}
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              },
            } as ColumnDef<TData, any>,
          ]
        : []),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawColumns, rowActions]
  );

  const table = useReactTable({
    data,
    columns,
    getRowId: (row: any, index) => row._id || row.id || index.toString(),
    getCoreRowModel: getCoreRowModel(),
    ...(onSortingChange ? { getSortedRowModel: getSortedRowModel() } : {}),
    onSortingChange,
    onRowSelectionChange: resolvedOnRowSelectionChange,
    onColumnVisibilityChange: resolvedOnColumnVisibilityChange,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: totalPages,
    state: {
      ...(sorting ? { sorting } : {}),
      rowSelection: resolvedRowSelection,
      columnVisibility: resolvedColumnVisibility,
    },
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const selectionCount = selectAllPages ? totalCount : selectedRows.length;
  const hasSelection = selectAllPages || selectedRows.length > 0;
  const allPageRowsSelected = table.getIsAllRowsSelected();

  // BUG FIX: startRow shows correct value when totalCount is 0
  const startRow =
    totalCount === 0
      ? 0
      : Math.min(totalCount, (currentPage - 1) * rowsPerPage + 1);
  const endRow = Math.min(currentPage * rowsPerPage, totalCount);
  const showEmpty = !isLoading && data.length === 0;
  const showToolbar =
    enableSearch ||
    !!bulkActions?.length ||
    !!extraToolbar ||
    !!onRefetch ||
    enableColumnToggle ||
    enableDensityToggle ||
    enableExport;

  const cycleDensity = useCallback(() => {
    setDensity((d) =>
      d === "compact" ? "default" : d === "default" ? "comfortable" : "compact"
    );
  }, []);

  // BUG FIX: was calling setSelectAllPages directly in render (anti-pattern).
  // Use useEffect to reset selectAllPages when selection is cleared.
  const prevCountRef = useRef(selectedRows.length);
  useEffect(() => {
    if (
      selectAllPages &&
      selectedRows.length === 0 &&
      prevCountRef.current > 0
    ) {
      setSelectAllPages(false);
    }
    prevCountRef.current = selectedRows.length;
  }, [selectAllPages, selectedRows.length]);

  // BUG FIX: density class must apply when rowHeight is NOT set
  const tableBodyClass = rowHeight
    ? undefined
    : densityClass[density] || undefined;

  return (
    <Card
      className={cn(
        "w-full min-w-0 border-border/60 shadow-sm overflow-hidden flex flex-col",
        className
      )}
    >
      {headerNode}

      {/* Toolbar */}
      {showToolbar && (
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-4 py-3 border-b border-border/60 bg-card">
          <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-primary via-primary/60 to-transparent rounded-r-full" />

          {enableSearch && (
            <div className="flex-1 min-w-0">
              <SearchInput
                initialValue={searchValue}
                placeholder={searchPlaceholder}
                onSearch={(val) => {
                  setCurrentPage(1);
                  onSearchChange?.(val);
                }}
              />
            </div>
          )}

          {extraToolbar && (
            <div className="flex items-center gap-2 shrink-0">
              {extraToolbar}
            </div>
          )}

          <div className="flex items-center gap-1 shrink-0 sm:ml-auto">
            <TooltipProvider delayDuration={300}>
              {onRefetch && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors disabled:opacity-40"
                      onClick={onRefetch}
                      disabled={isLoading}
                      aria-label="Refresh"
                    >
                      <RefreshCw
                        className={cn(
                          "h-4.5 w-4.5",
                          isLoading && "animate-spin"
                        )}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Refresh</TooltipContent>
                </Tooltip>
              )}

              {enableExport && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      onClick={() =>
                        exportToCSV(data, rawColumns as any, exportFilename)
                      }
                      aria-label="Export CSV"
                    >
                      <Download className="h-4.5 w-4.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Export CSV</TooltipContent>
                </Tooltip>
              )}

              {enableDensityToggle && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      onClick={cycleDensity}
                      aria-label={`Density: ${density}`}
                    >
                      {densityIcons[density]}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Density:{" "}
                    {density.charAt(0).toUpperCase() + density.slice(1)}
                  </TooltipContent>
                </Tooltip>
              )}

              {enableColumnToggle && (
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                          aria-label="Toggle columns"
                        >
                          <Columns3 className="h-4.5 w-4.5" />
                        </button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Toggle Columns
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Visible columns
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {table
                      .getAllColumns()
                      .filter(
                        (col) =>
                          col.getCanHide() &&
                          col.id !== "select" &&
                          col.id !== "_actions"
                      )
                      .map((col) => (
                        <DropdownMenuItem
                          key={col.id}
                          className="capitalize text-sm flex items-center gap-2 cursor-pointer"
                          onSelect={(e) => {
                            e.preventDefault();
                            col.toggleVisibility(!col.getIsVisible());
                          }}
                        >
                          <span
                            className={cn(
                              "flex h-3.5 w-3.5 items-center justify-center rounded border",
                              col.getIsVisible()
                                ? "bg-primary border-primary"
                                : "bg-transparent border-border/60"
                            )}
                          >
                            {col.getIsVisible() && (
                              <svg
                                className="h-2.5 w-2.5 text-primary-foreground"
                                fill="none"
                                viewBox="0 0 12 12"
                              >
                                <path
                                  d="M2 6l3 3 5-5"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                          {/* BUG FIX: show formatted label instead of raw col.id */}
                          {formatColumnLabel(col.id)}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Divider before bulk actions */}
              {bulkActions && bulkActions.length > 0 && (
                <div className="h-5 w-px bg-border mx-1" />
              )}

              {/* Bulk action icon buttons */}
              {bulkActions?.map((action, i) => {
                if (action.hidden?.(selectedRows)) return null;
                const isActive = hasSelection;
                return (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <button
                        disabled={!isActive}
                        onClick={() =>
                          isActive &&
                          action.onClick(selectAllPages ? data : selectedRows)
                        }
                        aria-label={action.label}
                        className={cn(
                          "inline-flex items-center justify-center h-9 w-9 rounded-md transition-colors",
                          !isActive && "opacity-35 cursor-not-allowed",
                          isActive && action.variant === "destructive"
                            ? "text-destructive hover:bg-destructive/10"
                            : isActive
                              ? "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                              : "text-muted-foreground"
                        )}
                      >
                        {action.icon}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {action.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              {/* Selection count badge */}
              <AnimatePresence>
                {hasSelection && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.75, width: 0 }}
                    animate={{ opacity: 1, scale: 1, width: "auto" }}
                    exit={{ opacity: 0, scale: 0.75, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-[11px] font-semibold px-2 py-0.5 rounded-full ml-1 whitespace-nowrap">
                      {selectionCount} {selectAllPages ? "rows" : "selected"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </TooltipProvider>
          </div>
        </div>
      )}

      {/* Select-All-Pages Banner */}
      <AnimatePresence>
        {allPageRowsSelected && totalCount > rowsPerPage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-center gap-3 bg-primary/5 border-b border-primary/20 px-4 py-2 text-xs text-primary">
              <CheckSquare className="h-3.5 w-3.5 shrink-0" />
              <span>
                All <strong>{rowsPerPage}</strong> rows on this page are
                selected.
              </span>
              {!selectAllPages ? (
                <button
                  className="font-semibold underline underline-offset-2 hover:no-underline"
                  onClick={() => setSelectAllPages(true)}
                >
                  Select all {totalCount} rows
                </button>
              ) : (
                <button
                  className="font-semibold underline underline-offset-2 hover:no-underline"
                  onClick={() => {
                    setSelectAllPages(false);
                    table.resetRowSelection();
                  }}
                >
                  Clear selection
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <Table
        wrapperClassName={cn(
          "w-full min-w-0 max-h-[calc(100vh-17rem)] min-h-[300px]",
          tableWrapperClassName
        )}
        className={cn("w-full", tableBodyClass, tableClassName)}
      >
        <TableHeader className="sticky top-0 z-10 bg-muted/60 backdrop-blur-sm">
          {table.getHeaderGroups().map((hg) => (
            <TableRow
              key={hg.id}
              className="hover:bg-transparent border-b border-border/60"
              style={
                rowHeight
                  ? {
                      height:
                        typeof rowHeight === "number"
                          ? `${rowHeight}px`
                          : rowHeight,
                    }
                  : undefined
              }
            >
              {hg.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "font-semibold text-xs uppercase tracking-wide text-muted-foreground",
                      (header.column.columnDef.meta as any)?.className
                    )}
                    // IMPROVEMENT: aria-sort for accessibility
                    aria-sort={
                      sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : canSort
                            ? "none"
                            : undefined
                    }
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        className="flex items-center gap-1.5 group/sort select-none hover:text-foreground transition-colors"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <span className="text-muted-foreground/60 group-hover/sort:text-muted-foreground transition-colors">
                          {sorted === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </span>
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableSkeletonRows
              rows={skeletonRows}
              columns={table.getVisibleLeafColumns()}
            />
          ) : showEmpty ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-64 text-center">
                <NoDataFound
                  variant={searchValue ? "search" : "empty"}
                  title={emptyTitle}
                  description={emptyDescription}
                />
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn(
                  "border-b border-border/40 transition-colors",
                  onRowClick &&
                    "cursor-pointer hover:bg-primary/5 active:bg-primary/10",
                  typeof rowClassName === "function"
                    ? rowClassName(row.original)
                    : rowClassName
                )}
                style={
                  rowHeight
                    ? {
                        height:
                          typeof rowHeight === "number"
                            ? `${rowHeight}px`
                            : rowHeight,
                      }
                    : undefined
                }
                onClick={
                  onRowClick ? () => onRowClick(row.original) : undefined
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={
                      (cell.column.columnDef.meta as any)?.className as string
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      {!showEmpty && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/60 bg-card z-10 relative">
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap justify-center sm:justify-start">
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap text-xs">Rows per page</span>
              <Select
                value={`${rowsPerPage}`}
                onValueChange={(val) => {
                  setRowsPerPage(Number(val));
                  setCurrentPage(1);
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
              ) : totalCount === 0 ? (
                <span className="text-muted-foreground">No entries</span>
              ) : (
                <>
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {startRow}
                  </span>
                  {" \u2013 "}
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

          <div className="flex items-center gap-1.5">
            {/* First page */}
            <button
              className="hidden lg:inline-flex items-center justify-center h-8 w-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage <= 1 || isLoading}
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            {/* Prev */}
            <button
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>

            {/* Page indicator */}
            <div className="px-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
              <span className="font-bold text-foreground">{currentPage}</span>
              <span className="mx-1">/</span>
              <span className="font-bold text-foreground">{totalPages}</span>
            </div>

            {/* Next */}
            <button
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              aria-label="Next page"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            {/* Last page */}
            <button
              className="hidden lg:inline-flex items-center justify-center h-8 w-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages || isLoading}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
