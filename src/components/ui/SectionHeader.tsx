import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";
import { TextLink } from "./TextLink";

export function SectionHeader({
  eyebrow,
  title,
  intro,
  href,
  linkLabel,
  stacked = false,
  titleId,
}: {
  eyebrow: string;
  title: string;
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
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 id={titleId} className="mt-2 text-display-h2">
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
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 id={titleId} className="mt-2 text-display-h2">
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
