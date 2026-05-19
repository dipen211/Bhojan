export interface Category {
  id: number;
  tenant_id: number;
  branch_id: number;
  name: string;
  sort_order: number;
  is_active?: boolean;
}

export interface CategoryCreatePayload {
  tenant_id: number;
  branch_id: number;
  name: string;
  sort_order: number;
}

export interface CategoryUpdatePayload {
  name: string;
  sort_order: number;
}
