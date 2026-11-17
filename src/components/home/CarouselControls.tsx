import type { KeyboardEvent, ReactNode } from "react";

export type CarouselIcons = {
  previous: ReactNode;
  next: ReactNode;
  play: ReactNode;
  pause: ReactNode;
};

/**
 * Commandes du carrousel (maquette : `.h-ctrl`) : précédent, un point par diapositive, suivant,
 * puis le bouton de rotation (WCAG 2.2.2 : arrêter le défilement automatique).
 * - la barre du point actif est l'horloge du carrousel : la fin de son animation (`fill`)
 *   appelle `onProgressEnd`, donc la barre et le changement de diapositive restent
 *   synchronisés, pauses comprises (§4.5) ;
 * - ← et → changent de diapositive quand le focus est sur une commande ;
 * - le bouton de rotation n'existe que si la rotation est possible (pas sous mouvement réduit).
 */
export function CarouselControls({
  names,
  active,
  rotating,
  canRotate,
  icons,
  onSelect,
  onToggleRotation,
  onProgressEnd,
}: {
  names: readonly string[];
  active: number;
  /** Rotation en cours (pas arrêtée par le bouton de rotation). */
  rotating: boolean;
  canRotate: boolean;
  icons: CarouselIcons;
  onSelect: (index: number) => void;
  onToggleRotation: () => void;
  onProgressEnd: () => void;
}) {
  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    onSelect(active + (event.key === "ArrowRight" ? 1 : -1));
  }

  return (
    <div
      className="hero-controls"
      role="group"
      aria-label="Commandes du carrousel"
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        className="hero-button"
        aria-label="Diapositive précédente"
        onClick={() => onSelect(active - 1)}
      >
        {icons.previous}
      </button>
      {names.map((name, index) => {
        const current = index === active;
        return (
          <button
            key={name}
            type="button"
            className={current ? "hero-dot hero-dot-active" : "hero-dot"}
            aria-label={`Afficher ${name}`}
            aria-current={current ? "true" : undefined}
            onClick={() => onSelect(index)}
          >
            <span className="hero-dot-track">
              <span
                className="hero-dot-fill"
                onAnimationEnd={(event) => {
                  if (current && event.animationName === "fill") onProgressEnd();
                }}
              />
            </span>
          </button>
        );
      })}
      <button
        type="button"
        className="hero-button"
        aria-label="Diapositive suivante"
        onClick={() => onSelect(active + 1)}
      >
        {icons.next}
      </button>
      {canRotate ? (
        <button
          type="button"
          className="hero-button"
          aria-label={rotating ? "Mettre en pause le défilement" : "Lancer le défilement"}
          onClick={onToggleRotation}
        >
          {rotating ? icons.pause : icons.play}
        </button>
      ) : null}
    </div>
  );
}
