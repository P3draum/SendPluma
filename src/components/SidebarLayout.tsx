"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

// The old dark-sidebar layout is replaced by the shared pill-navbar
// on the public-facing pages. The Painel inbox keeps its own full layout.
export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Painel inbox keeps the old dark sidebar (built inside /painel/page.tsx itself for now)
  // All other routes get the clean white layout
  return <>{children}</>;
}
