import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/shared/ImageUploader";
import type { Product } from "@/types";

const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  purchasePrice: z.number().min(0, "Purchase price must be 0 or greater"),
  sellingPrice: z.number().min(0, "Selling price must be 0 or greater"),
  stockQuantity: z.number().int().min(0, "Stock must be 0 or greater"),
});

type ProductFormValues = z.output<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

export default function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      sku: initialData?.sku ?? "",
      category: initialData?.category ?? "",
      purchasePrice: initialData?.purchasePrice ?? 0,
      sellingPrice: initialData?.sellingPrice ?? 0,
      stockQuantity: initialData?.stockQuantity ?? 0,
    },
  });

  const onFormSubmit = async (data: ProductFormValues) => {
    if (!initialData && !imageFile) {
      setImageError("Product image is required");
      return;
    }
    setImageError(null);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("sku", data.sku);
    formData.append("category", data.category);
    formData.append("purchasePrice", String(data.purchasePrice));
    formData.append("sellingPrice", String(data.sellingPrice));
    formData.append("stockQuantity", String(data.stockQuantity));
    if (imageFile) {
      formData.append("image", imageFile);
    }
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Product name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" placeholder="Product SKU" {...register("sku")} />
          {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" placeholder="Product category" {...register("category")} />
          {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purchasePrice">Purchase Price</Label>
          <Input
            id="purchasePrice"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("purchasePrice", { valueAsNumber: true })}
          />
          {errors.purchasePrice && (
            <p className="text-sm text-destructive">{errors.purchasePrice.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sellingPrice">Selling Price</Label>
          <Input
            id="sellingPrice"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("sellingPrice", { valueAsNumber: true })}
          />
          {errors.sellingPrice && (
            <p className="text-sm text-destructive">{errors.sellingPrice.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="stockQuantity">Stock Quantity</Label>
        <Input
          id="stockQuantity"
          type="number"
          placeholder="0"
          {...register("stockQuantity", { valueAsNumber: true })}
        />
        {errors.stockQuantity && (
          <p className="text-sm text-destructive">{errors.stockQuantity.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>
          Product Image {!initialData && <span className="text-destructive">*</span>}
        </Label>
        <ImageUploader
          value={imageFile}
          onChange={(file) => {
            setImageFile(file);
            setImageError(null);
          }}
          existingUrl={initialData?.imageUrl}
        />
        {imageError && <p className="text-sm text-destructive">{imageError}</p>}
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={() => navigate("/products")}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {initialData ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
