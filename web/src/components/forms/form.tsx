import type { ReactNode } from 'react';

export default function Form({ children }: { children: ReactNode }) {
  return <form>{children}</form>;
}
