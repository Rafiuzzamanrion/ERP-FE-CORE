import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { RotateCw, Trash2, UserPlus, Download } from "lucide-react";
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
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryParams } from "@/hooks/use-query-params";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../api/userApi";
import PageHeader from "@/components/shared/PageHeader";
import NoDataFound from "@/components/shared/NoDataFound";
import { DataTable } from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string | null;
  isActive: boolean;
};

export default function UsersListPage() {
  const searchParams = useSearchParams();
  const { setParams } = useQueryParams();

  const search = searchParams.get("search") ?? "";

  const [searchInput, setSearchInput] = useState(search);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    if (debouncedSearch !== search) {
      setParams({ search: debouncedSearch });
      setCurrentPage(1);
    }
  }, [debouncedSearch, search, setParams]);

  const {
    data: users = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetUsersQuery(debouncedSearch);

  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<{
    _id: string;
    name: string;
    email: string;
    role: string | null;
  } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("employee");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("employee");
  };

  const handleCreate = async () => {
    if (!formName || !formEmail || !formPassword) return;
    setIsSubmitting(true);
    try {
      await createUser({
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
      }).unwrap();
      popup.success("User created successfully");
      setIsCreateOpen(false);
      resetForm();
    } catch {
      popup.error("Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    setIsSubmitting(true);
    try {
      await updateUser({
        id: editUser._id,
        name: editUser.name,
        email: editUser.email,
        role: editUser.role ?? undefined,
      }).unwrap();
      popup.success("User updated successfully");
      setEditUser(null);
    } catch {
      popup.error("Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUser(deleteId).unwrap();
      popup.success("User deleted");
      setDeleteId(null);
    } catch {
      popup.error("Failed to delete user");
    }
  };

  const pagedUsers = useMemo(
    () =>
      users.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
    [users, currentPage, rowsPerPage]
  );

  const columns: ColumnDef<User>[] = useMemo(
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
          <span className="font-medium">{row.getValue("name")}</span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.getValue("email")}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = row.getValue("role") as string | null;
          return (
            <Badge variant={role === "admin" ? "default" : "secondary"}>
              {role ?? "No Role"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.getValue("isActive") as boolean;
          return (
            <Badge variant={isActive ? "success" : "destructive"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader title="Users" description="Manage user accounts and roles">
        <Button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </PageHeader>

      {isError ? (
        <NoDataFound
          title="Failed to load users"
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
          data={pagedUsers}
          isLoading={isLoading}
          isFetching={isFetching}
          skeletonRows={5}
          enableSearch
          searchPlaceholder="Search users by name or email..."
          searchValue={searchInput}
          onSearchChange={(val) => {
            setSearchInput(val);
          }}
          pagination={{
            currentPage,
            totalCount: users.length,
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
                popup.success(`Exporting ${rows.length} users…`),
            },
            {
              label: "Delete selected",
              icon: <Trash2 className="h-3.5 w-3.5" />,
              variant: "destructive",
              onClick: (rows) => popup.error(`Deleted ${rows.length} users`),
            },
          ]}
          rowActions={[
            {
              label: "Edit",
              onClick: (row) => setEditUser(row),
            },
            {
              label: "Delete",
              variant: "destructive",
              onClick: (row) => setDeleteId(row._id),
            },
          ]}
        />
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new user account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={formRole} onValueChange={setFormRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the user account details.
            </DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={editUser.name}
                  onChange={(e) =>
                    setEditUser({ ...editUser, name: e.target.value })
                  }
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editUser.email}
                  onChange={(e) =>
                    setEditUser({ ...editUser, email: e.target.value })
                  }
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select
                  value={editUser.role ?? "employee"}
                  onValueChange={(val) =>
                    setEditUser({ ...editUser, role: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
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
