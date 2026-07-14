import { memo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useGetCategoriesQuery } from "@/features/categories/api/categoryApi";
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
  onCancel?: () => void;
  isLoading?: boolean;
}

export default memo(function ProductForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: ProductFormProps) {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
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

  const { data: categoriesResult } = useGetCategoriesQuery();
  const categories = categoriesResult?.data ?? [];

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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            placeholder="e.g. Wireless Mouse"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" placeholder="e.g. WM-001" {...register("sku")} />
          {errors.sku && (
            <p className="text-sm text-destructive">{errors.sku.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category._id}
                      value={category.name}
                      className="capitalize"
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-sm text-destructive">
              {errors.category.message}
            </p>
          )}
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
            <p className="text-sm text-destructive">
              {errors.stockQuantity.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
            <p className="text-sm text-destructive">
              {errors.purchasePrice.message}
            </p>
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
            <p className="text-sm text-destructive">
              {errors.sellingPrice.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Product Image{" "}
          {!initialData && <span className="text-destructive">*</span>}
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

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel ? onCancel : () => router.push("/products")}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {initialData ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
});
