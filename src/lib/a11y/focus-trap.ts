import type { KeyboardEvent as ReactKeyboardEvent } from "react";

/**
 * Piège à focus des boîtes de dialogue (Dialog, MobileMenu).
 *
 * `showModal()` rend déjà le reste de la page inerte, mais la tabulation peut quitter la page
 * (barre d'adresse) après le dernier élément. Ces fonctions bouclent explicitement du dernier
 * élément au premier (Tab) et du premier au dernier (Maj+Tab).
 */

const FOCUSABLE = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "summary",
  "[contenteditable='']",
  "[contenteditable='true']",
  "[tabindex]",
].join(",");

/** Éléments atteignables au clavier dans `root`, dans l'ordre du document. */
export function getFocusableElements(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) =>
      el.tabIndex >= 0 &&
      !el.hasAttribute("disabled") &&
      !el.closest("[hidden], [inert]") &&
      el.getAttribute("aria-hidden") !== "true",
  );
}

/**
 * Index à focaliser quand on tabule depuis `current` parmi `count` éléments, ou `null` si le
 * navigateur peut faire le déplacement lui-même (on n'est pas sur une extrémité).
 * `current = -1` : le focus est hors de la liste (sur la boîte elle-même, par exemple).
 */
export function wrapFocusIndex(current: number, count: number, backwards: boolean): number | null {
  if (count === 0) return null;
  if (current === -1) return backwards ? count - 1 : 0;
  if (backwards && current === 0) return count - 1;
  if (!backwards && current === count - 1) return 0;
  return null;
}

/** Gestionnaire `keydown` (Tab) qui garde le focus dans `container`. */
export function trapTabKey(event: KeyboardEvent | ReactKeyboardEvent, container: HTMLElement) {
  if (event.key !== "Tab") return;
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }
  const active = container.ownerDocument.activeElement;
  const current = focusable.findIndex((el) => el === active);
  const target = wrapFocusIndex(current, focusable.length, event.shiftKey);
  if (target !== null) {
    event.preventDefault();
    focusable[target]?.focus();
  }
}
