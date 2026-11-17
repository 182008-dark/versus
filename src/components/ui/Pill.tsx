import clsx from "clsx";
import type { ReactNode } from "react";

export function Pill({
  selected = false,
  children,
  onClick,
}: {
  selected?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={clsx(
        "inline-flex h-11 items-center rounded-full border px-5 text-sm font-medium transition-colors",
        selected
          ? "border-ink bg-ink text-on-dark"
          : "border-line bg-transparent text-ink state-hover:border-ink",
      )}
    >
      {children}
    </button>
  );
}
