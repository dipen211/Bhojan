import type { Role } from "@/types/auth";

export const ROLE_OPTIONS: Array<{
  value: Role;
  label: string;
  description: string;
}> = [
  {
    value: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Owns the portfolio, client network, and reporting.",
  },
  {
    value: "CLIENT_ADMIN",
    label: "Client Admin",
    description: "Runs a brand, branches, menu, and business operations.",
  },
  {
    value: "BRANCH_MANAGER",
    label: "Branch Manager",
    description: "Controls in-store menu availability and order execution.",
  },
  {
    value: "CUSTOMER",
    label: "Customer",
    description: "Browses the storefront, builds cart, and tracks orders.",
  },
];

export const DASHBOARD_LINKS = [
  {
    href: "/dashboard",
    label: "Overview",
    roles: ["SUPER_ADMIN", "CLIENT_ADMIN", "BRANCH_MANAGER"] as Role[],
  },
  {
    href: "/dashboard/clients",
    label: "Clients",
    roles: ["SUPER_ADMIN"] as Role[],
  },
  {
    href: "/dashboard/branches",
    label: "Branches",
    roles: ["CLIENT_ADMIN"] as Role[],
  },
  {
    href: "/dashboard/users",
    label: "Users",
    roles: ["CLIENT_ADMIN"] as Role[],
  },
  {
    href: "/dashboard/categories",
    label: "Categories",
    roles: ["CLIENT_ADMIN", "BRANCH_MANAGER"] as Role[],
  },
  {
    href: "/dashboard/menus",
    label: "Menu",
    roles: ["CLIENT_ADMIN", "BRANCH_MANAGER"] as Role[],
  },
  {
    href: "/dashboard/orders",
    label: "Orders",
    roles: ["CLIENT_ADMIN", "BRANCH_MANAGER"] as Role[],
  },
];

export const ORDER_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
] as const;

export const PAYMENT_STATUSES = ["PAID", "COD", "PENDING"] as const;

export const CUSTOMER_STORE_FRONT = {
  tenant: "chulo",
  branch: "hitechdigital",
};

export const SEEDED_LOGINS = [
  {
    label: "Super Admin",
    email: "admin@bhojan.com",
    password: "admin123",
    role: "SUPER_ADMIN" as Role,
  },
  {
    label: "Client Admin",
    email: "owner@chulo.com",
    password: "admin123",
    role: "CLIENT_ADMIN" as Role,
  },
  {
    label: "Branch Manager",
    email: "hitech.manager@chulo.com",
    password: "admin123",
    role: "BRANCH_MANAGER" as Role,
  },
];
