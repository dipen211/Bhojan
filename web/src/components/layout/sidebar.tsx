"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  LayoutDashboard,
  MapPinned,
  NotebookTabs,
  ShoppingBag,
  Soup,
  Users2,
} from "lucide-react";

import { DASHBOARD_LINKS } from "@/lib/constants";
import { useSession } from "@/hooks/use-session";
import { getClients } from "@/services/client-service";
import { classNames, getEffectiveRole } from "@/utils";

const icons: Record<string, typeof LayoutDashboard> = {
  Overview: LayoutDashboard,
  Clients: Users2,
  Branches: MapPinned,
  Users: Users2,
  Categories: NotebookTabs,
  Menu: Soup,
  Orders: ShoppingBag,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { hydrated, rolePreview, user } = useSession();
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: getClients, enabled: hydrated });

  if (!hydrated) {
    return null;
  }

  const effectiveRole = getEffectiveRole(user?.role, rolePreview);
  const links = DASHBOARD_LINKS.filter((item) => item.roles.includes(effectiveRole));
  const clientName =
    effectiveRole === "SUPER_ADMIN"
      ? "Bhojan"
      : clientsQuery.data?.find((client) => client.id === user?.tenant_id)?.name ?? "Client Workspace";

  return (
    <aside className="sticky top-0 flex h-screen w-full max-w-[300px] flex-col justify-between rounded-r-[36px] border-r border-white/60 bg-[linear-gradient(180deg,rgba(36,27,18,0.98),rgba(66,45,27,0.92))] px-6 py-8 text-white shadow-[0_0_80px_rgba(24,15,10,0.22)]">
      <div>
        <div className="mb-10 flex items-center gap-3">
          <div className="rounded-2xl bg-[var(--accent)] p-3 text-stone-950">
            <Building2 className="size-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-300">Restaurant OS</p>
            <h2 className="text-2xl font-semibold">{clientName}</h2>
          </div>
        </div>

        <nav className="space-y-2">
          {links.map((item) => {
            const Icon = icons[item.label];
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={classNames(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active
                    ? "bg-white !text-[#422d1beb] shadow-[0_14px_24px_rgba(255,255,255,0.18)]"
                    : "text-stone-300 hover:bg-white/8 hover:text-white",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
