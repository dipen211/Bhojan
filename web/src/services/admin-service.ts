import { api } from "./api";

import type { SessionUser } from "@/types/auth";

export async function getAdminDashboard() {
  const response = await api.get("/admin/dashboard");
  return response.data.data as { user: SessionUser };
}
