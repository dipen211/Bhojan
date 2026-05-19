"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { useRouter } from "next/navigation";

import Loading from "@/components/ui/loading";
import { useSession } from "@/hooks/use-session";
import { getEffectiveRole } from "@/utils";
import Header from "./header";
import Sidebar from "./sidebar";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const router = useRouter();
  const { hydrated, token, rolePreview, user } = useSession();

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/auth/login");
    }
  }, [hydrated, router, token]);

  if (!hydrated || !token) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(248,201,90,0.25),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(234,144,84,0.18),transparent_24%),linear-gradient(180deg,#fffaf3_0%,#f6efe4_100%)]">
        <div className="flex min-h-screen items-center justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  const effectiveRole = getEffectiveRole(user?.role, rolePreview);
  const hideSidebar = effectiveRole === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(248,201,90,0.25),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(234,144,84,0.18),transparent_24%),linear-gradient(180deg,#fffaf3_0%,#f6efe4_100%)]">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
        {!hideSidebar ? <Sidebar /> : null}
        <main className="flex-1 py-2">
          <div className="space-y-6">
            <Header />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
