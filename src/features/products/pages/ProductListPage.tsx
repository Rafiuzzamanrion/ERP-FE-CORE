import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, RotateCw, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/store/hooks";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "../api/productApi";
import ProductTable from "../components/ProductTable";
import NoDataFound from "@/components/shared/NoDataFound";
import ProductListSkeleton from "@/components/shared/ProductListSkeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetCategoriesQuery } from "@/features/categories/api/categoryApi";
import { AddProductDialog } from "../components/AddProductDialog";

export default function ProductListPage() {
  const user = useAppSelector((state) => state.auth.user);
  const isEmployee = user?.role === "employee";

  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? ""
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetProductsQuery(
      {
        search: search || undefined,
        category: category || undefined,
        page,
        limit,
      },
      { skip: false }
    );
  const { data: categoriesResult } = useGetCategoriesQuery();
  const categories = categoriesResult?.data ?? [];

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      });
      if (updates.search !== undefined || updates.category !== undefined) {
        next.delete("page");
      }
      router.replace(`/products?${next.toString()}`);
    },
    [searchParams, router]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({ search: searchInput });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, search, updateParams]);

  const handleCategoryChange = (value: string) => {
    updateParams({ category: value === "all" ? "" : value });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) });
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId).unwrap();
      toast.success("Product deleted successfully");
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleteId(null);
    }
  };

  const isFirstLoad = isLoading && !data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your inventory and stock levels
          </p>
        </div>
        {!isEmployee && (
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Select
                value={category || "all"}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isFetching && !isLoading && (
                <RotateCw className="h-4 w-4 animate-spin self-center text-muted-foreground" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isFirstLoad ? (
        <ProductListSkeleton />
      ) : isError ? (
        <NoDataFound
          title="Failed to load products"
          description={
            (error as { data?: { message?: string } })?.data?.message ??
            "An unexpected error occurred. Please try again."
          }
          action={
            <Button variant="outline" onClick={() => refetch()}>
              <RotateCw className="h-4 w-4" />
              Retry
            </Button>
          }
        />
      ) : data && data.data.length === 0 ? (
        <NoDataFound
          title={
            search || category
              ? "No products match your filters"
              : "No products found"
          }
          description={
            search || category
              ? "Try adjusting your search or category filter."
              : "Get started by adding your first product to the inventory."
          }
          action={
            !isEmployee && !search && !category ? (
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            ) : undefined
          }
          variant={search || category ? "search" : "empty"}
        />
      ) : (
        <ProductTable
          products={data?.data ?? []}
          meta={data?.meta}
          onPageChange={handlePageChange}
          onDelete={handleDelete}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        variant="destructive"
      />

      <AddProductDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}
