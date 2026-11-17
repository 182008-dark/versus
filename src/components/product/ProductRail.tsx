"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { PillGroup, type PillOption } from "@/components/ui/PillGroup";

export type RailItem = { key: string; brand: string; card: ReactNode };

const ALL = "all";

const EMPTY_LABEL = "Aucun produit pour cette marque.";

/**
 * Message de statut du filtre : il nomme la marque pour changer à chaque filtre, même quand deux
 * marques ont autant de produits, sans quoi un lecteur d'écran n'annoncerait rien.
 */
function statusLabel(brandName: string | null, count: number) {
  if (brandName === null) return `Tous les produits affichés : ${count}.`;
  if (count === 0) return `Aucun produit ${brandName} pour le moment.`;
  return count === 1
    ? `1 produit ${brandName} affiché.`
    : `${count} produits ${brandName} affichés.`;
}

/**
 * Rail horizontal de produits (maquette : `.pills` et `.rail`), îlot client minimal : les cartes
 * sont rendues par le serveur (`card`), seuls le filtre et le défilement sont ici.
 * - flèches « précédents » et « suivants » : `aria-disabled` aux extrémités, jamais `disabled`,
 *   pour que le focus clavier reste sur le bouton ; un clic sur une flèche inactive est ignoré ;
 * - défilement d'une carte, doux seulement sans mouvement réduit ;
 * - filtre par marque : retour au début du rail et message de statut nommant la marque
 *   (WCAG 4.1.3), état vide.
 */
export function ProductRail({
  items,
  label,
  filters,
}: {
  items: readonly RailItem[];
  label: string;
  filters: readonly PillOption[];
}) {
  const railRef = useRef<HTMLUListElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(true);
  const [brand, setBrand] = useState(ALL);
  const [filtered, setFiltered] = useState(false);
  const visible = brand === ALL ? items : items.filter((item) => item.brand === brand);

  const updateEdges = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setCanGoBack(rail.scrollLeft > 1);
    setCanGoForward(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollLeft = 0;
    updateEdges();
    rail.addEventListener("scroll", updateEdges, { passive: true });
    const observer = new ResizeObserver(updateEdges);
    observer.observe(rail);
    return () => {
      rail.removeEventListener("scroll", updateEdges);
      observer.disconnect();
    };
  }, [updateEdges, brand]);

  function scroll(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail || (direction < 0 ? !canGoBack : !canGoForward)) return;
    const card = rail.querySelector<HTMLElement>("li");
    const gap = Number.parseFloat(getComputedStyle(rail).columnGap) || 0;
    const smooth = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    rail.scrollBy({
      left: direction * ((card?.offsetWidth ?? 300) + gap),
      behavior: smooth ? "smooth" : "auto",
    });
  }

  const arrow =
    "grid size-11 place-items-center rounded-full border border-line text-ink aria-disabled:cursor-default aria-disabled:opacity-35 state-hover:bg-surface";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PillGroup
          label="Filtrer par marque"
          defaultValue={ALL}
          onChange={(value) => {
            setBrand(value);
            setFiltered(true);
          }}
          options={filters}
        />
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Produits précédents"
            aria-disabled={canGoBack ? undefined : true}
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
            aria-disabled={canGoForward ? undefined : true}
            onClick={() => scroll(1)}
            className={arrow}
          >
            <span aria-hidden="true" className="text-xl">
              →
            </span>
          </button>
        </div>
      </div>
      <p role="status" className="sr-only">
        {filtered
          ? statusLabel(
              brand === ALL
                ? null
                : (filters.find((option) => option.value === brand)?.label ?? brand),
              visible.length,
            )
          : ""}
      </p>
      {visible.length === 0 ? (
        <p className="mt-6 text-muted">{EMPTY_LABEL}</p>
      ) : (
        <ul
          ref={railRef}
          role="list"
          tabIndex={0}
          aria-label={label}
          className="-mx-6 mt-7 grid snap-x snap-mandatory scroll-px-6 auto-cols-[300px] grid-flow-col gap-[18px] overflow-x-auto px-6 pt-1.5 pb-6"
        >
          {visible.map((item) => (
            <li key={item.key} className="flex snap-start">
              {item.card}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
