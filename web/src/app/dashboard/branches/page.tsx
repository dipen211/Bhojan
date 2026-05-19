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
import { useSession } from "@/hooks/use-session";
import { createBranch, deleteBranch, getBranches, updateBranch } from "@/services/branch-service";
import { getClients } from "@/services/client-service";
import type { Branch, BranchCreatePayload, BranchUpdatePayload } from "@/types/branch";
import { filterBySessionScope, getEffectiveRole, hasRoleAccess } from "@/utils";

const initialForm: BranchCreatePayload = {
  tenant_id: 1,
  name: "",
  slug: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  email: "",
  manager_name: "",
  opening_time: "08:00",
  closing_time: "22:00",
};

export default function DashboardBranchesPage() {
  const queryClient = useQueryClient();
  const { hydrated, rolePreview, user } = useSession();
  const [selected, setSelected] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchCreatePayload>(initialForm);
  const [modalOpen, setModalOpen] = useState(false);
  const branchQuery = useQuery({ queryKey: ["branches"], queryFn: getBranches });
  const clientQuery = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const effectiveRole = getEffectiveRole(user?.role, rolePreview);

  const saveMutation = useMutation({
    mutationFn: (payload: BranchCreatePayload) => {
      if (!selected) {
        return createBranch(payload);
      }

      const updatePayload: BranchUpdatePayload = {
        name: payload.name,
        slug: payload.slug,
        address: payload.address,
        city: payload.city,
        state: payload.state,
        pincode: payload.pincode,
        phone: payload.phone,
        email: payload.email,
        manager_name: payload.manager_name,
        opening_time: payload.opening_time,
        closing_time: payload.closing_time,
      };

      return updateBranch(selected.id, updatePayload);
    },
    onSuccess: () => {
      toast.success(selected ? "Branch updated" : "Branch created");
      setSelected(null);
      setForm(initialForm);
      setModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: () => toast.error("Branch save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      toast.success("Branch deleted");
      setSelected(null);
      setForm(initialForm);
      void queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: () => toast.error("Branch delete failed"),
  });

  if (!hydrated || branchQuery.isLoading || clientQuery.isLoading) {
    return <Loading />;
  }

  if (branchQuery.isError || clientQuery.isError) {
    return <Error message="Branches could not be loaded." />;
  }

  if (!hasRoleAccess(effectiveRole, ["SUPER_ADMIN", "CLIENT_ADMIN"])) {
    return <Error message="Only super admin and client admin can manage branches." />;
  }

  const visibleBranches = filterBySessionScope(branchQuery.data ?? [], user, effectiveRole);
  const visibleClients =
    effectiveRole === "SUPER_ADMIN"
      ? clientQuery.data ?? []
      : (clientQuery.data ?? []).filter((client) => client.id === user?.tenant_id);
  const resolvedTenantId = effectiveRole === "CLIENT_ADMIN" ? (user?.tenant_id ?? visibleClients[0]?.id ?? 1) : form.tenant_id;

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="flex items-end justify-between gap-4 border-b border-stone-200 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Branches</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">Branch table</h2>
            <p className="mt-2 text-sm text-stone-500">
              Manage branch records in a table and use modals for add and edit flows.
            </p>
          </div>
          <Button
            onClick={() => {
              setSelected(null);
              setForm({
                ...initialForm,
                tenant_id: effectiveRole === "CLIENT_ADMIN" ? resolvedTenantId : initialForm.tenant_id,
              });
              setModalOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            Add branch
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-stone-50">
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-stone-500">
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Manager</th>
                <th className="px-6 py-4">Hours</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleBranches.map((branch) => (
                <tr key={branch.id} className="border-t border-stone-100 text-sm text-stone-700">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-stone-950">{branch.name}</div>
                    <div className="mt-1 text-xs text-stone-500">{branch.address}</div>
                  </td>
                  <td className="px-6 py-4">
                    {branch.city}, {branch.state}
                  </td>
                  <td className="px-6 py-4">{branch.manager_name}</td>
                  <td className="px-6 py-4">
                    {branch.opening_time} - {branch.closing_time}
                  </td>
                  <td className="px-6 py-4">
                    <div>{branch.phone}</div>
                    <div className="mt-1 text-xs text-stone-500">{branch.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelected(branch);
                          setForm({
                            tenant_id: branch.tenant_id,
                            name: branch.name,
                            slug: branch.slug,
                            address: branch.address,
                            city: branch.city,
                            state: branch.state,
                            pincode: branch.pincode,
                            phone: branch.phone,
                            email: branch.email,
                            manager_name: branch.manager_name,
                            opening_time: branch.opening_time,
                            closing_time: branch.closing_time,
                          });
                          setModalOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </Button>
                      <Button variant="danger" onClick={() => deleteMutation.mutate(branch.id)}>
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!visibleBranches.length ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-stone-500">
                    No branches found in your current scope.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title={selected ? "Edit branch" : "Add branch"}
        description="Fill the required details and submit to save branch changes."
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
              tenant_id: effectiveRole === "CLIENT_ADMIN" ? resolvedTenantId : form.tenant_id,
            });
          }}
        >
          {effectiveRole === "SUPER_ADMIN" ? (
            <div className="space-y-2">
              <Label htmlFor="branch-tenant">Client / Tenant</Label>
              <Select
                id="branch-tenant"
                value={String(form.tenant_id)}
                onChange={(event) => setForm((current) => ({ ...current, tenant_id: Number(event.target.value) }))}
              >
                {visibleClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}

          {[
            "name",
            "slug",
            "address",
            "city",
            "state",
            "pincode",
            "phone",
            "email",
            "manager_name",
            "opening_time",
            "closing_time",
          ].map((key) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`branch-${key}`}>{key.replaceAll("_", " ")}</Label>
              <Input
                id={`branch-${key}`}
                type={key.includes("time") ? "time" : key === "email" ? "email" : "text"}
                value={String(form[key as keyof BranchCreatePayload])}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                required
              />
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save branch"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
