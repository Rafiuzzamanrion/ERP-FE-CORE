import { useState, useEffect, useMemo } from "react";
import { RotateCw, ShieldPlus, Trash2, Pencil, Download } from "lucide-react";
import { popup } from "@/components/shared/popup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from "../api/roleApi";
import PageHeader from "@/components/shared/PageHeader";
import NoDataFound from "@/components/shared/NoDataFound";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { useDebounce } from "@/hooks/useDebounce";

type Role = {
  _id: string;
  name: string;
  permissions: { _id?: string; key: string }[];
  isSystem: boolean;
};

export default function RolesListPage() {
  const { data: roles, isLoading, isError, refetch } = useGetRolesQuery();
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredRoles =
    roles?.filter(
      (role) =>
        role.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        role.permissions.some((p) =>
          p.key.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
    ) ?? [];

  const pagedRoles = filteredRoles.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<{ _id: string; name: string } | null>(
    null
  );
  const [formName, setFormName] = useState("");
  const [editFormName, setEditFormName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!formName) return;
    setIsSubmitting(true);
    try {
      await createRole({ name: formName }).unwrap();
      popup.success("Role created");
      setIsCreateOpen(false);
      setFormName("");
    } catch {
      popup.error("Failed to create role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editId || !editFormName) return;
    setIsEditSubmitting(true);
    try {
      await updateRole({ id: editId._id, name: editFormName }).unwrap();
      popup.success("Role updated");
      setIsEditOpen(false);
      setEditId(null);
      setEditFormName("");
    } catch {
      popup.error("Failed to update role");
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRole(deleteId).unwrap();
      popup.success("Role deleted");
    } catch {
      popup.error("Failed to delete role");
    } finally {
      setDeleteId(null);
    }
  };

  const columns: ColumnDef<Role>[] = useMemo(
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
        cell: ({ row }) => {
          if (row.original.isSystem) {
            return <Checkbox disabled className="translate-y-[2px]" />;
          }
          return (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="translate-y-[2px]"
            />
          );
        },
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
        accessorKey: "permissions",
        header: "Permissions",
        cell: ({ row }) => {
          const role = row.original;
          return (
            <div className="flex flex-wrap gap-1.5">
              {role.permissions && role.permissions.length > 0 ? (
                role.permissions.slice(0, 5).map((perm) => (
                  <Badge
                    key={perm._id ?? perm.key}
                    variant="outline"
                    className="text-[10px] uppercase font-semibold"
                  >
                    {perm.key.replace(/:/g, " ")}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">
                  No permissions
                </span>
              )}
              {role.permissions && role.permissions.length > 5 && (
                <Badge variant="secondary" className="text-[10px]">
                  +{role.permissions.length - 5}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "isSystem",
        header: () => <div className="text-center">System</div>,
        cell: ({ row }) => {
          const isSystem = row.getValue("isSystem");
          return (
            <div className="flex justify-center">
              <Badge
                variant={isSystem ? "secondary" : "default"}
                className="shadow-sm"
              >
                {isSystem ? "System" : "Custom"}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const role = row.original;
          if (role.isSystem) return null;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit ${role.name}`}
                onClick={() => {
                  setEditId({ _id: role._id, name: role.name });
                  setEditFormName(role.name);
                  setIsEditOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${role.name}`}
                onClick={() => setDeleteId(role._id)}
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
        title="Roles & Permissions"
        description="Manage system roles and access permissions"
      >
        <Button
          onClick={() => {
            setFormName("");
            setIsCreateOpen(true);
          }}
        >
          <ShieldPlus className="h-4 w-4 mr-1.5" />
          Add Role
        </Button>
      </PageHeader>

      {isError ? (
        <NoDataFound
          title="Failed to load roles"
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
          data={pagedRoles}
          isLoading={isLoading}
          skeletonRows={4}
          enableSearch
          searchPlaceholder="Search roles or permissions..."
          searchValue={searchInput}
          onSearchChange={(val) => {
            setSearchInput(val);
            setCurrentPage(1);
          }}
          pagination={{
            currentPage,
            totalCount: filteredRoles.length,
            rowsPerPage,
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
                popup.success(`Exporting ${rows.length} roles…`),
            },
            {
              label: "Delete selected",
              icon: <Trash2 className="h-3.5 w-3.5" />,
              variant: "destructive",
              onClick: (rows) =>
                popup.error(`Deleted ${rows.length} custom roles`),
            },
          ]}
          emptyTitle={
            searchInput ? "No roles match your search" : "No roles found"
          }
          emptyDescription={
            searchInput
              ? "Try a different search term."
              : "Get started by adding your first role."
          }
        />
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Role</DialogTitle>
            <DialogDescription>Create a new role.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="role-name">Name</Label>
              <Input
                id="role-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. auditor"
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
        open={isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditOpen(false);
            setEditId(null);
            setEditFormName("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Rename the role &quot;{editId?.name}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-role-name">Name</Label>
              <Input
                id="edit-role-name"
                value={editFormName}
                onChange={(e) => setEditFormName(e.target.value)}
                placeholder="e.g. auditor"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false);
                setEditId(null);
                setEditFormName("");
              }}
            >
              Cancel
            </Button>
            <Button loading={isEditSubmitting} onClick={handleEdit}>
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
            <DialogTitle>Delete Role</DialogTitle>
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
