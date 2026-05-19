"use client";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import Modal from "@/components/modals/modal";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Error from "@/components/ui/error";
import { Input, Label, Select } from "@/components/ui/field";
import Loading from "@/components/ui/loading";
import { getBranches } from "@/services/branch-service";
import { getClients } from "@/services/client-service";
import { createUser, deleteUser, getUsers, updateUser } from "@/services/user-service";
import { useSession } from "@/hooks/use-session";
import type { Role } from "@/types/auth";
import type { AppUser, UserCreatePayload, UserUpdatePayload } from "@/types/user";
import { canManageRole, filterBySessionScope, formatRole, getEffectiveRole, hasRoleAccess } from "@/utils";

const initialForm: UserCreatePayload = {
  name: "",
  email: "",
  password: "admin123",
  role: "BRANCH_MANAGER",
  tenant_id: 1,
  branch_id: 1,
};

export default function DashboardUsersPage() {
  const queryClient = useQueryClient();
  const { hydrated, rolePreview, user } = useSession();
  const [selected, setSelected] = useState<AppUser | null>(null);
  const [form, setForm] = useState<UserCreatePayload>(initialForm);
  const [modalOpen, setModalOpen] = useState(false);

  const usersQuery = useQuery({ queryKey: ["users"], queryFn: () => getUsers() });
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const branchesQuery = useQuery({ queryKey: ["branches"], queryFn: getBranches });

  const effectiveRole = getEffectiveRole(user?.role, rolePreview);

  const saveMutation = useMutation({
    mutationFn: (payload: UserCreatePayload) => {
      if (!selected) {
        return createUser(payload);
      }

      const updatePayload: UserUpdatePayload = {
        name: payload.name,
        email: payload.email,
        password: payload.password || undefined,
        role: payload.role,
        tenant_id: payload.tenant_id,
        branch_id: payload.branch_id,
      };

      return updateUser(selected.id, updatePayload);
    },
    onSuccess: () => {
      toast.success(selected ? "User updated" : "User created");
      setSelected(null);
      setForm({
        ...initialForm,
        tenant_id: user?.tenant_id ?? 1,
        branch_id: user?.branch_id ?? 1,
        role: effectiveRole === "SUPER_ADMIN" ? "CLIENT_ADMIN" : "BRANCH_MANAGER",
      });
      setModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("User save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User deleted");
      setSelected(null);
      setForm(initialForm);
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("User delete failed"),
  });

  if (!hydrated || usersQuery.isLoading || clientsQuery.isLoading || branchesQuery.isLoading) {
    return <Loading />;
  }

  if (usersQuery.isError || clientsQuery.isError || branchesQuery.isError) {
    return <Error message="Users could not be loaded." />;
  }

  if (!hasRoleAccess(effectiveRole, ["SUPER_ADMIN", "CLIENT_ADMIN"])) {
    return <Error message="Branch managers can operate menu and orders, but they cannot manage users." />;
  }

  const clients = clientsQuery.data ?? [];
  const branches = branchesQuery.data ?? [];
  const visibleClients =
    effectiveRole === "SUPER_ADMIN" ? clients : clients.filter((client) => client.id === user?.tenant_id);
  const visibleBranches = filterBySessionScope(branches, user, effectiveRole);
  const visibleUsers = filterBySessionScope(usersQuery.data ?? [], user, effectiveRole).filter((entry) =>
    effectiveRole === "CLIENT_ADMIN" ? entry.role === "BRANCH_MANAGER" : true,
  );
  const allowedRoles: Array<Exclude<Role, "CUSTOMER">> = (
    ["SUPER_ADMIN", "CLIENT_ADMIN", "BRANCH_MANAGER"] as const
  ).filter((role) => canManageRole(effectiveRole, role));
  const resolvedTenantId =
    effectiveRole === "CLIENT_ADMIN" ? (user?.tenant_id ?? visibleClients[0]?.id ?? null) : (form.tenant_id ?? visibleClients[0]?.id ?? null);
  const scopedBranches =
    resolvedTenantId === null ? [] : visibleBranches.filter((branch) => branch.tenant_id === resolvedTenantId);
  const resolvedBranchId =
    form.role === "BRANCH_MANAGER"
      ? (scopedBranches.find((branch) => branch.id === form.branch_id)?.id ?? scopedBranches[0]?.id ?? null)
      : null;

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="flex items-end justify-between gap-4 border-b border-stone-200 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Users</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">User table</h2>
            <p className="mt-2 text-sm text-stone-500">
              Manage users in a table and use modal forms to add or edit accounts.
            </p>
          </div>
          <Button
            onClick={() => {
              setSelected(null);
              setForm({
                ...initialForm,
                tenant_id: user?.tenant_id ?? visibleClients[0]?.id ?? 1,
                branch_id: user?.branch_id ?? visibleBranches[0]?.id ?? 1,
                role: effectiveRole === "SUPER_ADMIN" ? "CLIENT_ADMIN" : "BRANCH_MANAGER",
              });
              setModalOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            Add user
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-stone-50">
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-stone-500">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Tenant</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((entry) => {
                const branchName = visibleBranches.find((branch) => branch.id === entry.branch_id)?.name ?? "-";
                const clientName = visibleClients.find((client) => client.id === entry.tenant_id)?.name ?? "-";

                return (
                  <tr key={entry.id} className="border-t border-stone-100 text-sm text-stone-700">
                    <td className="px-6 py-4 font-semibold text-stone-950">{entry.name}</td>
                    <td className="px-6 py-4">{entry.email}</td>
                    <td className="px-6 py-4">{formatRole(entry.role)}</td>
                    <td className="px-6 py-4">{clientName}</td>
                    <td className="px-6 py-4">{branchName}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSelected(entry);
                            setForm({
                              name: entry.name,
                              email: entry.email,
                              password: "",
                              role: entry.role as Exclude<Role, "CUSTOMER">,
                              tenant_id: entry.tenant_id,
                              branch_id: entry.branch_id,
                            });
                            setModalOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </Button>
                        <Button variant="danger" onClick={() => deleteMutation.mutate(entry.id)}>
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!visibleUsers.length ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-stone-500">
                    No users found in your current scope.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title={selected ? "Edit user" : "Add user"}
        description="Fill the required details and submit to save user changes."
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
          setForm(initialForm);
        }}
      >
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate({
              ...form,
              tenant_id: resolvedTenantId,
              branch_id: resolvedBranchId,
              role: effectiveRole === "SUPER_ADMIN" ? form.role : "BRANCH_MANAGER",
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="user-name">Name</Label>
            <Input
              id="user-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-password">Password</Label>
            <Input
              id="user-password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              required={!selected}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-role">Role</Label>
            <Select
              id="user-role"
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  role: event.target.value as Exclude<Role, "CUSTOMER">,
                  branch_id: event.target.value === "CLIENT_ADMIN" ? null : current.branch_id,
                }))
              }
            >
              {allowedRoles.map((role) => (
                <option key={role} value={role}>
                  {formatRole(role)}
                </option>
              ))}
            </Select>
          </div>

          {effectiveRole === "SUPER_ADMIN" ? (
            <div className="space-y-2">
              <Label htmlFor="user-tenant">Client / Tenant</Label>
              <Select
                id="user-tenant"
                value={String(resolvedTenantId ?? "")}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    tenant_id: event.target.value ? Number(event.target.value) : null,
                    branch_id: null,
                  }))
                }
              >
                {visibleClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}

          {form.role === "BRANCH_MANAGER" ? (
            <div className="space-y-2">
              <Label htmlFor="user-branch">Branch</Label>
              <Select
                id="user-branch"
                value={String(resolvedBranchId ?? "")}
                onChange={(event) => setForm((current) => ({ ...current, branch_id: Number(event.target.value) }))}
              >
                {scopedBranches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save user"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
