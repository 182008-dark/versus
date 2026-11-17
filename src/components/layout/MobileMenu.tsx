import type { NavGroup } from "@/config/site";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "./Logo";
import { MobileMenuDialog } from "./MobileMenuDialog";
import { NavLink } from "./NavLink";

/**
 * Menu mobile (≤ 900 px). La maquette n'avait aucune navigation mobile : c'est une correction
 * UX (voir docs/ecarts-maquette.md). Composant serveur : il rend le contenu du menu et le confie
 * à l'îlot client `MobileMenuDialog`, qui ne gère que l'ouverture (budget JavaScript, §7.1).
 */
export function MobileMenu({ groups }: { groups: NavGroup[] }) {
  if (groups.length === 0) return null;

  return (
    <MobileMenuDialog
      menuIcon={<Icon name="menu" />}
      closeIcon={<Icon name="close" />}
      logo={<Logo />}
    >
      {groups.map((group) => (
        <section key={group.label} className="mb-8">
          <Eyebrow as="h3">{group.label}</Eyebrow>
          <ul className="mt-2">
            {group.links.map((link) => (
              <li key={link.href}>
                <NavLink
                  href={link.href}
                  className="block py-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink aria-[current=page]:text-accent state-hover:text-accent"
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </MobileMenuDialog>
  );
}
