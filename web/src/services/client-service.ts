import { api } from "./api";

import type { Client, ClientPayload } from "@/types/client";

export async function getClients() {
  const response = await api.get("/clients");

  return response.data.data as Client[];
}

export async function getClient(clientId: number) {
  const response = await api.get(`/clients/${clientId}`);
  return response.data.data as Client;
}

export async function createClient(payload: ClientPayload) {
  const response = await api.post("/clients", payload);
  return response.data.data as Client;
}

export async function updateClient(clientId: number, payload: ClientPayload) {
  const response = await api.put(`/clients/${clientId}`, payload);
  return response.data.data as Client;
}

export async function deleteClient(clientId: number) {
  const response = await api.delete(`/clients/${clientId}`);
  return response.data;
}
