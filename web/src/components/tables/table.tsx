import type { ReactNode } from 'react';

export default function Table({ children }: { children: ReactNode }) {
  return <table>{children}</table>;
}
