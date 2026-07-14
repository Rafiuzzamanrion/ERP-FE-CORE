import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import PageHeader from "@/components/shared/PageHeader";
import ProductSelector from "../components/ProductSelector";
import SaleCart from "../components/SaleCart";
import { useCreateSaleMutation } from "../api/saleApi";
import { useGetProductsQuery } from "@/features/products/api/productApi";
import type { Product } from "@/types";

const saleFormSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        productName: z.string(),
        quantity: z.number().min(1),
        unitPrice: z.number(),
        stockQuantity: z.number(),
      })
    )
    .min(1, "Add at least one product"),
});

type SaleFormValues = z.output<typeof saleFormSchema>;

export default function CreateSalePage() {
  const router = useRouter();
  const [createSale, { isLoading: isSubmitting }] = useCreateSaleMutation();
  const { data: productsData, isLoading: isLoadingProducts } =
    useGetProductsQuery({ limit: 50 }, { skip: false });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");

  const grandTotal = (watchedItems || []).reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const excludeIds = fields.map((f) => f.productId);

  const handleAddProduct = (product: Product) => {
    append({
      productId: product._id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.sellingPrice,
      stockQuantity: product.stockQuantity,
    });
  };

  const onSubmit = async (data: SaleFormValues) => {
    try {
      await createSale({
        items: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }).unwrap();
      toast.success("Sale created successfully");
      router.push("/sales");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : "Failed to create sale";
      toast.error(message || "Failed to create sale");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Sale"
        description="Create a new sales transaction"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Add Products</CardTitle>
            <CardDescription>
              Search and select products to add to the cart.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductSelector
              products={productsData?.data ?? []}
              isLoading={isLoadingProducts}
              onSelect={handleAddProduct}
              excludeIds={excludeIds}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Sale Cart</CardTitle>
            <CardDescription>
              Review items and complete the sale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.items?.root && (
              <p className="text-sm text-destructive mb-3">
                {errors.items.root.message}
              </p>
            )}
            {errors.items?.message && (
              <p className="text-sm text-destructive mb-3">
                {errors.items.message}
              </p>
            )}
            <SaleCart
              fields={fields}
              remove={remove}
              control={control as any}
              setValue={setValue as any}
              grandTotal={grandTotal}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit(onSubmit)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
