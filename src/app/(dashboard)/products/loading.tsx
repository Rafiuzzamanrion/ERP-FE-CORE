import ProductListSkeleton from "@/components/shared/ProductListSkeleton";

export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">
          Manage your inventory and stock levels
        </p>
      </div>
      <ProductListSkeleton />
    </div>
  );
}
