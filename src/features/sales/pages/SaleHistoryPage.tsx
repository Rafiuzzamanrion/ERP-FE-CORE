import { useState, useEffect } from "react";
import { Eye, Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import NoDataFound from "@/components/shared/NoDataFound";
import SaleHistorySkeleton from "../components/SaleHistorySkeleton";
import { Pagination } from "@/components/shared/Pagination";
import { useGetSalesQuery } from "../saleApi";
import type { Sale } from "@/types";

export default function SaleHistoryPage() {
  const [page, setPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useGetSalesQuery({
    page,
    limit: 10,
    sort: "-createdAt",
    search: debouncedSearch || undefined,
  });

  const sales = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sale History"
        description="View and track all sales transactions"
      >
        <Button asChild>
          <Link to="/sales/new">
            <Plus className="h-4 w-4" />
            New Sale
          </Link>
        </Button>
      </PageHeader>

      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product or seller..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <SaleHistorySkeleton />
      ) : sales.length === 0 ? (
        <NoDataFound
          title={
            debouncedSearch ? "No sales match your search" : "No sales yet"
          }
          description={
            debouncedSearch
              ? "Try a different search term."
              : "Create your first sale to get started."
          }
          action={
            !debouncedSearch ? (
              <Button asChild>
                <Link to="/sales/new">Create Sale</Link>
              </Button>
            ) : undefined
          }
          variant={debouncedSearch ? "search" : "empty"}
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead># Items</TableHead>
                  <TableHead>Grand Total</TableHead>
                  <TableHead>Sold By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale._id}>
                    <TableCell>
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{sale.items.length}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(sale.grandTotal)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {typeof sale.soldBy === "object" && sale.soldBy !== null
                        ? sale.soldBy.name
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View sale details"
                        onClick={() => setSelectedSale(sale)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {data?.meta && data.meta.totalPages > 1 && (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Subtotal</TableHead>
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
                      <TableCell>{formatCurrency(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between border-t pt-4">
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
