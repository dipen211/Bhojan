"use client";

import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Error from "@/components/ui/error";
import { Input, Label } from "@/components/ui/field";
import Loading from "@/components/ui/loading";
import { useSession } from "@/hooks/use-session";
import { updateUser } from "@/services/user-service";
import type { UserUpdatePayload } from "@/types/user";
import { formatRole } from "@/utils";

export default function DashboardSettingsPage() {
  const { hydrated, token, user, setSession } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: UserUpdatePayload) => updateUser(user!.id, payload),
    onSuccess: (updatedUser) => {
      if (token) {
        setSession(token, updatedUser);
      }
      setPassword("");
      toast.success("Profile updated");
    },
    onError: () => toast.error("Profile update failed"),
  });

  if (!hydrated) {
    return <Loading />;
  }

  if (!user || !token) {
    return <Error message="You need to be signed in to update profile settings." />;
  }

  const resolvedName = name || user.name;
  const resolvedEmail = email || user.email;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Profile overview</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">{user.name}</h1>
          <p className="mt-2 text-sm text-stone-500">Your dashboard access and branch scope are shown here.</p>
        </div>

        <div className="grid gap-3">
          <div className="rounded-[24px] bg-stone-50 p-4 text-sm text-stone-600">Role: {formatRole(user.role)}</div>
          <div className="rounded-[24px] bg-stone-50 p-4 text-sm text-stone-600">
            Tenant: {user.tenant_id ?? "Global"}
          </div>
          <div className="rounded-[24px] bg-stone-50 p-4 text-sm text-stone-600">
            Branch: {user.branch_id ?? "All in scope"}
          </div>
        </div>
      </Card>

      <Card className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Profile settings</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-950">Update account details</h2>
        </div>

        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();

            mutation.mutate({
              name: resolvedName,
              email: resolvedEmail,
              password: password || undefined,
              role: user.role,
              tenant_id: user.tenant_id,
              branch_id: user.branch_id,
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="settings-name">Name</Label>
            <Input id="settings-name" value={resolvedName} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-email">Email</Label>
            <Input id="settings-email" type="email" value={resolvedEmail} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-password">New password</Label>
            <Input
              id="settings-password"
              type="password"
              value={password}
              placeholder="Leave blank to keep current password"
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <Button disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save changes"}</Button>
        </form>
      </Card>
    </div>
  );
}
