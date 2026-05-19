import { Building2, Globe, Phone } from "lucide-react";

import Card from "@/components/ui/card";

import type { Client } from "@/types/client";

interface Props {
  client: Client;
}

export default function ClientCard({ client }: Props) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Client</p>
          <h2 className="mt-2 text-xl font-semibold text-stone-900">{client.name}</h2>
          <p className="text-sm text-stone-500">{client.company_name}</p>
        </div>
        <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-stone-900">
          <Building2 className="size-5" />
        </div>
      </div>

      <div className="grid gap-3 text-sm text-stone-600">
        <div className="flex items-center gap-2">
          <Phone className="size-4" />
          <span>{client.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="size-4" />
          <span>{client.domain}</span>
        </div>
      </div>
    </Card>
  );
}
