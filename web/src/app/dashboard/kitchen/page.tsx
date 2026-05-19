"use client";

import { useEffect, useEffectEvent, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { getBranchOrders, updateOrderStatus } from "@/services/order-service";
import type { Order } from "@/types/order";
import { filterBySessionScope, getEffectiveRole, getStatusTone, hasRoleAccess, websocketRoot } from "@/utils";
import { connectWebsocket } from "@/websocket/socket";

export default function DashboardKitchenPage() {
  const queryClient = useQueryClient();
  const { hydrated, rolePreview, user } = useSession();
  const branchesQuery = useQuery({ queryKey: ["branches"], queryFn: getBranches });
  const effectiveRole = getEffectiveRole(user?.role, rolePreview);
  const [branchId, setBranchId] = useState<number>(user?.branch_id ?? 1);
  const [feed, setFeed] = useState<Array<{ event: string; data: Order }>>([]);

  const ordersQuery = useQuery({
    queryKey: ["branch-orders", branchId],
    queryFn: () => getBranchOrders(branchId),
    enabled: Boolean(branchId),
  });

  const onSocketMessage = useEffectEvent((event: MessageEvent<string>) => {
    const payload = JSON.parse(event.data) as { event: string; data: Order };
    setFeed((current) => [payload, ...current].slice(0, 8));
    void queryClient.invalidateQueries({ queryKey: ["branch-orders", branchId] });
  });

  useEffect(() => {
    if (!branchId) {
      return;
    }

    const socket = connectWebsocket(`${websocketRoot()}/ws/orders/${branchId}`);
    socket.addEventListener("message", onSocketMessage);

    return () => {
      socket.removeEventListener("message", onSocketMessage);
      socket.close();
    };
  }, [branchId]);

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      updateOrderStatus(orderId, { status }),
    onSuccess: () => {
      toast.success("Kitchen status updated");
      void queryClient.invalidateQueries({ queryKey: ["branch-orders", branchId] });
    },
    onError: () => toast.error("Kitchen update failed"),
  });

  if (!hydrated || branchesQuery.isLoading) {
    return <Loading />;
  }

  if (branchesQuery.isError || ordersQuery.isError) {
    return <Error message="Kitchen board could not be loaded." />;
  }

  if (!hasRoleAccess(effectiveRole, ["BRANCH_MANAGER"])) {
    return <Error message="Kitchen access is reserved for branch managers." />;
  }

  const branches = filterBySessionScope(branchesQuery.data ?? [], user, effectiveRole);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <Card className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Kitchen live board</p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-950">Real-time branch prep workflow</h1>
          </div>
          <div className="max-w-sm space-y-2">
            <Label htmlFor="kitchen-branch">Branch feed</Label>
            <Select
              id="kitchen-branch"
              value={String(branchId)}
              onChange={(event) => setBranchId(Number(event.target.value))}
              disabled={effectiveRole === "BRANCH_MANAGER"}
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        {ordersQuery.isLoading ? <Loading /> : null}

        <div className="grid gap-4">
          {(ordersQuery.data ?? []).map((order) => (
            <Card key={order.id} className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-stone-950">Order #{order.id}</h2>
                  <p className="text-sm text-stone-500">{order.customer_name}</p>
                </div>
                <Badge tone={getStatusTone(order.status)}>{order.status}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {ORDER_STATUSES.filter((status) => status !== "CANCELLED").map((status) => (
                  <Button
                    key={status}
                    variant={order.status === status ? "secondary" : "ghost"}
                    onClick={() => statusMutation.mutate({ orderId: order.id, status })}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Websocket activity</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-950">Branch event stream</h2>
        </div>

        <div className="space-y-3">
          {feed.length ? (
            feed.map((entry, index) => (
              <div
                key={`${entry.event}-${entry.data.id}-${index}`}
                className="rounded-[24px] bg-stone-50 p-4 text-sm text-stone-600"
              >
                <div className="font-semibold text-stone-900">{entry.event}</div>
                <div className="mt-1">Order #{entry.data.id} | {entry.data.customer_name} | {entry.data.status}</div>
              </div>
            ))
          ) : (
            <p className="text-sm text-stone-500">
              Waiting for websocket events. Create or update an order to see live kitchen feed activity.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
