import type { Role, SessionUser } from "@/types/auth";

export function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRole(role: Role) {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getEffectiveRole(userRole: Role | null | undefined, rolePreview: Role | null) {
  return userRole ?? rolePreview ?? "SUPER_ADMIN";
}

export function hasRoleAccess(role: Role, allowedRoles: Role[]) {
  return allowedRoles.includes(role);
}

export function canManageRole(currentRole: Role, targetRole: Role) {
  if (currentRole === "SUPER_ADMIN") {
    return targetRole !== "CUSTOMER";
  }

  if (currentRole === "CLIENT_ADMIN") {
    return targetRole === "BRANCH_MANAGER";
  }

  return false;
}

export function filterBySessionScope<T extends { tenant_id?: number | null; branch_id?: number | null }>(
  records: T[],
  user: SessionUser | null,
  role: Role,
) {
  if (role === "SUPER_ADMIN" || !user) {
    return records;
  }

  if (role === "CLIENT_ADMIN") {
    return records.filter((record) => record.tenant_id === user.tenant_id);
  }

  if (role === "BRANCH_MANAGER") {
    return records.filter((record) => record.branch_id === user.branch_id);
  }

  return records;
}

export function getStatusTone(status: string) {
  switch (status) {
    case "DELIVERED":
      return "success";
    case "READY":
      return "warning";
    case "CANCELLED":
      return "danger";
    default:
      return "default";
  }
}

export function getInitials(value: string) {
  return value
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function apiRoot() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1").replace(/\/+$/, "");
}

export function websocketRoot() {
  return apiRoot().replace(/\/api\/v1$/, "").replace(/^http/, "ws");
}
