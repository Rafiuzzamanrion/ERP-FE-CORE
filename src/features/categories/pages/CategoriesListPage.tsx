import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryParams } from "@/hooks/use-query-params";
import { RotateCw, Tag, Trash2, Pencil, Download } from "lucide-react";
import { popup } from "@/components/shared/popup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../api/categoryApi";
import PageHeader from "@/components/shared/PageHeader";
import NoDataFound from "@/components/shared/NoDataFound";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

type Category = {
  _id: string;
  name: string;
  description?: string;
};

export default function CategoriesListPage() {
  const searchParams = useSearchParams();
  const { setParams } = useQueryParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? ""
  );

  const search = searchParams.get("search") ?? "";

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    data: result,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetCategoriesQuery({
    search: search || undefined,
    page: currentPage,
    limit: rowsPerPage,
  });

  const categories = result?.data ?? [];
  const meta = result?.meta;

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
  };

  const handleCreate = async () => {
    if (!formName) return;
    setIsSubmitting(true);
    try {
      await createCategory({
        name: formName,
        description: formDescription,
      }).unwrap();
      popup.success("Category created");
      setIsCreateOpen(false);
      resetForm();
    } catch {
      popup.error("Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editCategory) return;
    setIsSubmitting(true);
    try {
      const data: Record<string, string> = {};
      if (formName) data.name = formName;
      if (formDescription) data.description = formDescription;
      await updateCategory({ id: editCategory._id, ...data }).unwrap();
      popup.success("Category updated");
      setEditCategory(null);
      resetForm();
    } catch {
      popup.error("Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategory(deleteId).unwrap();
      popup.success("Category deleted");
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "data" in err &&
        err.data &&
        typeof err.data === "object" &&
        "message" in err.data
          ? String(err.data.message)
          : "Failed to delete category";
      popup.error(message);
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (category: Category) => {
    setEditCategory(category);
    setFormName(category.name);
    setFormDescription(category.description ?? "");
  };

  const columns: ColumnDef<Category>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium capitalize">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {row.getValue("description") ?? "—"}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const category = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit ${category.name}`}
                onClick={() => openEdit(category)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${category.name}`}
                onClick={() => setDeleteId(category._id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organize products into categories"
      >
        <Button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
        >
          <Tag className="h-4 w-4" />
          Add Category
        </Button>
      </PageHeader>

      {isError ? (
        <NoDataFound
          title="Failed to load categories"
          action={
            <Button variant="outline" onClick={() => refetch()}>
              <RotateCw className="h-4 w-4" />
              Retry
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={categories}
          isLoading={isLoading}
          isFetching={isFetching}
          skeletonRows={5}
          enableSearch
          searchPlaceholder="Search categories..."
          searchValue={searchInput}
          onSearchChange={(val) => {
            setSearchInput(val);
            setParams({ search: val });
            setCurrentPage(1);
          }}
          pagination={{
            currentPage: meta?.page ?? currentPage,
            totalCount: meta?.total ?? 0,
            rowsPerPage: meta?.limit ?? rowsPerPage,
            pageSizeOptions: [10, 20, 50],
            setCurrentPage,
            setRowsPerPage,
          }}
          bulkActions={[
            {
              label: "Export selected",
              icon: <Download className="h-3.5 w-3.5" />,
              variant: "outline",
              onClick: (rows) =>
                popup.success(`Exporting ${rows.length} categories…`),
            },
            {
              label: "Delete selected",
              icon: <Trash2 className="h-3.5 w-3.5" />,
              variant: "destructive",
              onClick: (rows) =>
                popup.error(`Deleted ${rows.length} categories`),
            },
          ]}
          emptyTitle={
            search ? "No categories match your search" : "No categories found"
          }
          emptyDescription={
            search
              ? "Try a different search term."
              : "Get started by adding your first category."
          }
        />
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Create a new product category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. electronics"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category-description">Description</Label>
              <Input
                id="category-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button loading={isSubmitting} onClick={handleCreate}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editCategory}
        onOpenChange={(open) => {
          if (!open) setEditCategory(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-category-name">Name</Label>
              <Input
                id="edit-category-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-category-description">Description</Label>
              <Input
                id="edit-category-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCategory(null)}>
              Cancel
            </Button>
            <Button loading={isSubmitting} onClick={handleUpdate}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
