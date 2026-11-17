"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { CarouselControls, type CarouselIcons } from "./CarouselControls";
import { useCarouselPause, usePageLoaded } from "./use-carousel-pause";

/** Durée d'une diapositive : une seule valeur, transmise à l'animation CSS de la barre. */
const INTERVAL_MS = 6000;

export type HeroRotatorSlide = {
  key: string;
  name: string;
  tone: "dark" | "light";
  style: Record<`--${string}`, string>;
  content: ReactNode;
};

/**
 * Îlot client du hero (§4.5, modèle « carrousel » de l'APG) : diapositive active, pauses et
 * commandes. Les diapositives sont rendues par le serveur (`content`).
 * - une seule horloge : la barre de progression (voir CarouselControls) ;
 * - pause au survol, au focus, onglet caché et par le bouton de rotation ; aucune rotation
 *   sous mouvement réduit ;
 * - chaque diapositive est un `group` « diapositive » nommé « n sur N » ; la zone n'est
 *   annoncée (`aria-live="polite"`) que lorsque la rotation est suspendue.
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
  const [stopped, setStopped] = useState(false);
  /** Faux jusqu'au premier changement : l'entrée animée ne rejoue pas au chargement (LCP). */
  const [changed, setChanged] = useState(false);
  const { interacting, motionOk, handlers } = useCarouselPause();
  const loaded = usePageLoaded();
  const count = slides.length;
  const canRotate = motionOk && count > 1;
  const paused = !canRotate || stopped || interacting;
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
      data-autoplay={canRotate ? "" : undefined}
      data-paused={paused ? "" : undefined}
      data-stopped={stopped ? "" : undefined}
      data-changed={changed ? "" : undefined}
      data-deferred={loaded || changed ? undefined : ""}
      style={{ ...current.style, "--hero-interval": `${INTERVAL_MS}ms` } as CSSProperties}
      {...handlers}
    >
      <div className="hero-slides" aria-live={paused ? "polite" : "off"}>
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
        rotating={!stopped}
        canRotate={canRotate}
        icons={icons}
        onSelect={goTo}
        onToggleRotation={() => setStopped((value) => !value)}
        onProgressEnd={() => goTo(active + 1)}
      />
    </section>
  );
}
