"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { isCurrentLink } from "./nav-current";

/**
 * Lien de navigation qui porte `aria-current="page"` sur la page courante (§4.3) : adresse
 * exacte, jamais une ancre (`isCurrentLink`). `markCurrent={false}` pour un lien qui double la
 * navigation principale (pied de page) : une page n'expose qu'un seul lien « page courante ».
 * Îlot client minimal : seul `usePathname()` l'exige.
 */
export function NavLink({
  href,
  markCurrent = true,
  ...props
}: ComponentProps<typeof Link> & { href: string; markCurrent?: boolean }) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      aria-current={isCurrentLink(pathname, href, markCurrent) ? "page" : undefined}
      {...props}
    />
  );
}
