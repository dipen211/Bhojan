import { api } from "./api";

import type { LoginPayload, LoginResponse, RegisterPayload, SessionUser } from "@/types/auth";

export async function register(payload: RegisterPayload) {
  const response = await api.post("/auth/register", payload);
  return response.data.data as SessionUser;
}

export async function login(payload: LoginPayload) {
  const response = await api.post("/auth/login", payload);
  return response.data.data as LoginResponse;
}
