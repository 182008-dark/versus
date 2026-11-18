import type { ReactNode } from "react";
import { RadioPills } from "@/components/ui/RadioPills";
import { TextLink } from "@/components/ui/TextLink";
import { RailArrows } from "./RailArrows";

export type RailItem = { key: string; brand: string; card: ReactNode };

/** Lien d'en-tête pour une valeur du filtre (« Tout le catalogue (30) », « Voir les 10 produits Samsung »). */
export type RailLink = { href: string; label: string };

/** Une valeur du filtre : « all » (toutes les marques) ou le slug d'une marque. */
export type RailFilter = { value: string; label: string };

const ALL = "all";

/** « 3 produits » */
const products = (count: number) => `${count} produit${count > 1 ? "s" : ""}`;

/**
 * Rail horizontal de produits (maquette : `.pills` et `.rail`), rendu par le serveur ; seules les
 * flèches sont un îlot client (RailArrows). Refonte §3.1 et §4.7 :
 * - filtre par marque **sans JavaScript** : des pastilles radio (RadioPills), le CSS masque les
 *   cartes des autres marques (`[data-rail]:has(input[value=…]:checked)`, globals.css). Chaque
 *   pastille annonce son nombre de produits (« Samsung, 3 produits ») ; une marque absente du
 *   rail affiche un état vide ;
 * - pastilles et flèches sur une seule ligne (les pastilles défilent sur un petit écran) ;
 * - `heading` (titre rendu par le serveur) et `links` : le lien d'en-tête suit le filtre, en CSS
 *   lui aussi. Comptes et adresses sont calculés par l'appelant.
 * Les valeurs de filtre reconnues par le CSS sont `all`, `apple`, `samsung` et `xiaomi`.
 */
export function ProductRail({
  id,
  items,
  label,
  filters,
  heading,
  links,
}: {
  /** Préfixe unique des identifiants (liste, groupe de boutons radio). */
  id: string;
  items: readonly RailItem[];
  label: string;
  filters: readonly RailFilter[];
  heading?: ReactNode;
  links?: Readonly<Record<string, RailLink>>;
}) {
  const listId = `${id}-liste`;
  const countOf = (value: string) =>
    value === ALL ? items.length : items.filter((item) => item.brand === value).length;
  const linkEntries = Object.entries(links ?? {});

  return (
    <div data-rail className="rail-filter">
      {heading || linkEntries.length > 0 ? (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 sm:mb-8">
          {heading}
          {linkEntries.map(([value, link]) => (
            <span key={value} data-rail-link={value}>
              <TextLink href={link.href} arrow>
                {link.label}
              </TextLink>
            </span>
          ))}
        </div>
      ) : null}
      <div className="flex items-center gap-3">
        <div className="-m-1 min-w-0 flex-1 [scrollbar-width:none] overflow-x-auto p-1">
          <RadioPills
            legend="Filtrer par marque"
            name={`${id}-marque`}
            defaultValue={ALL}
            nowrap
            options={filters.map((filter) => ({
              ...filter,
              hint: `, ${products(countOf(filter.value))}`,
            }))}
          />
        </div>
        <RailArrows listId={listId} />
      </div>
      {filters
        .filter((filter) => filter.value !== ALL && countOf(filter.value) === 0)
        .map((filter) => (
          <p key={filter.value} data-rail-empty={filter.value} className="mt-6 text-muted">
            Aucun produit {filter.label} pour le moment.
          </p>
        ))}
      <ul
        id={listId}
        role="list"
        tabIndex={0}
        aria-label={label}
        className="-mx-gutter mt-7 grid snap-x snap-mandatory scroll-px-gutter auto-cols-[300px] grid-flow-col gap-[18px] overflow-x-auto px-gutter pt-1.5 pb-6"
      >
        {items.map((item) => (
          <li key={item.key} data-rail-item data-brand={item.brand} className="snap-start">
            {item.card}
          </li>
        ))}
      </ul>
    </div>
  );
}
