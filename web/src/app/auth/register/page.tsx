"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";
import { register } from "@/services/auth-service";
import type { RegisterPayload } from "@/types/auth";

const initialState: RegisterPayload = {
  name: "",
  email: "",
  password: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterPayload>(initialState);

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      toast.success("Account created. You can log in as a client admin now.");
      router.push("/auth/login");
    },
    onError: () => {
      toast.error("Registration failed. That email may already exist.");
    },
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf3_0%,#f2eadf_100%)] px-4 py-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-[linear-gradient(160deg,rgba(246,195,84,0.32),rgba(255,255,255,0.75))] p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-500">Client onboarding</p>
          <h1 className="mt-4 font-[var(--font-heading)] text-4xl font-semibold text-stone-950">
            Launch a new restaurant brand into the Bhojan dashboard
          </h1>
          <p className="mt-5 text-sm leading-7 text-stone-600">
            The current backend creates all registered users as <strong>CLIENT_ADMIN</strong>, so this flow is perfect
            for brand owners who need branch, category, menu, and order control.
          </p>
        </Card>

        <Card className="p-8">
          <h2 className="font-[var(--font-heading)] text-3xl font-semibold text-stone-950">Register</h2>
          <p className="mt-2 text-sm text-stone-500">This screen uses the real `/auth/register` API.</p>

          <form
            className="mt-8 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate(form);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
            </div>

            <Button className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-stone-500">
            Already have access?{" "}
            <Link href="/auth/login" className="font-semibold text-stone-950">
              Back to login
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
