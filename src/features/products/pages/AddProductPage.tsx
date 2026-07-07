import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useCreateProductMutation } from "../productApi";
import ProductForm from "../components/ProductForm";

export default function AddProductPage() {
  const navigate = useNavigate();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const handleSubmit = async (formData: FormData) => {
    try {
      await createProduct(formData).unwrap();
      toast.success("Product created successfully");
      navigate("/products");
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to create product";
      toast.error(message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>
        <p className="text-muted-foreground">
          Create a new product in your inventory
        </p>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Fill in the information below to add a product.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
