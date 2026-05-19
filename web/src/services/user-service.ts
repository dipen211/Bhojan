import { api } from "./api";

import type { AppUser, UserCreatePayload, UserUpdatePayload } from "@/types/user";

interface UserFilters {
  role?: string;
  tenantId?: number | null;
  branchId?: number | null;
}

export async function getUsers(filters: UserFilters = {}) {
  const response = await api.get("/users", {
    params: {
      role: filters.role,
      tenant_id: filters.tenantId ?? undefined,
      branch_id: filters.branchId ?? undefined,
    },
  });

  return response.data.data as AppUser[];
}

export async function createUser(payload: UserCreatePayload) {
  const response = await api.post("/users", payload);
  return response.data.data as AppUser;
}

export async function updateUser(userId: number, payload: UserUpdatePayload) {
  const response = await api.put(`/users/${userId}`, payload);
  return response.data.data as AppUser;
}

export async function deleteUser(userId: number) {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
}
