"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";

import Button from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { formatRole, getEffectiveRole, getInitials } from "@/utils";

export default function Header() {
  const pathname = usePathname();
  const { hydrated, rolePreview, token, user, logout } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handlePointerDown);
    }

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [menuOpen]);

  if (!hydrated) {
    return null;
  }

  const effectiveRole = getEffectiveRole(user?.role, rolePreview);
  const pageMeta: Record<string, { title: string; description: string }> = {
    "/dashboard": {
      title: effectiveRole === "SUPER_ADMIN" ? "Bhojan" : "Operations Overview",
      description:
        effectiveRole === "SUPER_ADMIN"
          ? "Multi-Client Management"
          : "Manage branches, teams, and daily operations from one centralized dashboard.",
    },
    "/dashboard/clients": {
      title: "Clients",
      description: "Manage white-label clients, domains, and account ownership.",
    },
    "/dashboard/branches": {
      title: "Branches",
      description: "Review branch locations, operating details, and assigned managers.",
    },
    "/dashboard/users": {
      title: "Users",
      description: "Manage operator accounts within your allowed scope.",
    },
    "/dashboard/categories": {
      title: "Categories",
      description: "Organize branch menus with clean category structure.",
    },
    "/dashboard/menus": {
      title: "Menu",
      description: "Control menu listings and branch-level menu availability.",
    },
    "/dashboard/menu-items": {
      title: "Menu Items",
      description: "Maintain item details, pricing, and branch catalog visibility.",
    },
    "/dashboard/orders": {
      title: "Orders",
      description: "Track order activity and review status within your access scope.",
    },
    "/dashboard/kitchen": {
      title: "Kitchen",
      description: "Follow live preparation flow and branch kitchen activity.",
    },
    "/dashboard/settings": {
      title: "Settings",
      description: "Update your profile details and account preferences.",
    },
  };
  const currentPage = pageMeta[pathname] ?? {
    title: "Dashboard",
    description: "Manage the current workspace with role-based visibility.",
  };

  return (
    <header className="relative z-40 flex flex-col gap-5 rounded-[30px] border border-white/60 bg-white/75 px-6 py-5 shadow-[0_20px_60px_rgba(42,26,12,0.08)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-stone-950">{currentPage.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">{currentPage.description}</p>
      </div>

      <div className="flex justify-end">
        {token && user ? (
          <div className="relative z-[80]" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="flex cursor-pointer items-center gap-3 rounded-[24px] border border-stone-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-stone-300"
            >
              <div className="flex size-11 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-stone-900">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-950">{user.name}</p>
                <p className="truncate text-xs uppercase tracking-[0.2em] text-stone-500">{user.email}</p>
              </div>
              <ChevronDown className={`size-4 text-stone-500 transition ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 z-[90] mt-3 w-72 rounded-[28px] border border-stone-200 bg-white p-3 shadow-[0_24px_70px_rgba(24,16,10,0.16)]">
                <div className="rounded-[22px] bg-stone-50 p-4">
                  <p className="text-sm font-semibold text-stone-950">{user.name}</p>
                  <p className="mt-1 text-sm text-stone-500">{formatRole(effectiveRole)}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-stone-500">
                    Tenant {user.tenant_id ?? "Global"} | Branch {user.branch_id ?? "All"}
                  </p>
                </div>

                <div className="mt-3 grid gap-2">
                  <Link href="/dashboard/settings" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full justify-start" variant="ghost">
                      <Settings className="mr-2 size-4" />
                      Profile settings
                    </Button>
                  </Link>
                  <Link href="/dashboard/settings" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full justify-start" variant="ghost">
                      <UserRound className="mr-2 size-4" />
                      Update password
                    </Button>
                  </Link>
                  <Button
                    className="w-full justify-start"
                    variant="secondary"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut className="mr-2 size-4" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
