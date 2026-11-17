import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

type PillProps = Omit<
  ComponentProps<"button">,
  "type" | "className" | "children" | "aria-pressed"
> & {
  selected?: boolean;
  children: ReactNode;
};

/**
 * Pastille bascule (maquette : `.pill`), `aria-pressed` selon `selected`. Les autres attributs
 * passent au bouton, dont `data-state` qui force survol et focus dans /styleguide. Non sélectionnée :
 * contour `--line-control` (3,27:1) sur un fond blanc, y compris posée sur la surface grise.
 */
export function Pill({ selected = false, children, ...rest }: PillProps) {
  return (
    <button
      {...rest}
      type="button"
      aria-pressed={selected}
      className={clsx(
        "inline-flex h-11 items-center rounded-full border px-5 text-sm font-medium transition-colors",
        selected
          ? "border-ink bg-ink text-on-dark"
          : "border-line-control bg-bg text-ink state-hover:border-ink",
      )}
    >
      {children}
    </button>
  );
}
