export interface Menu {
  id: number;
  name: string;
  price: number;
  is_available: boolean;
  branch_id: number;
}

export interface MenuCreatePayload {
  name: string;
  price: number;
  is_available: boolean;
  branch_id: number;
}
