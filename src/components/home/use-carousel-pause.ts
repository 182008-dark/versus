import { useState, useSyncExternalStore, type FocusEvent, type PointerEvent } from "react";

const MOTION_OK = "(prefers-reduced-motion: no-preference)";

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(MOTION_OK);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function subscribeLoad(onChange: () => void) {
  window.addEventListener("load", onChange);
  return () => window.removeEventListener("load", onChange);
}

/**
 * Vrai une fois la page entièrement chargée (événement `load`) ; faux au rendu serveur et à
 * l'hydratation. Sert à différer les visuels des diapositives cachées après le LCP.
 */
export function usePageLoaded() {
  return useSyncExternalStore(
    subscribeLoad,
    () => document.readyState === "complete",
    () => false,
  );
}

/**
 * Pauses automatiques du carrousel (§4.5) : survol à la souris (pas au toucher, qui laisserait
 * le survol « collé »), focus à l'intérieur, onglet caché. `motionOk` est faux sous mouvement
 * réduit, et pendant le rendu serveur et l'hydratation : le défilement ne démarre qu'une fois
 * le composant interactif, sans écart entre le HTML serveur et le premier rendu client.
 */
export function useCarouselPause() {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const motionOk = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION_OK).matches,
    () => false,
  );
  const hidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false,
  );

  const handlers = {
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType !== "touch") setHovered(true);
    },
    onPointerLeave: (event: PointerEvent) => {
      if (event.pointerType !== "touch") setHovered(false);
    },
    onFocus: () => setFocused(true),
    onBlur: (event: FocusEvent) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
    },
  };

  return { interacting: hovered || focused || hidden, motionOk, handlers };
}
