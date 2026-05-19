"use client";

import { useState } from "react";
import Link from "next/link";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import Modal from "@/components/modals/modal";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Error from "@/components/ui/error";
import { Input, Label } from "@/components/ui/field";
import Loading from "@/components/ui/loading";
import { useSession } from "@/hooks/use-session";
import { createClient, deleteClient, getClients, updateClient } from "@/services/client-service";
import type { Client, ClientPayload } from "@/types/client";
import { getEffectiveRole } from "@/utils";

const emptyForm: ClientPayload = {
  name: "",
  company_name: "",
  email: "",
  phone: "",
  slug: "",
  domain: "",
};

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const { hydrated, rolePreview, user } = useSession();
  const [selected, setSelected] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientPayload>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const query = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const effectiveRole = getEffectiveRole(user?.role, rolePreview);

  const saveMutation = useMutation({
    mutationFn: (payload: ClientPayload) =>
      selected ? updateClient(selected.id, payload) : createClient(payload),
    onSuccess: () => {
      toast.success(selected ? "Client updated" : "Client created");
      setSelected(null);
      setForm(emptyForm);
      setModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: () => toast.error("Client save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      toast.success("Client deleted");
      setSelected(null);
      setForm(emptyForm);
      void queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: () => toast.error("Client delete failed"),
  });

  if (!hydrated || query.isLoading) {
    return <Loading />;
  }

  if (query.isError) {
    return <Error message="Clients could not be loaded." />;
  }

  if (effectiveRole !== "SUPER_ADMIN") {
    return <Error message="Only super admin can manage client accounts and white-label domains." />;
  }

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Client portfolio</p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-950">Client table</h1>
            <p className="mt-2 text-sm text-stone-500">
              Manage brands, franchise groups, and white-label domains from one table.
            </p>
          </div>
          <Button
            onClick={() => {
              setSelected(null);
              setForm(emptyForm);
              setModalOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            Add client
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-stone-50">
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-stone-500">
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Domain</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.data?.map((client) => (
                <tr key={client.id} className="border-t border-stone-100 text-sm text-stone-700">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-stone-950">{client.name}</div>
                    <div className="mt-1 text-xs text-stone-500">{client.slug}</div>
                  </td>
                  <td className="px-6 py-4">{client.company_name}</td>
                  <td className="px-6 py-4">{client.email}</td>
                  <td className="px-6 py-4">{client.phone}</td>
                  <td className="px-6 py-4">{client.domain}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/clients/${client.id}`}>
                        <Button variant="secondary">
                          <Eye className="mr-2 size-4" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelected(client);
                          setForm({
                            name: client.name,
                            company_name: client.company_name,
                            email: client.email,
                            phone: client.phone,
                            slug: client.slug,
                            domain: client.domain,
                          });
                          setModalOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(client.id)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!query.data?.length ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-stone-500">
                    No clients found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title={selected ? "Edit client" : "Add client"}
        description="Fill the required details and submit to save client changes."
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
          setForm(emptyForm);
        }}
      >
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate(form);
          }}
        >
          {[
            ["name", "Client name"],
            ["company_name", "Company name"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["slug", "Slug"],
            ["domain", "Domain"],
          ].map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type={key === "email" ? "email" : "text"}
                value={form[key as keyof ClientPayload]}
                onChange={(event) =>
                  setForm((current) => ({ ...current, [key]: event.target.value }))
                }
                required
              />
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save client"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
