import { api } from "./api";
import type { Order, OrderCreatePayload, OrderStatusUpdatePayload } from "@/types/order";

export async function getOrders() {
  const response = await api.get("/orders");
  return response.data.data as Order[];
}

export async function getBranchOrders(branchId: number) {
  const response = await api.get(`/orders/branch/${branchId}`);
  return response.data.data as Order[];
}

export async function getOrder(orderId: number) {
  const response = await api.get(`/orders/${orderId}`);
  return response.data.data as Order;
}

export async function createOrder(payload: OrderCreatePayload) {
  const response = await api.post("/orders", payload);
  return response.data.data as Order;
}

export async function updateOrderStatus(orderId: number, payload: OrderStatusUpdatePayload) {
  const response = await api.patch(`/orders/${orderId}/status`, payload);
  return response.data.data as Order;
}
