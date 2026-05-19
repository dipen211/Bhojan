import type { ReactNode } from "react";

import { classNames } from "@/utils";

interface Props {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}

const tones = {
  default: "bg-stone-900 text-white",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
};

export default function Badge({ children, tone = "default" }: Props) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
