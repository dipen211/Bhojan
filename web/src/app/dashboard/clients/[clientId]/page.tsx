"use client";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  MapPinned,
  Phone,
  Users2,
} from "lucide-react";

import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Error from "@/components/ui/error";
import Loading from "@/components/ui/loading";
import { useSession } from "@/hooks/use-session";
import { getBranches } from "@/services/branch-service";
import { getClient } from "@/services/client-service";
import { getUsers } from "@/services/user-service";
import { getEffectiveRole } from "@/utils";
import { use } from "react";

export default function ClientDetailsPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { hydrated, rolePreview, user } = useSession();
  const { clientId } = use(params);

  const id = Number(clientId);
  const effectiveRole = getEffectiveRole(user?.role, rolePreview);

  const clientQuery = useQuery({
    queryKey: ["client", id],
    queryFn: () => getClient(id),
    enabled: hydrated && Number.isFinite(id),
  });
  const branchesQuery = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
    enabled: hydrated,
  });
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
    enabled: hydrated,
  });

  if (
    !hydrated ||
    clientQuery.isLoading ||
    branchesQuery.isLoading ||
    usersQuery.isLoading
  ) {
    return <Loading />;
  }

  if (clientQuery.isError || branchesQuery.isError || usersQuery.isError) {
    return <Error message="Client details could not be loaded." />;
  }

  if (effectiveRole !== "SUPER_ADMIN") {
    return (
      <Error message="Client details are available only to super admin." />
    );
  }

  const client = clientQuery.data;
  const branches = (branchesQuery.data ?? []).filter(
    (branch) => branch.tenant_id === client?.id,
  );
  const users = (usersQuery.data ?? []).filter(
    (entry) => entry.tenant_id === client?.id,
  );
  const clientAdmins = users.filter((entry) => entry.role === "CLIENT_ADMIN");
  const branchManagers = users.filter(
    (entry) => entry.role === "BRANCH_MANAGER",
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 size-4" />
              Back to home
            </Button>
          </Link>
          <h1 className="mt-4 text-4xl font-semibold text-stone-950">
            {client?.name}
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Franchise client overview with business details, branches, and
            assigned users.
          </p>
        </div>
        <div
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${client?.is_active !== false ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
        >
          {client?.is_active !== false ? "Active client" : "Inactive client"}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Card className="overflow-hidden bg-[linear-gradient(140deg,#ffffff_0%,#fff1d4_55%,#f8dca8_100%)]">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-[24px] bg-white/75 p-5">
              <div className="flex items-center gap-2 text-stone-500">
                <Building2 className="size-4" />
                <p className="text-xs uppercase tracking-[0.18em]">Company</p>
              </div>
              <p className="mt-4 text-xl font-semibold text-stone-950">
                {client?.company_name}
              </p>
            </div>
            <div className="rounded-[24px] bg-white/75 p-5">
              <div className="flex items-center gap-2 text-stone-500">
                <Globe className="size-4" />
                <p className="text-xs uppercase tracking-[0.18em]">Domain</p>
              </div>
              <p className="mt-4 text-xl font-semibold text-stone-950">
                {client?.domain}
              </p>
              <p className="mt-1 text-sm text-stone-500">{client?.slug}</p>
            </div>
            <div className="rounded-[24px] bg-white/75 p-5">
              <div className="flex items-center gap-2 text-stone-500">
                <Mail className="size-4" />
                <p className="text-xs uppercase tracking-[0.18em]">Email</p>
              </div>
              <p className="mt-4 text-lg font-semibold text-stone-950">
                {client?.email}
              </p>
            </div>
            <div className="rounded-[24px] bg-white/75 p-5">
              <div className="flex items-center gap-2 text-stone-500">
                <Phone className="size-4" />
                <p className="text-xs uppercase tracking-[0.18em]">Phone</p>
              </div>
              <p className="mt-4 text-lg font-semibold text-stone-950">
                {client?.phone}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <Card className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
              Branches
            </p>
            <p className="text-3xl font-semibold text-stone-950">
              {branches.length}
            </p>
            <p className="text-sm text-stone-500">
              Locations attached to this client
            </p>
          </Card>
          <Card className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
              Client Admins
            </p>
            <p className="text-3xl font-semibold text-stone-950">
              {clientAdmins.length}
            </p>
            <p className="text-sm text-stone-500">
              Tenant-level operator accounts
            </p>
          </Card>
          <Card className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
              Branch Managers
            </p>
            <p className="text-3xl font-semibold text-stone-950">
              {branchManagers.length}
            </p>
            <p className="text-sm text-stone-500">
              Branch-scoped operator accounts
            </p>
          </Card>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-stone-200 px-6 py-5">
            <div className="flex items-center gap-2 text-stone-500">
              <MapPinned className="size-4" />
              <p className="text-xs uppercase tracking-[0.18em]">Branches</p>
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              Branch list
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Read-only branch visibility for super admin on this client.
            </p>
          </div>

          <div className="grid gap-4 p-6">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="rounded-[24px] border border-stone-200 bg-stone-50/70 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-stone-950">
                      {branch.name}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {branch.address}
                    </p>
                  </div>
                  <div className="text-sm text-stone-500">
                    {branch.city}, {branch.state}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm text-stone-600">
                  <div>Manager: {branch.manager_name}</div>
                  <div>Phone: {branch.phone}</div>
                  <div>
                    Hours: {branch.opening_time} - {branch.closing_time}
                  </div>
                </div>
              </div>
            ))}
            {!branches.length ? (
              <p className="text-sm text-stone-500">
                No branches found for this client.
              </p>
            ) : null}
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-stone-200 px-6 py-5">
            <div className="flex items-center gap-2 text-stone-500">
              <Users2 className="size-4" />
              <p className="text-xs uppercase tracking-[0.18em]">Users</p>
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              User list
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Super admin can review all assigned users here without branch or
              user CRUD.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-stone-50">
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-stone-500">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Branch</th>
                </tr>
              </thead>
              <tbody>
                {users.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-t border-stone-100 text-sm text-stone-700"
                  >
                    <td className="px-6 py-4 font-semibold text-stone-950">
                      {entry.name}
                    </td>
                    <td className="px-6 py-4">{entry.email}</td>
                    <td className="px-6 py-4">
                      {entry.role.replaceAll("_", " ")}
                    </td>
                    <td className="px-6 py-4">
                      {branches.find((branch) => branch.id === entry.branch_id)
                        ?.name ?? "-"}
                    </td>
                  </tr>
                ))}
                {!users.length ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-sm text-stone-500"
                    >
                      No users found for this client.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
