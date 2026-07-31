import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  const router = useRouter();

  const search = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      });
      if (updates.search !== undefined) {
        next.delete("page");
      }
      router.replace(`/users?${next.toString()}`);
    },
    [searchParams, router]
  );

  useEffect(() => {
    if (debouncedSearch !== search) {
      updateParams({ search: debouncedSearch });
    }
  }, [debouncedSearch, search, updateParams]);

  const {
    data: users = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetUsersQuery(debouncedSearch);

  const meta = undefined;

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
      popup.success("User created");
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
      const data: Record<string, string> = {};
      if (formName) data.name = formName;
      if (formEmail) data.email = formEmail;
      if (formPassword) data.password = formPassword;
      if (formRole) data.role = formRole;
      await updateUser({ id: editUser._id, ...data }).unwrap();
      popup.success("User updated");
      setEditUser(null);
      resetForm();
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
    } catch {
      popup.error("Failed to delete user");
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (user: User) => {
    setEditUser({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRole(typeof user.role === "string" ? user.role : "employee");
  };

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
          <div className="font-medium text-foreground">
            {row.getValue("name")}
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant="secondary" className="capitalize">
            {row.getValue("role") ?? "-"}
          </Badge>
        ),
      },
      {
        accessorKey: "isActive",
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => {
          const isActive = row.getValue("isActive");
          return (
            <div className="flex justify-center">
              <Badge variant={isActive ? "success" : "destructive"}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit ${user.name}`}
                onClick={() => openEdit(user)}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${user.name}`}
                onClick={() => setDeleteId(user._id)}
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
          data={users}
          isLoading={isLoading || isFetching}
          skeletonRows={5}
          enableSearch
          searchPlaceholder="Search users by name or email..."
          searchValue={searchInput}
          onSearchChange={(val) => {
            setSearchInput(val);
          }}
          pagination={{
            currentPage: 1,
            totalCount: users.length,
            rowsPerPage: Math.max(users.length, 10),
            pageSizeOptions: [10, 20, 50],
            onPageChange: (newPage) => updateParams({ page: String(newPage) }),
            onRowsPerPageChange: (newLimit) =>
              updateParams({ limit: String(newLimit), page: "1" }),
          }}
          bulkActions={{
            render: (rows, disabled) => (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 bg-background shadow-sm border-border/60"
                  disabled={disabled}
                  onClick={() =>
                    popup.success(`Exporting ${rows.length} users…`)
                  }
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Export
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 shadow-sm"
                  disabled={disabled}
                  onClick={() => popup.error(`Deleted ${rows.length} users`)}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              </>
            ),
          }}
          emptyTitle={
            searchInput ? "No users match your search" : "No users found"
          }
          emptyDescription={
            searchInput
              ? "Try a different search term."
              : "Get started by adding your first user."
          }
        />
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>Create a new user account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="john@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
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
            <Button loading={isSubmitting} onClick={handleCreate}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editUser}
        onOpenChange={(open) => {
          if (!open) setEditUser(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-password">
                Password (leave blank to keep)
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="New password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-role">Role</Label>
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
            <Button variant="outline" onClick={() => setEditUser(null)}>
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
            <DialogTitle>Delete User</DialogTitle>
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
