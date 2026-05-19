export interface Branch {
  id: number;
  tenant_id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  manager_name: string;
  opening_time: string;
  closing_time: string;
  is_active?: boolean;
}

export interface BranchCreatePayload {
  tenant_id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  manager_name: string;
  opening_time: string;
  closing_time: string;
}

export type BranchUpdatePayload = Omit<BranchCreatePayload, "tenant_id">;
