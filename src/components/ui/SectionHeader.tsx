import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";
import { TextLink } from "./TextLink";

/**
 * En-tête de section : titre simple et informatif, sans point final (refonte, §3.1 et §4.6).
 * Le surtitre (`eyebrow`, alias du lot 2 en petites capitales) est facultatif : l'accueil n'en
 * met plus depuis le lot 4.
 */
export function SectionHeader({
  eyebrow,
  title,
  intro,
  href,
  linkLabel,
  stacked = false,
  titleId,
}: {
  eyebrow?: string;
  title: ReactNode;
  /** Identifiant du titre, pour `aria-labelledby` de la section. */
  titleId?: string;
  intro?: ReactNode;
  href?: string;
  linkLabel?: string;
  /** Accroche sous le titre, en 19 px (maquette : `.lead`), plutôt qu'à côté (`.rail-head`). */
  stacked?: boolean;
}) {
  if (stacked) {
    return (
      <div>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 id={titleId} className={eyebrow ? "mt-2 text-display-h2" : "text-display-h2"}>
          {title}
        </h2>
        {intro ? (
          <p className="mt-4 max-w-[640px] text-[19px] leading-normal text-muted">{intro}</p>
        ) : null}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 id={titleId} className={eyebrow ? "mt-2 text-display-h2" : "text-display-h2"}>
          {title}
        </h2>
      </div>
      {intro ? <p className="max-w-[420px] text-base leading-normal text-muted">{intro}</p> : null}
      {href && linkLabel ? (
        <TextLink href={href} arrow>
          {linkLabel}
        </TextLink>
      ) : null}
    </div>
  );
}
