import { api } from "./api";
import type { Branch, BranchCreatePayload, BranchUpdatePayload } from "@/types/branch";

export async function getBranches() {
  const response = await api.get("/branches");
  return response.data.data as Branch[];
}

export async function getBranch(branchId: number) {
  const response = await api.get(`/branches/${branchId}`);
  return response.data.data as Branch;
}

export async function getTenantBranches(tenantId: number) {
  const response = await api.get(`/branches/tenant/${tenantId}`);
  return response.data.data as Branch[];
}

export async function createBranch(payload: BranchCreatePayload) {
  const response = await api.post("/branches", payload);
  return response.data.data as Branch;
}

export async function updateBranch(branchId: number, payload: BranchUpdatePayload) {
  const response = await api.put(`/branches/${branchId}`, payload);
  return response.data.data as Branch;
}

export async function deleteBranch(branchId: number) {
  const response = await api.delete(`/branches/${branchId}`);
  return response.data;
}
