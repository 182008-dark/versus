import { useSyncExternalStore } from "react";

function subscribeLoad(onChange: () => void) {
  window.addEventListener("load", onChange);
  return () => window.removeEventListener("load", onChange);
}

/**
 * Vrai une fois la page entièrement chargée (événement `load`) ; faux au rendu serveur et à
 * l'hydratation. Sert à différer les visuels des diapositives cachées du hero après le LCP.
 */
export function usePageLoaded() {
  return useSyncExternalStore(
    subscribeLoad,
    () => document.readyState === "complete",
    () => false,
  );
}
