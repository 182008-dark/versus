"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

/** Démonstration de Dialog (styleguide uniquement) : le message du futur comparateur. */
export function DialogDemo() {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} aria-haspopup="dialog">
        Ouvrir la boîte de dialogue
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} labelledBy={titleId}>
        <h2 id={titleId} className="text-2xl font-bold">
          Remplacer la sélection ?
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          Le comparateur accepte 3 produits d&apos;une même famille. Exemple de message de
          l&apos;étape 5.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="outline" data-autofocus onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={() => setOpen(false)}>Remplacer</Button>
        </div>
      </Dialog>
    </>
  );
}
