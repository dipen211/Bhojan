"use client";

import { useQuery } from "@tanstack/react-query";

import { getClients } from "@/services/client-service";

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });
}
