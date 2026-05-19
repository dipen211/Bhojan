import type { HTMLAttributes, ReactNode } from "react";

import { classNames } from "@/utils";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ children, className, ...props }: Props) {
  return (
    <div
      className={classNames(
        "rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-[0_20px_70px_rgba(32,24,16,0.08)] backdrop-blur",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
