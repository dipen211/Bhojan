export type Role =
  | "SUPER_ADMIN"
  | "CLIENT_ADMIN"
  | "BRANCH_MANAGER"
  | "CUSTOMER";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  tenant_id: number | null;
  branch_id: number | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: SessionUser;
}
