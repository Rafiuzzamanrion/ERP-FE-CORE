import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, RotateCw, Search, SlidersHorizontal } from "lucide-react";
import { popup } from "@/components/shared/popup";
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
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryParams } from "@/hooks/use-query-params";
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
import { NavTabs, NavTabItem } from "@/components/shared/NavTabs";
import { Package, Tags, Warehouse } from "lucide-react";

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

  const { setParams } = useQueryParams();

  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setParams({ search: debouncedSearch }, { resetPageOnKeys: ["search"] });
    }
  }, [debouncedSearch, search, setParams]);

  const handleCategoryChange = (value: string) => {
    setParams(
      { category: value === "all" ? "" : value },
      { resetPageOnKeys: ["category"] }
    );
  };

  const handlePageChange = (newPage: number) => {
    setParams({ page: String(newPage) });
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId).unwrap();
      popup.success("Product deleted successfully");
    } catch {
      popup.error("Failed to delete product");
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

      <NavTabs>
        <NavTabItem href="/products" icon={<Package size={16} />}>
          All Products
        </NavTabItem>
        <NavTabItem href="/products/categories" icon={<Tags size={16} />}>
          Categories
        </NavTabItem>
        <NavTabItem href="/products/inventory" icon={<Warehouse size={16} />}>
          Inventory Status
        </NavTabItem>
      </NavTabs>

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
      ) : (
        <ProductTable
          products={data?.data ?? []}
          meta={data?.meta}
          isLoading={isFetching}
          search={searchInput}
          onSearchChange={setSearchInput}
          onPageChange={handlePageChange}
          onRowsPerPageChange={(limit) =>
            setParams({ limit: String(limit), page: "1" })
          }
          onDelete={handleDelete}
          extraToolbar={
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Select
                value={category || "all"}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="h-9 w-40 bg-card border-border/60">
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
            </div>
          }
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
