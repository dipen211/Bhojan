"use client";

import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Error from "@/components/ui/error";
import { Label, Select } from "@/components/ui/field";
import Loading from "@/components/ui/loading";
import { useSession } from "@/hooks/use-session";
import { ORDER_STATUSES } from "@/lib/constants";
import { getBranches } from "@/services/branch-service";
import { getOrder, getOrders, updateOrderStatus } from "@/services/order-service";
import type { Order } from "@/types/order";
import { filterBySessionScope, formatCurrency, getEffectiveRole, getStatusTone, hasRoleAccess } from "@/utils";

export default function DashboardOrdersPage() {
  const queryClient = useQueryClient();
  const { hydrated, rolePreview, user } = useSession();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("PENDING");
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const ordersQuery = useQuery({ queryKey: ["orders"], queryFn: getOrders });
  const branchesQuery = useQuery({ queryKey: ["branches"], queryFn: getBranches });
  const detailsQuery = useQuery({
    queryKey: ["orders", selectedOrder?.id],
    queryFn: () => getOrder(selectedOrder!.id),
    enabled: Boolean(selectedOrder?.id),
  });

  const effectiveRole = getEffectiveRole(user?.role, rolePreview);
  const visibleOrders = useMemo(
    () => filterBySessionScope(ordersQuery.data ?? [], user, effectiveRole),
    [effectiveRole, ordersQuery.data, user],
  );

  const statusMutation = useMutation({
    mutationFn: ({ orderId, value }: { orderId: number; value: string }) =>
      updateOrderStatus(orderId, { status: value }),
    onSuccess: () => {
      toast.success("Order status updated");
      setStatusModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      if (selectedOrder?.id) {
        void queryClient.invalidateQueries({ queryKey: ["orders", selectedOrder.id] });
      }
    },
    onError: () => toast.error("Order update failed"),
  });

  if (!hydrated || ordersQuery.isLoading || branchesQuery.isLoading) {
    return <Loading />;
  }

  if (ordersQuery.isError || branchesQuery.isError) {
    return <Error message="Orders could not be loaded." />;
  }

  if (!hasRoleAccess(effectiveRole, ["CLIENT_ADMIN", "BRANCH_MANAGER"])) {
    return <Error message="Orders are available only to client admin and branch manager roles." />;
  }

  const branches = branchesQuery.data ?? [];

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="border-b border-stone-200 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Orders</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-950">Order table</h2>
          <p className="mt-2 text-sm text-stone-500">
            {effectiveRole === "CLIENT_ADMIN"
              ? "Client admins can view all orders in their client scope."
              : "Branch managers can view orders and update status for their assigned branch."}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-stone-50">
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-stone-500">
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order) => {
                const branch = branches.find((entry) => entry.id === order.branch_id);

                return (
                  <tr key={order.id} className="border-t border-stone-100 text-sm text-stone-700">
                    <td className="px-6 py-4 font-semibold text-stone-950">#{order.id}</td>
                    <td className="px-6 py-4">{branch?.name ?? "-"}</td>
                    <td className="px-6 py-4">
                      <div>{order.customer_name}</div>
                      <div className="mt-1 text-xs text-stone-500">{order.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4">{formatCurrency(order.total_amount)}</td>
                    <td className="px-6 py-4">{order.payment_status}</td>
                    <td className="px-6 py-4">
                      <Badge tone={getStatusTone(order.status)}>{order.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSelectedOrder(order);
                            setStatus(order.status);
                          }}
                        >
                          <Eye className="mr-2 size-4" />
                          View
                        </Button>
                        {effectiveRole === "BRANCH_MANAGER" ? (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setSelectedOrder(order);
                              setStatus(order.status);
                              setStatusModalOpen(true);
                            }}
                          >
                            <RefreshCcw className="mr-2 size-4" />
                            Update status
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!visibleOrders.length ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-stone-500">
                    No orders found in your current scope.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Order details</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-950">
            {selectedOrder ? `Order #${selectedOrder.id}` : "Select an order"}
          </h2>
        </div>

        {selectedOrder ? (
          <>
            {detailsQuery.isLoading ? <Loading /> : null}
            {detailsQuery.data ? (
              <div className="space-y-5">
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="rounded-[20px] bg-stone-50 p-4 text-sm text-stone-600">
                    Customer: {detailsQuery.data.customer_name}
                  </div>
                  <div className="rounded-[20px] bg-stone-50 p-4 text-sm text-stone-600">
                    Phone: {detailsQuery.data.customer_phone}
                  </div>
                  <div className="rounded-[20px] bg-stone-50 p-4 text-sm text-stone-600">
                    Payment: {detailsQuery.data.payment_status}
                  </div>
                  <div className="rounded-[20px] bg-stone-50 p-4 text-sm text-stone-600">
                    Total: {formatCurrency(detailsQuery.data.total_amount)}
                  </div>
                </div>

                <div className="overflow-hidden rounded-[24px] border border-stone-200">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-stone-50">
                      <tr className="text-left text-xs uppercase tracking-[0.18em] text-stone-500">
                        <th className="px-5 py-4">Item</th>
                        <th className="px-5 py-4">Qty</th>
                        <th className="px-5 py-4">Price</th>
                        <th className="px-5 py-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detailsQuery.data.items ?? []).map((item) => (
                        <tr key={`${item.menu_item_id}-${item.id}`} className="border-t border-stone-100 text-sm text-stone-700">
                          <td className="px-5 py-4">{item.name}</td>
                          <td className="px-5 py-4">{item.quantity}</td>
                          <td className="px-5 py-4">{formatCurrency(item.price)}</td>
                          <td className="px-5 py-4">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-stone-500">Choose an order from the table to inspect full details.</p>
        )}
      </Card>

      {statusModalOpen && selectedOrder ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/35 px-4">
          <div className="w-full max-w-md rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_30px_90px_rgba(24,16,10,0.24)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Update order status</p>
                <h3 className="mt-2 text-2xl font-semibold text-stone-950">Order #{selectedOrder.id}</h3>
              </div>
              <Button variant="ghost" onClick={() => setStatusModalOpen(false)}>
                Close
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order-status-modal">Status</Label>
                <Select id="order-status-modal" value={status} onChange={(event) => setStatus(event.target.value)}>
                  {ORDER_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setStatusModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate({ orderId: selectedOrder.id, value: status })}
                >
                  {statusMutation.isPending ? "Saving..." : "Save status"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
