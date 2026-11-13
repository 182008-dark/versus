import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";
import { TextLink } from "./TextLink";

export function SectionHeader({
  eyebrow,
  title,
  intro,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-2 text-display-h2">{title}</h2>
      </div>
      {intro ? <p className="max-w-[420px] text-sm leading-relaxed text-muted">{intro}</p> : null}
      {href && linkLabel ? (
        <TextLink href={href} arrow>
          {linkLabel}
        </TextLink>
      ) : null}
    </div>
  );
}
