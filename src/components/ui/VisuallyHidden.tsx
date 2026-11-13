import type { ComponentProps } from "react";

/** Texte lu par les lecteurs d'écran mais invisible à l'écran. */
export function VisuallyHidden({ className, ...props }: ComponentProps<"span">) {
  return <span className={className ? `sr-only ${className}` : "sr-only"} {...props} />;
}
