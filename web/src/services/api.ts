import axios from "axios";

import { apiRoot } from "@/utils";

export const api = axios.create({
  baseURL: apiRoot(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem("bhojan-session");

    if (raw) {
      const parsed = JSON.parse(raw) as {
        state?: { token?: string | null };
      };
      const token = parsed.state?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }

  return config;
});
