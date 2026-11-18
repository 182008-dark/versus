"use client";

import clsx from "clsx";
import { useEffect, useId, useState, type ReactNode } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import type { VariantView } from "@/lib/catalog/variant-options";
import { matchSearch } from "@/lib/catalog/variant-search";

/** Une variante telle que l'îlot la reçoit : vue calculée par le serveur et prix déjà rendu. */
export type PickerView = VariantView & { price: ReactNode };

/**
 * Choix de la variante sur la fiche (PLAN §6, étape 5 ; refonte §3.4), îlot client minimal : le
 * serveur calcule pour chaque variante ses groupes d'options, son nom, son texte de stock et son
 * prix (`variantViews`, `<Price>`), l'îlot ne fait que basculer de l'une à l'autre.
 * - un groupe de boutons radio natifs par critère (Coloris, Capacité, Taille du boîtier) : nom
 *   par `<legend>`, flèches du clavier, choix courant lu dans la légende ; le bouton radio couvre
 *   toute la pastille (cible de 44 px) ;
 * - une option indisponible reste choisissable, en gris barré avec le mot « Indisponible »
 *   (refonte §3.4) : un coloris l'est quand toutes ses variantes sont épuisées ; s'il ne manque
 *   que dans la capacité choisie, la pastille dit laquelle reste (« 512 Go seulement ») ; le
 *   texte de stock et le bouton d'ajout l'expliquent ;
 * - l'adresse suit le choix (`?couleur=bordeaux&stockage=512`, `replaceState`) et une adresse
 *   partagée est relue après l'hydratation (le premier rendu est celui du serveur) ;
 * - prix et texte de stock de la variante choisie dans une région `role="status"` montée dès le
 *   premier rendu : un changement de variante est annoncé poliment (WCAG 4.1.3) ; puis
 *   AddToCartButton, jamais remonté (sa propre région d'annonce reste en place).
 */
export function VariantPicker({
  views,
  initialSku,
  cartHref,
  buttonClassName,
}: {
  views: readonly PickerView[];
  initialSku: string;
  cartHref: string | null;
  /** Classes du bouton d'ajout, calculées par le serveur (`buttonClasses`). */
  buttonClassName: string;
}) {
  const id = useId();
  const [sku, setSku] = useState(initialSku);
  const selected = views.find((view) => view.sku === sku) ?? views[0]!;

  useEffect(() => {
    const fromUrl = matchSearch(views, window.location.search);
    // Adresse partagée : relue une fois, après l'hydratation (aucun écart avec le serveur).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronisation avec l'adresse
    if (fromUrl) setSku(fromUrl.sku);
  }, [views]);

  function choose(next: string) {
    const view = views.find((item) => item.sku === next);
    if (!view) return;
    setSku(next);
    window.history.replaceState(null, "", view.search);
  }

  return (
    <div className="mt-8">
      {selected.groups.map((group) => (
        <fieldset key={group.key} className="mt-5 first:mt-0">
          <legend className="text-base font-bold">
            {group.legend} : <span className="font-normal">{group.selectedLabel}</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.options.map((option) => (
              <label
                key={option.value}
                className={clsx(
                  "relative inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium",
                  "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--focus-ring)",
                  option.selected ? "border-ink ring-1 ring-ink" : "border-line-control",
                  option.unavailable && "text-muted",
                )}
              >
                {group.key === "color" ? (
                  <span
                    aria-hidden="true"
                    className="size-4 shrink-0 rounded-full border border-outline-image bg-surface"
                    style={option.hex ? { backgroundColor: option.hex } : undefined}
                  />
                ) : null}
                <span className={option.unavailable ? "line-through" : undefined}>
                  {option.label}
                </span>
                {option.unavailable ? (
                  <span className="text-xs"> · Indisponible</span>
                ) : option.note ? (
                  <span className="text-xs text-muted"> · {option.note}</span>
                ) : null}
                <input
                  type="radio"
                  name={`${id}-${group.key}`}
                  value={option.value}
                  checked={option.selected}
                  onChange={() => choose(option.sku)}
                  className="absolute inset-0 cursor-pointer appearance-none rounded-full opacity-0"
                />
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <div role="status" className="mt-6">
        <p data-testid="prix-variante">{selected.price}</p>
        <p className="mt-1 text-sm text-muted">{selected.status}</p>
      </div>
      <AddToCartButton
        sku={selected.sku}
        name={selected.name}
        stock={selected.stock}
        cartHref={cartHref}
        className={buttonClassName}
      />
    </div>
  );
}
