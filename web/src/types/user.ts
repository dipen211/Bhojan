import type { Role } from "@/types/auth";

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  tenant_id: number | null;
  branch_id: number | null;
}

export interface UserCreatePayload {
  name: string;
  email: string;
  password: string;
  role: Exclude<Role, "CUSTOMER">;
  tenant_id: number | null;
  branch_id: number | null;
}

export interface UserUpdatePayload {
  name: string;
  email: string;
  password?: string;
  role: Exclude<Role, "CUSTOMER">;
  tenant_id: number | null;
  branch_id: number | null;
}
