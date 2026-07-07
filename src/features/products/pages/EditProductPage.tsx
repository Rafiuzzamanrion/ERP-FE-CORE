import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useGetProductQuery, useUpdateProductMutation } from "../productApi";
import ProductForm from "../components/ProductForm";
import ProductFormSkeleton from "@/components/shared/ProductFormSkeleton";

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
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">Update product information</p>
        </div>
        <ProductFormSkeleton />
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
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => navigate("/products")}
        >
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">Update product information</p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Make changes to the product below.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ProductForm
            initialData={product}
            onSubmit={handleSubmit}
            isLoading={isUpdating}
          />
        </CardContent>
      </Card>
    </div>
  );
}
