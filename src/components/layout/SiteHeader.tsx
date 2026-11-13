import { headerActions, mainNav, mobileNav, type HeaderActionKey } from "@/config/site";
import { IconButton } from "@/components/ui/IconButton";
import type { IconName } from "@/components/ui/Icon";
import { Logo } from "./Logo";
import { MainNav } from "./MainNav";
import { MobileMenu } from "./MobileMenu";

const actionIcons: Record<HeaderActionKey, IconName> = {
  search: "search",
  compare: "compare",
  account: "account",
  cart: "cart",
};

/**
 * En-tête du site (maquette : `.hdr`), landmark `banner` de premier niveau.
 * - collant, 56 px ; translucide et flouté à partir de 901 px, opaque en dessous (écart :
 *   lisibilité et coût du flou sur mobile, voir docs/ecarts-maquette.md) ;
 * - navigation, icônes et menu mobile pilotés par config/site.ts : un élément dont la route
 *   n'est pas livrée est absent du DOM (à l'étape 2 : toutes les icônes et toute la navigation
 *   principale).
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-header-line bg-header-bg md:bg-[var(--header-bg-translucent)] md:backdrop-blur-[20px] md:backdrop-saturate-[1.8]">
      <div className="wrap flex h-[var(--header-height)] items-center justify-between gap-5">
        <Logo />
        <MainNav groups={mainNav} />
        <div className="flex items-center gap-0.5">
          {headerActions.map((action) => (
            <IconButton
              key={action.key}
              href={action.href}
              label={action.label}
              icon={actionIcons[action.key]}
            />
          ))}
          <MobileMenu groups={mobileNav} />
        </div>
      </div>
    </header>
  );
}
