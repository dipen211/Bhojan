"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";

import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";
import { CUSTOMER_STORE_FRONT, ROLE_OPTIONS, SEEDED_LOGINS } from "@/lib/constants";
import { login } from "@/services/auth-service";
import { useSessionStore } from "@/stores";
import type { LoginPayload } from "@/types/auth";

const demoCredentials = {
  email: "admin@bhojan.com",
  password: "admin123",
};

export default function LoginPage() {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);
  const [form, setForm] = useState<LoginPayload>(demoCredentials);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setSession(data.access_token, data.user);
      toast.success(`Login successful as ${data.user.role}`);
      router.push("/dashboard");
    },
    onError: () => {
      toast.error("Login failed. Use one of the seeded role accounts.");
    },
  });

  function fillCredentials(email: string, password: string) {
    setForm({ email, password });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(246,195,84,0.35),transparent_26%),linear-gradient(180deg,#fffaf3_0%,#f3eadf_100%)] px-4 py-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden bg-[linear-gradient(135deg,#24170e_0%,#4f331d_100%)] p-0 text-white">
          <div className="grid h-full gap-10 px-8 py-10 lg:grid-rows-[auto_1fr_auto]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--accent)] p-3 text-stone-950">
                <Sparkles className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-stone-300">Bhojan SaaS</p>
                <h1 className="font-[var(--font-heading)] text-4xl font-semibold">
                  Four role access with white-label branch storefronts
                </h1>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {ROLE_OPTIONS.map((role) => (
                <div
                  key={role.value}
                  className="rounded-[28px] border border-white/15 bg-white/8 p-5 text-left"
                >
                  <p className="text-xs uppercase tracking-[0.26em] text-stone-300">{role.label}</p>
                  <p className="mt-3 text-sm leading-6 text-stone-100">{role.description}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[28px] border border-white/12 bg-black/10 p-5 text-sm text-stone-200">
              Customer access stays open without login at{" "}
              <Link className="font-semibold text-white" href={`/${CUSTOMER_STORE_FRONT.tenant}/${CUSTOMER_STORE_FRONT.branch}`}>
                /{CUSTOMER_STORE_FRONT.tenant}/{CUSTOMER_STORE_FRONT.branch}
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-400">Secure access</p>
            <h2 className="mt-3 font-[var(--font-heading)] text-3xl font-semibold text-stone-950">Role login</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Use a seeded account for super admin, client admin, or branch manager. End users do not need login.
            </p>
          </div>

          <div className="mb-6 grid gap-3">
            {SEEDED_LOGINS.map((entry) => (
              <button
                key={entry.email}
                type="button"
                onClick={() => fillCredentials(entry.email, entry.password)}
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-left transition hover:border-stone-300 hover:bg-white"
              >
                <p className="text-sm font-semibold text-stone-950">{entry.label}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-500">{entry.email}</p>
              </button>
            ))}
          </div>

          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate(form);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
            </div>

            <Button className="w-full" disabled={mutation.isPending}>
              <Lock className="mr-2 size-4" />
              {mutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-stone-500">
            Need a client admin account?{" "}
            <Link href="/auth/register" className="font-semibold text-stone-950">
              Register here
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
