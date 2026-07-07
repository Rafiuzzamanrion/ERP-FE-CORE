import { useState, useEffect } from "react";
import { RotateCw, ShieldPlus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  useDeleteRoleMutation,
} from "../roleApi";
import PageHeader from "@/components/shared/PageHeader";
import NoDataFound from "@/components/shared/NoDataFound";
import RolesListSkeleton from "../components/RolesListSkeleton";

export default function RolesListPage() {
  const { data: roles, isLoading, isError, refetch } = useGetRolesQuery();
  const [createRole] = useCreateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filteredRoles = roles?.filter(
    (role) =>
      role.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      role.permissions.some((p) =>
        p.key.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!formName) return;
    setIsSubmitting(true);
    try {
      await createRole({ name: formName }).unwrap();
      toast.success("Role created");
      setIsCreateOpen(false);
      setFormName("");
    } catch {
      toast.error("Failed to create role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRole(deleteId).unwrap();
      toast.success("Role deleted");
    } catch {
      toast.error("Failed to delete role");
    } finally {
      setDeleteId(null);
    }
  };

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
          <ShieldPlus className="h-4 w-4" />
          Add Role
        </Button>
      </PageHeader>

      <Card className="mb-6 border-none shadow-sm">
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles or permissions..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <RolesListSkeleton />
      ) : isError ? (
        <NoDataFound
          title="Failed to load roles"
          action={
            <Button variant="outline" onClick={() => refetch()}>
              <RotateCw className="h-4 w-4" />
              Retry
            </Button>
          }
        />
      ) : !filteredRoles || filteredRoles.length === 0 ? (
        <NoDataFound
          title={
            debouncedSearch ? "No roles match your search" : "No roles found"
          }
          description={
            debouncedSearch
              ? "Try a different search term."
              : "Get started by adding your first role."
          }
          action={
            !debouncedSearch ? (
              <Button
                onClick={() => {
                  setFormName("");
                  setIsCreateOpen(true);
                }}
              >
                <ShieldPlus className="h-4 w-4" />
                Add Role
              </Button>
            ) : undefined
          }
          variant={debouncedSearch ? "search" : "empty"}
        />
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-center">System</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role._id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions && role.permissions.length > 0 ? (
                        role.permissions.slice(0, 5).map((perm) => (
                          <Badge
                            key={perm._id ?? perm.key}
                            variant="outline"
                            className="text-xs capitalize"
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
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 5}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={role.isSystem ? "secondary" : "default"}>
                      {role.isSystem ? "System" : "Custom"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {!role.isSystem && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${role.name}`}
                        onClick={() => setDeleteId(role._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
