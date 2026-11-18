"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { CarouselControls, type CarouselIcons } from "./CarouselControls";
import { usePageLoaded } from "./use-page-loaded";

export type HeroRotatorSlide = {
  key: string;
  name: string;
  tone: "dark" | "light";
  style: Record<`--${string}`, string>;
  content: ReactNode;
};

/**
 * Îlot client du hero : diapositive active et commandes. Les diapositives sont rendues par le
 * serveur (`content`).
 * - aucune rotation automatique : le visiteur choisit la diapositive ;
 * - chaque diapositive est un `group` « diapositive » nommé « n sur N » ; chaque changement
 *   manuel est annoncé avec `aria-live="polite"`.
 * - les variables `--hero-*` de la diapositive active sont aussi posées sur la section, pour que
 *   les commandes (hors des diapositives) suivent son thème ;
 * - jusqu'à l'événement `load` (ou au premier changement), les diapositives cachées ne sont pas
 *   affichées (`data-deferred`) : leurs visuels ne concurrencent pas celui de la première (LCP).
 */
export function HeroRotator({
  slides,
  icons,
}: {
  slides: readonly HeroRotatorSlide[];
  icons: CarouselIcons;
}) {
  const [active, setActive] = useState(0);
  /** Faux jusqu'au premier changement : l'entrée animée ne rejoue pas au chargement (LCP). */
  const [changed, setChanged] = useState(false);
  const loaded = usePageLoaded();
  const count = slides.length;
  const current = slides[active];
  if (!current) return null;

  function goTo(index: number) {
    setActive((index + count) % count);
    setChanged(true);
  }

  return (
    <section
      aria-roledescription="carrousel"
      aria-label="Produits à la une"
      className="hero-carousel"
      data-tone={current.tone}
      data-manual=""
      data-changed={changed ? "" : undefined}
      data-deferred={loaded || changed ? undefined : ""}
      style={current.style as CSSProperties}
    >
      <div className="hero-slides" aria-live="polite">
        {slides.map((slide, index) => {
          const selected = index === active;
          return (
            <div
              key={slide.key}
              role="group"
              aria-roledescription="diapositive"
              aria-label={`${index + 1} sur ${count}`}
              aria-hidden={selected ? undefined : true}
              inert={!selected}
              data-product-slide={slide.key}
              data-tone={slide.tone}
              className={selected ? "hero-slide hero-slide-active" : "hero-slide"}
              style={slide.style as CSSProperties}
            >
              {slide.content}
            </div>
          );
        })}
      </div>
      <CarouselControls
        names={slides.map((slide) => slide.name)}
        active={active}
        icons={icons}
        onSelect={goTo}
      />
    </section>
  );
}
