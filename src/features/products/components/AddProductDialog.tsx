import { popup } from "@/components/shared/popup";
import { useCreateProductMutation } from "../api/productApi";
import ProductForm from "../components/ProductForm";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddProductDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddProductDialogProps) {
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const handleSubmit = async (formData: FormData) => {
    try {
      await createProduct(formData).unwrap();
      popup.success("Product created successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to create product";
      popup.error(message);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl">
        <ModalHeader
          title="Add Product"
          description="Create a new product in your inventory."
        />
        <ModalBody>
          <ProductForm
            formId="add-product-form"
            hideActions
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" form="add-product-form" loading={isLoading}>
            Create Product
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
