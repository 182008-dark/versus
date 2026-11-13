import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps, Ref } from "react";
import { countLabel } from "./count-label";
import { CountBadge } from "./CountBadge";
import { Icon, type IconName } from "./Icon";

type CommonProps = {
  /** Nom accessible (« Panier »), complété par le compteur (« Panier, 3 articles »). */
  label: string;
  icon: IconName;
  count?: number;
  /** Unités du compteur, au singulier et au pluriel. */
  countUnits?: readonly [string, string];
  className?: string;
};

type IconLinkProps = CommonProps & { href: string };
type IconNativeButtonProps = CommonProps &
  Omit<ComponentProps<"button">, "className" | "children" | "aria-label"> & {
    href?: undefined;
    ref?: Ref<HTMLButtonElement>;
  };

export type IconButtonProps = IconLinkProps | IconNativeButtonProps;

const classes =
  "relative grid size-11 shrink-0 place-items-center rounded-full text-ink transition-colors state-hover:bg-icon-hover";

/**
 * Bouton ou lien rond de 44 px portant une icône (maquette : `.ibtn`), avec un compteur
 * facultatif. Le changement du compteur est annoncé poliment (région `aria-live`).
 */
export function IconButton(props: IconButtonProps) {
  if (props.href !== undefined) {
    const { label, icon, count, countUnits, className, href } = props;
    const name = countLabel(label, count, countUnits);
    return (
      <>
        <Link href={href} aria-label={name} className={clsx(classes, className)}>
          <Icon name={icon} />
          <Badge count={count} />
        </Link>
        <LiveCount count={count} name={name} />
      </>
    );
  }

  const { label, icon, count, countUnits, className, type = "button", ...rest } = props;
  const name = countLabel(label, count, countUnits);
  return (
    <>
      <button type={type} aria-label={name} className={clsx(classes, className)} {...rest}>
        <Icon name={icon} />
        <Badge count={count} />
      </button>
      <LiveCount count={count} name={name} />
    </>
  );
}

function Badge({ count }: { count: number | undefined }) {
  // La `key` change avec le compteur : l'animation « bump » est rejouée.
  return count !== undefined && count > 0 ? <CountBadge key={count} value={count} /> : null;
}

function LiveCount({ count, name }: { count: number | undefined; name: string }) {
  if (count === undefined) return null;
  return (
    <span className="sr-only" aria-live="polite">
      {name}
    </span>
  );
}
