"use client";

import { useDeferredValue, useEffect, useEffectEvent, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";

import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Error from "@/components/ui/error";
import { Input, Label, Select } from "@/components/ui/field";
import Loading from "@/components/ui/loading";
import { PAYMENT_STATUSES } from "@/lib/constants";
import { getBranches } from "@/services/branch-service";
import { getCategories } from "@/services/category-service";
import { getClients } from "@/services/client-service";
import { getBranchMenuItems } from "@/services/menu-item-service";
import { createOrder, getOrder, updateOrderStatus } from "@/services/order-service";
import type { MenuItem } from "@/types/menu-item";
import type { Order } from "@/types/order";
import { formatCurrency, websocketRoot } from "@/utils";
import { connectWebsocket } from "@/websocket/socket";

export default function BranchTenantPage({
  params,
}: {
  params: { tenant: string; branch: string };
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [orderForm, setOrderForm] = useState({
    customer_name: "",
    customer_phone: "",
    payment_status: PAYMENT_STATUSES[0],
  });
  const [latestOrderId, setLatestOrderId] = useState<number | null>(null);
  const [events, setEvents] = useState<string[]>([]);

  const branchesQuery = useQuery({ queryKey: ["branches"], queryFn: getBranches });
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  const branch = useMemo(
    () => (branchesQuery.data ?? []).find((item) => item.slug === params.branch),
    [branchesQuery.data, params.branch],
  );
  const client = useMemo(
    () => (clientsQuery.data ?? []).find((item) => item.slug === params.tenant) ?? null,
    [clientsQuery.data, params.tenant],
  );

  const menuItemsQuery = useQuery({
    queryKey: ["branch-menu-items", branch?.id],
    queryFn: () => getBranchMenuItems(branch!.id),
    enabled: Boolean(branch?.id),
  });

  const latestOrderQuery = useQuery({
    queryKey: ["storefront-order", latestOrderId],
    queryFn: () => getOrder(latestOrderId!),
    enabled: Boolean(latestOrderId),
    refetchInterval: latestOrderId ? 5000 : false,
  });

  const onSocketMessage = useEffectEvent((event: MessageEvent<string>) => {
    const payload = JSON.parse(event.data) as { event: string; data: Order };
    setEvents((current) => [
      `${payload.event}: Order #${payload.data.id} is ${payload.data.status}`,
      ...current,
    ].slice(0, 6));
    if (latestOrderId === payload.data.id) {
      void queryClient.invalidateQueries({ queryKey: ["storefront-order", latestOrderId] });
    }
  });

  useEffect(() => {
    if (!branch?.id) {
      return;
    }

    const socket = connectWebsocket(`${websocketRoot()}/ws/orders/${branch.id}`);
    socket.addEventListener("message", onSocketMessage);

    return () => {
      socket.removeEventListener("message", onSocketMessage);
      socket.close();
    };
  }, [branch?.id]);

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      toast.success(`Order #${order.id} placed`);
      setLatestOrderId(order.id);
      setCart({});
      setOrderForm({
        customer_name: "",
        customer_phone: "",
        payment_status: PAYMENT_STATUSES[0],
      });
      void queryClient.invalidateQueries({ queryKey: ["branch-menu-items", branch?.id] });
    },
    onError: () => toast.error("Could not place order"),
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: number) => updateOrderStatus(orderId, { status: "CANCELLED" }),
    onSuccess: () => {
      toast.success("Order cancelled");
      if (latestOrderId) {
        void queryClient.invalidateQueries({ queryKey: ["storefront-order", latestOrderId] });
      }
    },
    onError: () => toast.error("This order can no longer be cancelled"),
  });

  if (branchesQuery.isLoading || clientsQuery.isLoading || categoriesQuery.isLoading) {
    return <Loading />;
  }

  if (
    branchesQuery.isError ||
    clientsQuery.isError ||
    categoriesQuery.isError ||
    menuItemsQuery.isError
  ) {
    return <Error message="Storefront data could not be loaded." />;
  }

  if (!branch || !client || client.id !== branch.tenant_id) {
    return (
      <Error message="That storefront route does not match an available tenant and branch in the current API data." />
    );
  }

  const categories = (categoriesQuery.data ?? []).filter((item) => item.branch_id === branch.id);
  const menuItems = (menuItemsQuery.data ?? []).filter((item) =>
    item.name.toLowerCase().includes(deferredSearch.toLowerCase()),
  );
  const cartItems = (menuItemsQuery.data ?? []).filter((item) => cart[item.id]);
  const total = cartItems.reduce((sum, item) => sum + item.price * cart[item.id], 0);

  function updateCart(item: MenuItem, delta: number) {
    setCart((current) => {
      const next = (current[item.id] ?? 0) + delta;
      if (next <= 0) {
        const rest = { ...current };
        delete rest[item.id];
        return rest;
      }
      return { ...current, [item.id]: next };
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(246,195,84,0.3),transparent_24%),linear-gradient(180deg,#fffaf3_0%,#f4ecdf_100%)] px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="overflow-hidden bg-[linear-gradient(130deg,#ffffff_0%,#ffe8bd_52%,#f7d38b_100%)]">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <Badge>Customer</Badge>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-500">{client.name}</p>
                <h1 className="mt-3 font-[var(--font-heading)] text-5xl font-semibold text-stone-950">
                  {branch.name}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
                  Browse categories, build a cart, place an order, and watch live status updates powered by the order
                  API and websocket feed.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-stone-600">
                <span>{branch.address}</span>
                <span>{branch.opening_time} - {branch.closing_time}</span>
                <span>{branch.phone}</span>
              </div>
            </div>

            <Card className="border-none bg-white/70 p-5">
              <div className="flex items-center gap-2 text-stone-900">
                <Sparkles className="size-4 text-[var(--accent-strong)]" />
                <span className="text-sm font-semibold">Live activity</span>
              </div>
              <div className="mt-4 space-y-3">
                {events.length ? (
                  events.map((entry) => (
                    <div key={entry} className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
                      {entry}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-stone-500">
                    No events yet. Place an order or update kitchen status to see them here.
                  </p>
                )}
              </div>
            </Card>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <Card className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Menu search</p>
                  <h2 className="mt-2 text-2xl font-semibold text-stone-950">Order from the branch catalog</h2>
                </div>
                <Input
                  className="max-w-sm"
                  placeholder="Search cold coffee, snacks, breakfast..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </Card>

            {categories.map((category) => (
              <div key={category.id} className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Section {category.sort_order}</p>
                  <h3 className="text-2xl font-semibold text-stone-950">{category.name}</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {menuItems
                    .filter((item) => item.category_id === category.id)
                    .map((item) => (
                      <Card key={item.id} className="space-y-5">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="text-xl font-semibold text-stone-950">{item.name}</h4>
                            <Badge tone={item.is_available ? "success" : "warning"}>
                              {item.is_available ? "Available" : "Paused"}
                            </Badge>
                          </div>
                          <p className="text-sm leading-6 text-stone-500">{item.description}</p>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-2xl font-semibold text-stone-950">{formatCurrency(item.price)}</p>
                            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                              {item.is_veg ? "Veg" : "Non veg"} | {item.preparation_time} mins
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" onClick={() => updateCart(item, -1)}>
                              -
                            </Button>
                            <span className="min-w-8 text-center text-sm font-semibold text-stone-700">
                              {cart[item.id] ?? 0}
                            </span>
                            <Button disabled={!item.is_available} onClick={() => updateCart(item, 1)}>
                              +
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <Card className="space-y-5">
              <div className="flex items-center gap-3">
                <ShoppingBag className="size-5 text-stone-700" />
                <div>
                  <h2 className="text-2xl font-semibold text-stone-950">Your cart</h2>
                  <p className="text-sm text-stone-500">{cartItems.length} items selected</p>
                </div>
              </div>

              <div className="space-y-3">
                {cartItems.length ? (
                  cartItems.map((item) => (
                    <div key={item.id} className="rounded-[24px] bg-stone-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-stone-950">{item.name}</h3>
                          <p className="text-sm text-stone-500">
                            {cart[item.id]} x {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="font-semibold text-stone-900">
                          {formatCurrency(item.price * cart[item.id])}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-stone-500">Add a few dishes to start an order.</p>
                )}
              </div>

              <div className="rounded-[24px] bg-[var(--accent-soft)] p-4 text-sm font-semibold text-stone-900">
                Total: {formatCurrency(total)}
              </div>

              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!cartItems.length) {
                    toast.error("Add at least one menu item");
                    return;
                  }

                  createOrderMutation.mutate({
                    tenant_id: branch.tenant_id,
                    branch_id: branch.id,
                    customer_name: orderForm.customer_name,
                    customer_phone: orderForm.customer_phone,
                    total_amount: total,
                    payment_status: orderForm.payment_status,
                    items: cartItems.map((item) => ({
                      menu_item_id: item.id,
                      name: item.name,
                      quantity: cart[item.id],
                      price: item.price,
                    })),
                  });
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="customer-name">Name</Label>
                  <Input
                    id="customer-name"
                    value={orderForm.customer_name}
                    onChange={(event) =>
                      setOrderForm((current) => ({ ...current, customer_name: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-phone">Phone</Label>
                  <Input
                    id="customer-phone"
                    value={orderForm.customer_phone}
                    onChange={(event) =>
                      setOrderForm((current) => ({ ...current, customer_phone: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-status">Payment</Label>
                  <Select
                    id="payment-status"
                    value={orderForm.payment_status}
                    onChange={(event) =>
                      setOrderForm((current) => ({ ...current, payment_status: event.target.value }))
                    }
                  >
                    {PAYMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button className="w-full" disabled={createOrderMutation.isPending}>
                  {createOrderMutation.isPending ? "Placing order..." : "Place order"}
                </Button>
              </form>
            </Card>

            <Card className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Latest order</p>
                  <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                    {latestOrderQuery.data ? `Order #${latestOrderQuery.data.id}` : "No order placed yet"}
                  </h2>
                </div>
                <ArrowRight className="size-5 text-stone-400" />
              </div>
              {latestOrderQuery.data ? (
                <>
                  <Badge tone={latestOrderQuery.data.status === "DELIVERED" ? "success" : "default"}>
                    {latestOrderQuery.data.status}
                  </Badge>
                  <p className="text-sm text-stone-500">
                    Payment: {latestOrderQuery.data.payment_status} | Total:{" "}
                    {formatCurrency(latestOrderQuery.data.total_amount)}
                  </p>
                  {latestOrderQuery.data.status === "PENDING" ? (
                    <Button
                      variant="danger"
                      disabled={cancelOrderMutation.isPending}
                      onClick={() => cancelOrderMutation.mutate(latestOrderQuery.data.id)}
                    >
                      {cancelOrderMutation.isPending ? "Cancelling..." : "Cancel before acceptance"}
                    </Button>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-stone-500">
                  Once you place an order, live status updates will appear here.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
