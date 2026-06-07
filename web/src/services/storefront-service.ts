import { api } from "./api";
import type { Branch } from "@/types/branch";
import type { Category } from "@/types/category";
import type { Client } from "@/types/client";
import type { MenuItem } from "@/types/menu-item";
import type { Order, OrderCreatePayload } from "@/types/order";

export interface StorefrontData {
  client: Client;
  branch: Branch;
  categories: Category[];
  menu_items: MenuItem[];
}

export async function getStorefront(tenantSlug: string, branchSlug: string) {
  const response = await api.get(`/storefront/${tenantSlug}/${branchSlug}`);
  return response.data.data as StorefrontData;
}

export async function createStorefrontOrder(
  tenantSlug: string,
  branchSlug: string,
  payload: OrderCreatePayload,
) {
  const response = await api.post(`/storefront/${tenantSlug}/${branchSlug}/orders`, payload);
  return response.data.data as Order;
}

export async function getStorefrontOrder(tenantSlug: string, branchSlug: string, orderId: number, token: string) {
  const response = await api.get(`/storefront/${tenantSlug}/${branchSlug}/orders/${orderId}`, {
    params: { token },
  });
  return response.data.data as Order;
}

export async function cancelStorefrontOrder(
  tenantSlug: string,
  branchSlug: string,
  orderId: number,
  token: string,
) {
  const response = await api.patch(`/storefront/${tenantSlug}/${branchSlug}/orders/${orderId}/cancel`, null, {
    params: { token },
  });
  return response.data.data as Order;
}
