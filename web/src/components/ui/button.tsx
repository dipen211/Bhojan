import type { ButtonHTMLAttributes, ReactNode } from "react";

import { classNames } from "@/utils";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

const variants = {
  primary: "bg-[var(--accent)] text-stone-950 hover:bg-[var(--accent-strong)]",
  secondary: "bg-stone-950 text-white hover:bg-stone-800",
  ghost: "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
};

export default function Button({
  children,
  className,
  variant = "primary",
  ...props
}: Props) {
  return (
    <button
      className={classNames(
        "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
