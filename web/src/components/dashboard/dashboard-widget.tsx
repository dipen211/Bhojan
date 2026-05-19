import { ArrowUpRight } from "lucide-react";

import Card from "@/components/ui/card";

interface Props {
  label: string;
  value: string;
  hint: string;
  handleNavigate?: () => void;
}

export default function DashboardWidget({ label, value, hint, handleNavigate }: Props) {
  return (
    <Card className="space-y-4" onClick={handleNavigate}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-500">{label}</p>
        <ArrowUpRight className="size-4 text-stone-400" />
      </div>
      <p className="text-3xl font-semibold text-stone-950">{value}</p>
      <p className="text-sm text-stone-500">{hint}</p>
    </Card>
  );
}
