"use client";

import { useEffect, useState } from "react";

const arrow =
  "grid size-11 place-items-center rounded-full border border-line-control text-ink aria-disabled:cursor-default aria-disabled:opacity-35 state-hover:bg-surface";

/**
 * Flèches « précédents » et « suivants » du rail (ProductRail), seul îlot client du rail :
 * - `aria-disabled` aux extrémités, jamais `disabled`, pour que le focus clavier reste sur le
 *   bouton ; un clic sur une flèche inactive est ignoré ; sans carte visible (filtre vide), le
 *   rail ne défile plus et les deux flèches sont inactives ;
 * - défilement d'une carte, doux seulement sans mouvement réduit ;
 * - un changement de filtre (évènement `change` du conteneur `[data-rail]`) ramène au début ;
 * - masquées sous 641 px : sur téléphone, le rail défile au doigt (refonte §3.1) et les
 *   pastilles du filtre gardent toute la largeur de la ligne.
 */
export function RailArrows({ listId }: { listId: string }) {
  const [edges, setEdges] = useState({ back: false, forward: true });

  useEffect(() => {
    const rail = document.getElementById(listId);
    if (!rail) return;
    const update = () =>
      setEdges({
        back: rail.scrollLeft > 1,
        forward: rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 1,
      });
    const reset = () => {
      rail.scrollLeft = 0;
      update();
    };
    const root = rail.closest("[data-rail]");
    update();
    rail.addEventListener("scroll", update, { passive: true });
    root?.addEventListener("change", reset);
    const observer = new ResizeObserver(update);
    observer.observe(rail);
    return () => {
      rail.removeEventListener("scroll", update);
      root?.removeEventListener("change", reset);
      observer.disconnect();
    };
  }, [listId]);

  function scroll(direction: -1 | 1) {
    const rail = document.getElementById(listId);
    if (!rail || !(direction < 0 ? edges.back : edges.forward)) return;
    const card = [...rail.children].find(
      (item): item is HTMLElement => item instanceof HTMLElement && item.offsetWidth > 0,
    );
    const gap = Number.parseFloat(getComputedStyle(rail).columnGap) || 0;
    const smooth = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    rail.scrollBy({
      left: direction * ((card?.offsetWidth ?? 300) + gap),
      behavior: smooth ? "smooth" : "auto",
    });
  }

  return (
    <div className="hidden shrink-0 gap-2 sm:flex">
      <button
        type="button"
        aria-label="Produits précédents"
        aria-controls={listId}
        aria-disabled={edges.back ? undefined : true}
        onClick={() => scroll(-1)}
        className={arrow}
      >
        <span aria-hidden="true" className="text-xl">
          ←
        </span>
      </button>
      <button
        type="button"
        aria-label="Produits suivants"
        aria-controls={listId}
        aria-disabled={edges.forward ? undefined : true}
        onClick={() => scroll(1)}
        className={arrow}
      >
        <span aria-hidden="true" className="text-xl">
          →
        </span>
      </button>
    </div>
  );
}
