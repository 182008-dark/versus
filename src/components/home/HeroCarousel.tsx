import { Icon } from "@/components/ui/Icon";
import { BRANDS, heroStyle, heroThemes, type Brand } from "@/lib/brand-themes";
import type { HomeEntry } from "@/lib/catalog/types";
import { HeroRotator } from "./HeroRotator";
import { HeroSlide } from "./HeroSlide";

function heroBrand(entry: HomeEntry): Brand {
  return (BRANDS as readonly string[]).includes(entry.theme_key)
    ? (entry.theme_key as Brand)
    : entry.product.brand_slug;
}

/**
 * Hero de l'accueil (maquette : `section.hero`), composant serveur. Il rend chaque diapositive
 * (HeroSlide) et les icônes, puis les confie à l'îlot client HeroRotator, qui ne gère que l'état.
 * Le thème vient de `home_slots.theme_key` (couleurs de `lib/brand-themes.ts`).
 */
export function HeroCarousel({ entries }: { entries: readonly HomeEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <HeroRotator
      slides={entries.map((entry, index) => {
        const brand = heroBrand(entry);
        const tone = heroThemes[brand].tone;
        return {
          key: entry.product.code,
          name: entry.headline ?? entry.product.name,
          tone,
          style: heroStyle(brand),
          content: <HeroSlide entry={entry} tone={tone} priority={index === 0} />,
        };
      })}
      icons={{
        previous: <Icon name="chevronLeft" size={16} stroke={2} />,
        next: <Icon name="chevronRight" size={16} stroke={2} />,
      }}
    />
  );
}
