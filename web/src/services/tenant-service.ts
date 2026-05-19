import { api } from "./api";

import type { Tenant } from "@/types/tenant";

export async function getTenantContext() {
  const response = await api.get("/tenant");
  return response.data.data as Tenant | null;
}
