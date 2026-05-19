import { api } from "./api";

import type { Menu, MenuCreatePayload } from "@/types/menu";

export async function getMenus() {
  const response = await api.get("/menus");
  return response.data.data as Menu[];
}

export async function createMenu(payload: MenuCreatePayload) {
  const response = await api.post("/menus", payload);
  return response.data.data as Menu;
}
