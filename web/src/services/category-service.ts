import { api } from "./api";
import type { Category, CategoryCreatePayload, CategoryUpdatePayload } from "@/types/category";

export async function getCategories() {
  const response = await api.get("/categories");
  return response.data.data as Category[];
}

export async function getBranchCategories(branchId: number) {
  const response = await api.get(`/categories/branch/${branchId}`);
  return response.data.data as Category[];
}

export async function createCategory(payload: CategoryCreatePayload) {
  const response = await api.post("/categories", payload);
  return response.data.data as Category;
}

export async function updateCategory(categoryId: number, payload: CategoryUpdatePayload) {
  const response = await api.put(`/categories/${categoryId}`, payload);
  return response.data.data as Category;
}

export async function deleteCategory(categoryId: number) {
  const response = await api.delete(`/categories/${categoryId}`);
  return response.data;
}
