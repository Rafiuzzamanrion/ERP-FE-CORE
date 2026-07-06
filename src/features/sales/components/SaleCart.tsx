import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { Control, UseFormSetValue } from "react-hook-form";
import { Controller } from "react-hook-form";

interface SaleCartField {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  stockQuantity: number;
}

interface SaleCartProps {
  fields: SaleCartField[];
  remove: (index: number) => void;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  grandTotal: number;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export default function SaleCart({
  fields,
  remove,
  control,
  setValue,
  grandTotal,
  isSubmitting,
  onSubmit,
}: SaleCartProps) {
  return (
    <div className="space-y-4">
      {fields.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-1">
            <span className="col-span-3">Product</span>
            <span className="col-span-2">Qty</span>
            <span className="col-span-2">Price</span>
            <span className="col-span-3">Subtotal</span>
            <span className="col-span-2">Actions</span>
          </div>
          {fields.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-2 items-center p-2 border rounded-lg"
            >
              <span className="col-span-3 text-sm font-medium truncate">
                {item.productName}
              </span>
              <div className="col-span-2 flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={item.quantity <= 1}
                  onClick={() =>
                    setValue(
                      `items.${index}.quantity`,
                      item.quantity - 1
                    )
                  }
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Controller
                  control={control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min={1}
                      max={item.stockQuantity}
                      className="h-7 w-12 text-center px-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      {...field}
                      value={field.value}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= 1 && val <= item.stockQuantity) {
                          field.onChange(val);
                        }
                      }}
                    />
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={item.quantity >= item.stockQuantity}
                  onClick={() =>
                    setValue(
                      `items.${index}.quantity`,
                      item.quantity + 1
                    )
                  }
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <span className="col-span-2 text-sm">
                {formatCurrency(item.unitPrice)}
              </span>
              <span className="col-span-3 text-sm font-medium">
                {formatCurrency(item.unitPrice * item.quantity)}
              </span>
              <div className="col-span-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between border-t pt-4">
        <span className="text-xl font-bold">Grand Total</span>
        <span className="text-xl font-bold">
          {formatCurrency(grandTotal)}
        </span>
      </div>
      <Button
        className="w-full"
        disabled={fields.length === 0}
        loading={isSubmitting}
        onClick={onSubmit}
        type="button"
      >
        Create Sale
      </Button>
    </div>
  );
}
