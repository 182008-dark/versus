import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";

/** Section numérotée du styleguide, avec une ancre (`#id`) pour le sommaire. */
export function StyleguideSection({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titre`}
      className="wrap border-t border-line-soft py-14"
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={`${id}-titre`} className="mt-2 text-[32px] leading-tight font-extrabold">
        {title}
      </h2>
      {intro ? <div className="mt-3 max-w-3xl leading-relaxed text-muted">{intro}</div> : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}
