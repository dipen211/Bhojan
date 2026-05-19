import "./globals.css";

import { Manrope, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";

import QueryProvider from "@/providers/query-provider";

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body suppressHydrationWarning className="font-[var(--font-body)] text-stone-900 antialiased">
        <QueryProvider>
          {children}
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
