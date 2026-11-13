import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./button-styles";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type LinkButtonProps = CommonProps &
  Omit<ComponentProps<typeof Link>, "className" | "children"> & {
    href: string;
    pressed?: never;
  };

type NativeButtonProps = CommonProps &
  Omit<ComponentProps<"button">, "className" | "children"> & {
    href?: undefined;
    /** Bouton bascule (comparateur, filtres) : rend `aria-pressed`. */
    pressed?: boolean;
  };

export type ButtonProps = LinkButtonProps | NativeButtonProps;

/**
 * Bouton VERSUS (§4.3). Avec `href`, il rend un `<Link>` (navigation) ; sinon un `<button>`
 * (`type="button"` par défaut, pour ne jamais soumettre un formulaire par accident).
 */
export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { variant, size, className, children, pressed: _pressed, ...rest } = props;
    void _pressed;
    return (
      <Link className={buttonClasses({ variant, size, className })} {...rest}>
        {children}
      </Link>
    );
  }
  const { variant, size, className, children, pressed, type = "button", ...rest } = props;
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={buttonClasses({ variant, size, className })}
      {...rest}
    >
      {children}
    </button>
  );
}
