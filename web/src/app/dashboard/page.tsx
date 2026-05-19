"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Eye,
  PackageCheck,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Users2,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";

import DashboardWidget from "@/components/dashboard/dashboard-widget";
import Modal from "@/components/modals/modal";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Error from "@/components/ui/error";
import { Input, Label } from "@/components/ui/field";
import Loading from "@/components/ui/loading";
import { useSession } from "@/hooks/use-session";
import { getBranches } from "@/services/branch-service";
import {
  createClient,
  deleteClient,
  getClients,
  updateClient,
} from "@/services/client-service";
import { getMenuItems } from "@/services/menu-item-service";
import { getOrders } from "@/services/order-service";
import { getUsers } from "@/services/user-service";
import type { Client, ClientPayload } from "@/types/client";
import { filterBySessionScope, formatCurrency, getEffectiveRole } from "@/utils";

const PAGE_SIZE = 10;
const emptyForm: ClientPayload = {
  name: "",
  company_name: "",
  email: "",
  phone: "",
  slug: "",
  domain: "",
};

export default function DashboardPage() {
  const router = useRouter();
  const { hydrated, rolePreview, user } = useSession();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientPayload>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const branchesQuery = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
  });
  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });
  const menuItemsQuery = useQuery({
    queryKey: ["menu-items"],
    queryFn: getMenuItems,
  });
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: ClientPayload) =>
      selected ? updateClient(selected.id, payload) : createClient(payload),
    onSuccess: () => {
      toast.success(selected ? "Client updated" : "Client created");
      setSelected(null);
      setForm(emptyForm);
      setModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: () => toast.error("Client save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      toast.success("Client deleted");
      setSelected(null);
      setForm(emptyForm);
      void queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: () => toast.error("Client delete failed"),
  });

  if (!hydrated) {
    return <Loading />;
  }

  if (
    clientsQuery.isLoading ||
    branchesQuery.isLoading ||
    ordersQuery.isLoading ||
    menuItemsQuery.isLoading ||
    usersQuery.isLoading
  ) {
    return <Loading />;
  }

  if (
    clientsQuery.isError ||
    branchesQuery.isError ||
    ordersQuery.isError ||
    menuItemsQuery.isError ||
    usersQuery.isError
  ) {
    return <Error message="Dashboard data could not be loaded." />;
  }

  const effectiveRole = getEffectiveRole(user?.role, rolePreview);
  const clients = clientsQuery.data ?? [];
  const branches = filterBySessionScope(
    branchesQuery.data ?? [],
    user,
    effectiveRole,
  );
  const orders = filterBySessionScope(
    ordersQuery.data ?? [],
    user,
    effectiveRole,
  );
  const menuItems = filterBySessionScope(
    menuItemsQuery.data ?? [],
    user,
    effectiveRole,
  );
  const users = filterBySessionScope(
    usersQuery.data ?? [],
    user,
    effectiveRole,
  );

  if (!["SUPER_ADMIN", "CLIENT_ADMIN", "BRANCH_MANAGER"].includes(effectiveRole)) {
    return (
      <Error message="This dashboard experience is reserved for super admin. Use the sidebar modules for role-specific management." />
    );
  }

  const activeClients = clients.filter((client) => client.is_active !== false);
  const inactiveClients = clients.filter(
    (client) => client.is_active === false,
  );
  const totalPages = Math.max(1, Math.ceil(clients.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedClients = clients.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const clientSummaries = clients.map((client) => {
    const clientBranches = branches.filter(
      (branch) => branch.tenant_id === client.id,
    );
    const clientUsers = users.filter((entry) => entry.tenant_id === client.id);
    const clientAdmins = clientUsers.filter(
      (entry) => entry.role === "CLIENT_ADMIN",
    ).length;
    const branchManagers = clientUsers.filter(
      (entry) => entry.role === "BRANCH_MANAGER",
    ).length;

    return {
      ...client,
      branchCount: clientBranches.length,
      userCount: clientUsers.length,
      clientAdmins,
      branchManagers,
    };
  });

  const maxBranchCount = Math.max(
    ...clientSummaries.map((item) => item.branchCount),
    1,
  );
  const maxUserCount = Math.max(
    ...clientSummaries.map((item) => item.userCount),
    1,
  );
  const branchManagers = users.filter((entry) => entry.role === "BRANCH_MANAGER");
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) => order.status === "PENDING").length;
  const deliveredOrders = orders.filter((order) => order.status === "DELIVERED").length;
  const preparingOrders = orders.filter((order) =>
    ["ACCEPTED", "PREPARING", "READY"].includes(order.status),
  ).length;
  const completedOrders = deliveredOrders;

  if (effectiveRole === "CLIENT_ADMIN") {
    const branchSummaries = branches.map((branch) => {
      const branchOrders = orders.filter((order) => order.branch_id === branch.id);

      return {
        ...branch,
        revenue: branchOrders.reduce((sum, order) => sum + order.total_amount, 0),
        orderCount: branchOrders.length,
        managerCount: branchManagers.filter((entry) => entry.branch_id === branch.id).length,
      };
    });
    const maxBranchRevenue = Math.max(...branchSummaries.map((item) => item.revenue), 1);
    const maxBranchOrders = Math.max(...branchSummaries.map((item) => item.orderCount), 1);

    return (
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <DashboardWidget
            label="Branches"
            value={String(branches.length)}
            hint="All your branches"
            handleNavigate={() => {
              router.push("/dashboard/branches");
            }}
          />
          <DashboardWidget
            label="Revenue"
            value={formatCurrency(totalRevenue)}
            hint="Revenue from orders in your scope"
            handleNavigate={() => {
              router.push("/dashboard/orders");
            }}
          />
          <DashboardWidget
            label="Branch Managers"
            value={String(branchManagers.length)}
            hint="Managers assigned to your branches"
            handleNavigate={() => {
              router.push("/dashboard/users");
            }}
          />
          <DashboardWidget
            label="Orders"
            value={String(totalOrders)}
            hint="All orders you can review"
            handleNavigate={() => {
              router.push("/dashboard/orders");
            }}
          />
        </div>

        <div className="grid gap-6">
          <Card className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-stone-900">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                  Branch performance
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                  Revenue and orders by branch
                </h2>
              </div>
            </div>

            <div className="grid xl:grid-cols-2 gap-4">
              {branchSummaries.map((branch) => (
                <div
                  key={branch.id}
                  className="rounded-[24px] border border-stone-200 bg-white/80 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-stone-950">
                        {branch.name}
                      </p>
                      <p className="mt-1 text-sm text-stone-500">
                        {branch.city}, {branch.state}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${branch.is_active !== false ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                    >
                      {branch.is_active !== false ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="rounded-[20px] bg-stone-50 p-4">
                      <div className="text-xs uppercase tracking-[0.16em] text-stone-500">
                        Revenue
                      </div>
                      <div className="mt-2 text-lg font-semibold text-stone-950">
                        {formatCurrency(branch.revenue)}
                      </div>
                    </div>
                    <div className="rounded-[20px] bg-stone-50 p-4">
                      <div className="text-xs uppercase tracking-[0.16em] text-stone-500">
                        Orders
                      </div>
                      <div className="mt-2 text-lg font-semibold text-stone-950">
                        {branch.orderCount}
                      </div>
                    </div>
                    <div className="rounded-[20px] bg-stone-50 p-4">
                      <div className="text-xs uppercase tracking-[0.16em] text-stone-500">
                        Branch Managers
                      </div>
                      <div className="mt-2 text-lg font-semibold text-stone-950">
                        {branch.managerCount}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-stone-500">
                        <span>Revenue share</span>
                        <span>{formatCurrency(branch.revenue)}</span>
                      </div>
                      <div className="h-3 rounded-full bg-stone-100">
                        <div
                          className="h-3 rounded-full bg-[linear-gradient(90deg,#f6c354,#ea9254)]"
                          style={{ width: `${(branch.revenue / maxBranchRevenue) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-stone-500">
                        <span>Order share</span>
                        <span>{branch.orderCount}</span>
                      </div>
                      <div className="h-3 rounded-full bg-stone-100">
                        <div
                          className="h-3 rounded-full bg-[linear-gradient(90deg,#24170e,#6a4a2c)]"
                          style={{ width: `${(branch.orderCount / maxBranchOrders) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (effectiveRole === "BRANCH_MANAGER") {
    const currentBranch = branches[0];
    const availableItems = menuItems.filter((item) => item.is_available).length;
    const pausedItems = menuItems.filter((item) => !item.is_available).length;
    const vegItems = menuItems.filter((item) => item.is_veg).length;
    const nonVegItems = menuItems.filter((item) => !item.is_veg).length;
    const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
    const completionRate = totalOrders ? (completedOrders / totalOrders) * 100 : 0;

    return (
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <DashboardWidget
            label="Revenue"
            value={formatCurrency(totalRevenue)}
            hint="Branch revenue in your scope"
            handleNavigate={() => router.push("/dashboard/orders")}
          />
          <DashboardWidget
            label="Completed Orders"
            value={String(completedOrders)}
            hint="Delivered orders for this branch"
            handleNavigate={() => router.push("/dashboard/orders")}
          />
          <DashboardWidget
            label="Total Orders"
            value={String(totalOrders)}
            hint="All orders assigned to this branch"
            handleNavigate={() => router.push("/dashboard/orders")}
          />
          <DashboardWidget
            label="Menu Items"
            value={String(menuItems.length)}
            hint="Items you can manage in this branch"
            handleNavigate={() => router.push("/dashboard/menus")}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-stone-900">
                <ShoppingBag className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                  Branch operations
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                  Orders and kitchen-ready flow
                </h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-stone-200 bg-white/80 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Pending orders
                </p>
                <p className="mt-4 text-4xl font-semibold text-stone-950">{pendingOrders}</p>
                <p className="mt-2 text-sm text-stone-500">
                  Orders waiting for branch action
                </p>
              </div>
              <div className="rounded-[24px] border border-stone-200 bg-white/80 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Preparing queue
                </p>
                <p className="mt-4 text-4xl font-semibold text-stone-950">{preparingOrders}</p>
                <p className="mt-2 text-sm text-stone-500">
                  Accepted, preparing, and ready orders
                </p>
              </div>
              <div className="rounded-[24px] border border-stone-200 bg-white/80 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Average order value
                </p>
                <p className="mt-4 text-4xl font-semibold text-stone-950">
                  {formatCurrency(averageOrderValue)}
                </p>
                <p className="mt-2 text-sm text-stone-500">
                  Revenue per order for this branch
                </p>
              </div>
              <div className="rounded-[24px] border border-stone-200 bg-white/80 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Completion rate
                </p>
                <p className="mt-4 text-4xl font-semibold text-stone-950">
                  {completionRate.toFixed(0)}%
                </p>
                <p className="mt-2 text-sm text-stone-500">
                  Delivered orders out of total orders
                </p>
              </div>
            </div>

            <div className="rounded-[24px] bg-stone-50 p-5">
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-stone-500">
                <span>Completed vs total orders</span>
                <span>
                  {completedOrders}/{totalOrders || 0}
                </span>
              </div>
              <div className="h-3 rounded-full bg-white">
                <div
                  className="h-3 rounded-full bg-[linear-gradient(90deg,#24170e,#6a4a2c)]"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-stone-900">
                <UtensilsCrossed className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                  Branch catalog
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                  Menu and branch visibility
                </h2>
              </div>
            </div>

            <div className="rounded-[24px] border border-stone-200 bg-white/80 p-5">
              <p className="text-lg font-semibold text-stone-950">
                {currentBranch?.name ?? "Assigned branch"}
              </p>
              <p className="mt-1 text-sm text-stone-500">
                {currentBranch
                  ? `${currentBranch.city}, ${currentBranch.state}`
                  : "Branch scope is taken from your assignment"}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-stone-50 p-5">
                <div className="flex items-center gap-2 text-stone-500">
                  <PackageCheck className="size-4" />
                  <p className="text-xs uppercase tracking-[0.18em]">Available Items</p>
                </div>
                <p className="mt-4 text-3xl font-semibold text-stone-950">{availableItems}</p>
              </div>
              <div className="rounded-[24px] bg-stone-50 p-5">
                <div className="flex items-center gap-2 text-stone-500">
                  <PackageCheck className="size-4" />
                  <p className="text-xs uppercase tracking-[0.18em]">Paused Items</p>
                </div>
                <p className="mt-4 text-3xl font-semibold text-stone-950">{pausedItems}</p>
              </div>
              <div className="rounded-[24px] bg-stone-50 p-5">
                <div className="flex items-center gap-2 text-stone-500">
                  <UtensilsCrossed className="size-4" />
                  <p className="text-xs uppercase tracking-[0.18em]">Veg Items</p>
                </div>
                <p className="mt-4 text-3xl font-semibold text-stone-950">{vegItems}</p>
              </div>
              <div className="rounded-[24px] bg-stone-50 p-5">
                <div className="flex items-center gap-2 text-stone-500">
                  <UtensilsCrossed className="size-4" />
                  <p className="text-xs uppercase tracking-[0.18em]">Non-Veg Items</p>
                </div>
                <p className="mt-4 text-3xl font-semibold text-stone-950">{nonVegItems}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DashboardWidget
          label="Total Clients"
          value={String(clients.length)}
          hint="All franchise client accounts"
        />
        <DashboardWidget
          label="Active Clients"
          value={String(activeClients.length)}
          hint="Currently enabled accounts"
        />
        <DashboardWidget
          label="Inactive Clients"
          value={String(inactiveClients.length)}
          hint="Accounts marked inactive"
        />
        <DashboardWidget
          label="Managed Users"
          value={String(users.length - 1)}
          hint="Client admins and branch managers"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-stone-900">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                Client growth
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                Portfolio activity
              </h2>
            </div>
          </div>

          <div className="grid gap-4">
            {clientSummaries.map((client) => (
              <div
                key={client.id}
                className="rounded-[24px] border border-stone-200 bg-white/80 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-stone-950">
                      {client.name}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {client.company_name}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${client.is_active !== false ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                  >
                    {client.is_active !== false ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-stone-500">
                      <span>Branches</span>
                      <span>{client.branchCount}</span>
                    </div>
                    <div className="h-3 rounded-full bg-stone-100">
                      <div
                        className="h-3 rounded-full bg-[linear-gradient(90deg,#f6c354,#ea9254)]"
                        style={{
                          width: `${(client.branchCount / maxBranchCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-stone-500">
                      <span>Users</span>
                      <span>{client.userCount}</span>
                    </div>
                    <div className="h-3 rounded-full bg-stone-100">
                      <div
                        className="h-3 rounded-full bg-[linear-gradient(90deg,#24170e,#6a4a2c)]"
                        style={{
                          width: `${(client.userCount / maxUserCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-stone-900">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                Clients
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                Status and role distribution
              </h2>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[24px] bg-stone-50 p-5">
              <div className="flex items-center justify-between text-sm text-stone-600">
                <span>Active clients</span>
                <span>{activeClients.length}</span>
              </div>
              <div className="mt-3 h-3 rounded-full bg-white">
                <div
                  className="h-3 rounded-full bg-emerald-500"
                  style={{
                    width: `${clients.length ? (activeClients.length / clients.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-[24px] bg-stone-50 p-5">
              <div className="flex items-center justify-between text-sm text-stone-600">
                <span>Inactive clients</span>
                <span>{inactiveClients.length}</span>
              </div>
              <div className="mt-3 h-3 rounded-full bg-white">
                <div
                  className="h-3 rounded-full bg-rose-400"
                  style={{
                    width: `${clients.length ? (inactiveClients.length / clients.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-stone-50 p-5">
                <div className="flex items-center gap-2 text-stone-500">
                  <Users2 className="size-4" />
                  <p className="text-xs uppercase tracking-[0.18em]">
                    Client Admins
                  </p>
                </div>
                <p className="mt-4 text-3xl font-semibold text-stone-950">
                  {
                    users.filter((entry) => entry.role === "CLIENT_ADMIN")
                      .length
                  }
                </p>
              </div>
              <div className="rounded-[24px] bg-stone-50 p-5">
                <div className="flex items-center gap-2 text-stone-500">
                  <Users2 className="size-4" />
                  <p className="text-xs uppercase tracking-[0.18em]">
                    Branch Managers
                  </p>
                </div>
                <p className="mt-4 text-3xl font-semibold text-stone-950">
                  {
                    users.filter((entry) => entry.role === "BRANCH_MANAGER")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
              Client directory
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              All clients
            </h2>
          </div>
          <Button
            onClick={() => {
              setSelected(null);
              setForm(emptyForm);
              setModalOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            Add client
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-stone-50">
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-stone-500">
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Branches</th>
                <th className="px-6 py-4">Users</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedClients.map((client) => {
                const summary = clientSummaries.find(
                  (item) => item.id === client.id,
                );
                return (
                  <tr
                    key={client.id}
                    className="border-t border-stone-100 text-sm text-stone-700"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-stone-950">
                        {client.name}
                      </div>
                      <div className="mt-1 text-xs text-stone-500">
                        {client.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">{client.company_name}</td>
                    <td className="px-6 py-4">{summary?.branchCount ?? 0}</td>
                    <td className="px-6 py-4">{summary?.userCount ?? 0}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${client.is_active !== false ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                      >
                        {client.is_active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/clients/${client.id}`}>
                          <Button variant="secondary">
                            <Eye className="mr-2 size-4" />
                            View client
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSelected(client);
                            setForm({
                              name: client.name,
                              company_name: client.company_name,
                              email: client.email,
                              phone: client.phone,
                              slug: client.slug,
                              domain: client.domain,
                            });
                            setModalOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(client.id)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!pagedClients.length ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-stone-500"
                  >
                    No clients available.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-stone-200 px-6 py-4 text-sm text-stone-500">
          <span>
            Showing {(safePage - 1) * PAGE_SIZE + 1}-
            {Math.min(safePage * PAGE_SIZE, clients.length)} of {clients.length}{" "}
            clients
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              disabled={safePage === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <span className="inline-flex items-center rounded-full bg-stone-100 px-4 py-2 text-stone-700">
              Page {safePage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              disabled={safePage === totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title={selected ? "Edit client" : "Add client"}
        description="Fill the required details and submit to save client changes."
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
          setForm(emptyForm);
        }}
      >
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate(form);
          }}
        >
          {[
            ["name", "Client name"],
            ["company_name", "Company name"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["slug", "Slug"],
            ["domain", "Domain"],
          ].map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`dashboard-client-${key}`}>{label}</Label>
              <Input
                id={`dashboard-client-${key}`}
                type={key === "email" ? "email" : "text"}
                value={form[key as keyof ClientPayload]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
                required
              />
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save client"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
