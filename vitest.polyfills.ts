/**
 * Chargé AVANT vitest.setup.ts (qui importe react-dom) : React choisit au chargement le nom de
 * l'événement de fin d'animation selon la présence d'`AnimationEvent`, absent de jsdom. Sans ce
 * constructeur minimal, `onAnimationEnd` (horloge du carrousel) ne serait jamais appelé en test.
 */
if (typeof window !== "undefined" && typeof window.AnimationEvent === "undefined") {
  class AnimationEventPolyfill extends Event {
    readonly animationName: string;
    readonly elapsedTime: number;
    readonly pseudoElement: string;

    constructor(type: string, init: AnimationEventInit = {}) {
      super(type, init);
      this.animationName = init.animationName ?? "";
      this.elapsedTime = init.elapsedTime ?? 0;
      this.pseudoElement = init.pseudoElement ?? "";
    }
  }
  Object.defineProperty(window, "AnimationEvent", { value: AnimationEventPolyfill });
}
