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
import { getBranches } from "@/services/branch-service";
import { createCategory, deleteCategory, getCategories, updateCategory } from "@/services/category-service";
import type { Category, CategoryCreatePayload, CategoryUpdatePayload } from "@/types/category";
import { filterBySessionScope, getEffectiveRole, hasRoleAccess } from "@/utils";

const initialForm: CategoryCreatePayload = {
  tenant_id: 1,
  branch_id: 1,
  name: "",
  sort_order: 1,
};

export default function DashboardCategoriesPage() {
  const queryClient = useQueryClient();
  const { hydrated, rolePreview, user } = useSession();
  const [selected, setSelected] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryCreatePayload>(initialForm);
  const [modalOpen, setModalOpen] = useState(false);
  const categoryQuery = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const branchQuery = useQuery({ queryKey: ["branches"], queryFn: getBranches });
  const effectiveRole = getEffectiveRole(user?.role, rolePreview);

  const saveMutation = useMutation({
    mutationFn: (payload: CategoryCreatePayload) => {
      if (!selected) {
        return createCategory(payload);
      }

      const updatePayload: CategoryUpdatePayload = {
        name: payload.name,
        sort_order: payload.sort_order,
      };

      return updateCategory(selected.id, updatePayload);
    },
    onSuccess: () => {
      toast.success(selected ? "Category updated" : "Category created");
      setSelected(null);
      setForm(initialForm);
      setModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("Category save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted");
      setSelected(null);
      setForm(initialForm);
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("Category delete failed"),
  });

  if (!hydrated || categoryQuery.isLoading || branchQuery.isLoading) {
    return <Loading />;
  }

  if (categoryQuery.isError || branchQuery.isError) {
    return <Error message="Categories could not be loaded." />;
  }

  if (!hasRoleAccess(effectiveRole, ["CLIENT_ADMIN", "BRANCH_MANAGER"])) {
    return <Error message="Categories are available only to client admin and branch manager roles." />;
  }

  const branches = filterBySessionScope(branchQuery.data ?? [], user, effectiveRole);
  const visibleCategories = filterBySessionScope(categoryQuery.data ?? [], user, effectiveRole);
  const resolvedBranchId =
    effectiveRole === "BRANCH_MANAGER"
      ? (user?.branch_id ?? branches[0]?.id ?? initialForm.branch_id)
      : (branches.find((branch) => branch.id === form.branch_id)?.id ?? branches[0]?.id ?? initialForm.branch_id);
  const activeBranch = branches.find((branch) => branch.id === resolvedBranchId);

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="flex items-end justify-between gap-4 border-b border-stone-200 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Categories</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">Category table</h2>
            <p className="mt-2 text-sm text-stone-500">
              Manage menu categories in one place with table actions and modal-based editing.
            </p>
          </div>
          <Button
            onClick={() => {
              setSelected(null);
              setForm(initialForm);
              setModalOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            Add category
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-stone-50">
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-stone-500">
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Sort Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCategories.map((category) => {
                const branch = branches.find((item) => item.id === category.branch_id);

                return (
                  <tr key={category.id} className="border-t border-stone-100 text-sm text-stone-700">
                    <td className="px-6 py-4 font-semibold text-stone-950">{category.name}</td>
                    <td className="px-6 py-4">{branch?.name ?? "-"}</td>
                    <td className="px-6 py-4">{category.sort_order}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSelected(category);
                            setForm({
                              tenant_id: category.tenant_id,
                              branch_id: category.branch_id,
                              name: category.name,
                              sort_order: category.sort_order,
                            });
                            setModalOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </Button>
                        <Button variant="danger" onClick={() => deleteMutation.mutate(category.id)}>
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!visibleCategories.length ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-stone-500">
                    No categories found in your current scope.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title={selected ? "Edit category" : "Add category"}
        description="Fill the required details and submit to save category changes."
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
            if (!activeBranch) {
              toast.error("No branch is available for this role");
              return;
            }

            saveMutation.mutate({
              ...form,
              branch_id: activeBranch.id,
              tenant_id: activeBranch.tenant_id,
            });
          }}
        >
          {effectiveRole === "CLIENT_ADMIN" ? (
            <div className="space-y-2">
              <Label htmlFor="category-branch">Branch</Label>
              <Select
                id="category-branch"
                value={String(resolvedBranchId)}
                onChange={(event) => setForm((current) => ({ ...current, branch_id: Number(event.target.value) }))}
              >
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="category-branch-readonly">Branch</Label>
              <Input id="category-branch-readonly" value={activeBranch?.name ?? ""} readOnly />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category-name">Category name</Label>
            <Input
              id="category-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort-order">Sort order</Label>
            <Input
              id="sort-order"
              type="number"
              value={String(form.sort_order)}
              onChange={(event) => setForm((current) => ({ ...current, sort_order: Number(event.target.value) }))}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save category"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
