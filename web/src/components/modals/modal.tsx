import type { ReactNode } from "react";

import Button from "@/components/ui/button";

interface Props {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({ open, title, description, children, onClose }: Props) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-stone-950/35 px-4 py-6" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-2xl rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_30px_90px_rgba(24,16,10,0.24)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold text-stone-950">{title}</p>
            {description ? <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p> : null}
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-6 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
}
