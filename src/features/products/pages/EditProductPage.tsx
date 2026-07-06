import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useGetProductQuery, useUpdateProductMutation } from "../productApi";
import ProductForm from "../components/ProductForm";

function ProductFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-32 w-full" />
      <div className="flex gap-3 justify-end">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: productResponse,
    isLoading,
    isError,
  } = useGetProductQuery(id!, { skip: !id });

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const product = productResponse?.data;

  const handleSubmit = async (formData: FormData) => {
    if (!id) return;
    try {
      await updateProduct({ id, body: formData }).unwrap();
      toast.success("Product updated successfully");
      navigate("/products");
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to update product";
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
        <div className="rounded-xl border bg-card p-6">
          <ProductFormSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-lg font-semibold">Product not found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          The product you are looking for does not exist or has been removed.
        </p>
        <Button className="mt-4" variant="outline" onClick={() => navigate("/products")}>
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
      <div className="rounded-xl border bg-card p-6">
        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          isLoading={isUpdating}
        />
      </div>
    </div>
  );
}
