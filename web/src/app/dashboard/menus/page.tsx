"use client";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import Modal from "@/components/modals/modal";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Error from "@/components/ui/error";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import Loading from "@/components/ui/loading";
import { useSession } from "@/hooks/use-session";
import { getBranches } from "@/services/branch-service";
import { getCategories } from "@/services/category-service";
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItems,
  updateMenuItem,
} from "@/services/menu-item-service";
import type { MenuItem, MenuItemCreatePayload, MenuItemUpdatePayload } from "@/types/menu-item";
import { filterBySessionScope, formatCurrency, getEffectiveRole, hasRoleAccess } from "@/utils";

const initialForm: MenuItemCreatePayload = {
  tenant_id: 1,
  branch_id: 1,
  category_id: 1,
  name: "",
  description: "",
  price: 0,
  is_veg: true,
  preparation_time: 10,
  image: "",
};

export default function DashboardMenusPage() {
  const queryClient = useQueryClient();
  const { hydrated, rolePreview, user } = useSession();
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuItemCreatePayload>(initialForm);
  const [modalOpen, setModalOpen] = useState(false);

  const menuItemsQuery = useQuery({ queryKey: ["menu-items"], queryFn: getMenuItems });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const branchesQuery = useQuery({ queryKey: ["branches"], queryFn: getBranches });
  const effectiveRole = getEffectiveRole(user?.role, rolePreview);

  const saveMutation = useMutation({
    mutationFn: (payload: MenuItemCreatePayload) => {
      if (!selected) {
        return createMenuItem(payload);
      }

      const updatePayload: MenuItemUpdatePayload = {
        name: payload.name,
        description: payload.description,
        price: payload.price,
        is_veg: payload.is_veg,
        is_available: selected.is_available,
        preparation_time: payload.preparation_time,
        image: payload.image,
      };

      return updateMenuItem(selected.id, updatePayload);
    },
    onSuccess: () => {
      toast.success(selected ? "Menu updated" : "Menu created");
      setSelected(null);
      setForm(initialForm);
      setModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
    onError: () => toast.error("Menu save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      toast.success("Menu deleted");
      setSelected(null);
      setForm(initialForm);
      void queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
    onError: () => toast.error("Menu delete failed"),
  });

  if (!hydrated || menuItemsQuery.isLoading || categoriesQuery.isLoading || branchesQuery.isLoading) {
    return <Loading />;
  }

  if (menuItemsQuery.isError || categoriesQuery.isError || branchesQuery.isError) {
    return <Error message="Menu data could not be loaded." />;
  }

  if (!hasRoleAccess(effectiveRole, ["CLIENT_ADMIN", "BRANCH_MANAGER"])) {
    return <Error message="Menus are available only to client admin and branch manager roles." />;
  }

  const branches = filterBySessionScope(branchesQuery.data ?? [], user, effectiveRole);
  const categories = filterBySessionScope(categoriesQuery.data ?? [], user, effectiveRole);
  const items = filterBySessionScope(menuItemsQuery.data ?? [], user, effectiveRole);
  const resolvedBranchId =
    effectiveRole === "BRANCH_MANAGER"
      ? (user?.branch_id ?? branches[0]?.id ?? initialForm.branch_id)
      : (branches.find((branch) => branch.id === form.branch_id)?.id ?? branches[0]?.id ?? initialForm.branch_id);
  const branchCategories = categories.filter((category) => category.branch_id === resolvedBranchId);
  const resolvedCategoryId =
    branchCategories.find((category) => category.id === form.category_id)?.id ?? branchCategories[0]?.id ?? initialForm.category_id;
  const activeBranch = branches.find((branch) => branch.id === resolvedBranchId);

  const rows = items.map((item) => ({
    ...item,
    branchName: branches.find((branch) => branch.id === item.branch_id)?.name ?? "-",
    categoryName: categories.find((category) => category.id === item.category_id)?.name ?? "-",
  }));

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="flex items-end justify-between gap-4 border-b border-stone-200 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Menu management</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">Menu table</h2>
            <p className="mt-2 text-sm text-stone-500">
              Manage menu items from a single table with modal-based add and edit actions.
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
            Add menu
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-stone-50">
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-stone-500">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Food Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-t border-stone-100 text-sm text-stone-700">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-stone-950">{item.name}</div>
                    <div className="mt-1 max-w-sm text-xs text-stone-500">{item.description}</div>
                  </td>
                  <td className="px-6 py-4">{item.branchName}</td>
                  <td className="px-6 py-4">{item.categoryName}</td>
                  <td className="px-6 py-4">{formatCurrency(item.price)}</td>
                  <td className="px-6 py-4">{item.is_veg ? "Veg" : "Non Veg"}</td>
                  <td className="px-6 py-4">{item.is_available ? "Available" : "Paused"}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelected(item);
                          setForm({
                            tenant_id: item.tenant_id,
                            branch_id: item.branch_id,
                            category_id: item.category_id,
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            is_veg: item.is_veg,
                            preparation_time: item.preparation_time,
                            image: item.image,
                          });
                          setModalOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </Button>
                      <Button variant="danger" onClick={() => deleteMutation.mutate(item.id)}>
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-stone-500">
                    No menu items found in your current scope.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title={selected ? "Edit menu" : "Add menu"}
        description="Fill the required details and submit to save menu changes."
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
              tenant_id: activeBranch.tenant_id,
              branch_id: resolvedBranchId,
              category_id: resolvedCategoryId,
            });
          }}
        >
          {effectiveRole === "CLIENT_ADMIN" ? (
            <div className="space-y-2">
              <Label htmlFor="menu-branch">Branch</Label>
              <Select
                id="menu-branch"
                value={String(resolvedBranchId)}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    branch_id: Number(event.target.value),
                    category_id:
                      categories.find((category) => category.branch_id === Number(event.target.value))?.id ??
                      current.category_id,
                  }))
                }
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
              <Label htmlFor="menu-branch-readonly">Branch</Label>
              <Input id="menu-branch-readonly" value={activeBranch?.name ?? ""} readOnly />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="menu-category">Category</Label>
            <Select
              id="menu-category"
              value={String(resolvedCategoryId)}
              onChange={(event) => setForm((current) => ({ ...current, category_id: Number(event.target.value) }))}
            >
              {branchCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu-name">Name</Label>
            <Input
              id="menu-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu-description">Description</Label>
            <Textarea
              id="menu-description"
              rows={3}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="menu-price">Price</Label>
              <Input
                id="menu-price"
                type="number"
                value={String(form.price)}
                onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-prep-time">Preparation time</Label>
              <Input
                id="menu-prep-time"
                type="number"
                value={String(form.preparation_time)}
                onChange={(event) =>
                  setForm((current) => ({ ...current, preparation_time: Number(event.target.value) }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu-image">Image URL</Label>
            <Input
              id="menu-image"
              value={form.image}
              onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu-food-type">Food type</Label>
            <Select
              id="menu-food-type"
              value={form.is_veg ? "veg" : "non-veg"}
              onChange={(event) => setForm((current) => ({ ...current, is_veg: event.target.value === "veg" }))}
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non Veg</option>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save menu"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
