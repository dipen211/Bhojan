export interface MenuItem {
  id: number;
  tenant_id: number;
  branch_id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  is_veg: boolean;
  is_available: boolean;
  preparation_time: number;
  image: string;
  is_active?: boolean;
}

export interface MenuItemCreatePayload {
  tenant_id: number;
  branch_id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  is_veg: boolean;
  preparation_time: number;
  image: string;
}

export interface MenuItemUpdatePayload {
  name: string;
  description: string;
  price: number;
  is_veg: boolean;
  is_available: boolean;
  preparation_time: number;
  image: string;
}
