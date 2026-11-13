"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

/**
 * Lien de navigation qui porte `aria-current="page"` sur la page courante (§4.3).
 * Îlot client minimal : seul `usePathname()` l'exige.
 */
export function NavLink({ href, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const pathname = usePathname();
  const path = href.split("#")[0];
  return <Link href={href} aria-current={pathname === path ? "page" : undefined} {...props} />;
}
