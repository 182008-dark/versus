import Link from "next/link";

export type BreadcrumbItem = { label: string; href?: string | null };

/**
 * Fil d'Ariane (§4.7 du plan de refonte) : « Accueil › Samsung ». Les étapes avec `href` sont
 * des liens de 44 px de haut ; la dernière (la page affichée) est un texte, sans lien ni
 * `aria-current` : l'en-tête porte déjà le seul « page courante » de la page (lot 3). Le
 * séparateur « › » est décoratif.
 */
export function Breadcrumb({ items }: { items: readonly BreadcrumbItem[] }) {
  return (
    <nav aria-label="Fil d’Ariane" className="text-sm">
      <ol className="flex flex-wrap items-center gap-x-2 text-muted-strong">
        {items.map((item, index) => (
          <li key={item.label} className="flex min-h-11 items-center gap-2">
            {index > 0 ? <span aria-hidden="true">›</span> : null}
            {item.href ? (
              <Link
                href={item.href}
                className="inline-flex min-h-11 items-center underline-offset-4 state-hover:text-ink state-hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-ink">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
