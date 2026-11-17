import clsx from "clsx";
import type { ComponentProps } from "react";

export function Reveal({
  className,
  variant = "reveal",
  ...props
}: ComponentProps<"div"> & { variant?: "reveal" | "zoom" | "rise" }) {
  return <div className={clsx(variant, className)} {...props} />;
}
