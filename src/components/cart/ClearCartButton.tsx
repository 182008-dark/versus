"use client";

import { useState, type ComponentType } from "react";
import { updateCart } from "@/lib/cart/cart-store";
import type { ClearCartDialog } from "./ClearCartDialog";

const loadDialog = () => import("./ClearCartDialog").then((module) => module.ClearCartDialog);

/**
 * « Vider le panier », avec confirmation dans une boîte modale chargée au premier clic. Après
 * confirmation, le panier est vidé et `onCleared` place le focus (titre de la page).
 */
export function ClearCartButton({ count, onCleared }: { count: number; onCleared: () => void }) {
  const [Confirm, setConfirm] = useState<ComponentType<
    Parameters<typeof ClearCartDialog>[0]
  > | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onPointerEnter={loadDialog}
        onClick={() =>
          loadDialog().then((component) => {
            setConfirm(() => component);
            setOpen(true);
          })
        }
        className="min-h-11 px-1 text-sm font-semibold text-accent-ink underline underline-offset-4 state-hover:text-ink"
      >
        Vider le panier
      </button>
      {Confirm ? (
        <Confirm
          open={open}
          count={count}
          onClose={() => setOpen(false)}
          onConfirm={() => {
            setOpen(false);
            updateCart({ type: "clear" });
            requestAnimationFrame(onCleared);
          }}
        />
      ) : null}
    </>
  );
}
