"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";

/** Démonstration de Drawer (styleguide uniquement) : le tiroir du mini-panier, sans panier. */
export function DrawerDemo() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button
        ref={trigger}
        variant="secondary"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        Ouvrir le tiroir
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Exemple de tiroir"
        returnFocusRef={trigger}
        footer={
          <Button onClick={() => setOpen(false)} className="w-full">
            Action du pied
          </Button>
        }
      >
        <p className="py-6 leading-relaxed text-muted">
          Panneau latéral de 440 px au plus (pleine largeur sur téléphone) : élément dialog natif,
          Échap et clic sur le voile ferment, focus piégé puis rendu au bouton.
        </p>
      </Drawer>
    </>
  );
}
