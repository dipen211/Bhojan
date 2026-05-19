import { api } from "./api";
import type { MenuItem, MenuItemCreatePayload, MenuItemUpdatePayload } from "@/types/menu-item";

export async function getMenuItems() {
  const response = await api.get("/menu-items");
  return response.data.data as MenuItem[];
}

export async function getBranchMenuItems(branchId: number) {
  const response = await api.get(`/menu-items/branch/${branchId}`);
  return response.data.data as MenuItem[];
}

export async function createMenuItem(payload: MenuItemCreatePayload) {
  const response = await api.post("/menu-items", payload);
  return response.data.data as MenuItem;
}

export async function updateMenuItem(itemId: number, payload: MenuItemUpdatePayload) {
  const response = await api.put(`/menu-items/${itemId}`, payload);
  return response.data.data as MenuItem;
}

export async function deleteMenuItem(itemId: number) {
  const response = await api.delete(`/menu-items/${itemId}`);
  return response.data;
}
