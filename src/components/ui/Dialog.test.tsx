import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Activity, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog";

function Harness({ onCloseSpy }: { onCloseSpy?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-expanded={open}>
        Ouvrir
      </button>
      <Dialog
        open={open}
        onClose={() => {
          onCloseSpy?.();
          setOpen(false);
        }}
        label="Exemple"
      >
        <a href="/garantie">Premier lien</a>
        <button type="button" data-autofocus onClick={() => setOpen(false)}>
          Fermer
        </button>
      </Dialog>
    </>
  );
}

describe("Dialog", () => {
  it("s'ouvre, focalise [data-autofocus] et rend le focus au déclencheur à la fermeture", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Ouvrir" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Exemple" });
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Fermer" }));

    await user.click(screen.getByRole("button", { name: "Fermer" }));
    expect(dialog.hasAttribute("open")).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it("se ferme avec Échap", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Ouvrir" }));
    const dialog = screen.getByRole("dialog", { name: "Exemple" });
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(dialog.hasAttribute("open")).toBe(false);
    expect(screen.getByRole("button", { name: "Ouvrir" }).getAttribute("aria-expanded")).toBe(
      "false",
    );
  });

  it("piège le focus : Tab sur le dernier élément revient au premier", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Ouvrir" }));
    const dialog = screen.getByRole("dialog", { name: "Exemple" });
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Premier lien" }));
  });

  it("appelle onClose une seule fois pour Échap", async () => {
    const user = userEvent.setup();
    const onCloseSpy = vi.fn();
    render(<Harness onCloseSpy={onCloseSpy} />);
    await user.click(screen.getByRole("button", { name: "Ouvrir" }));
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Exemple" }), { key: "Escape" });
    expect(onCloseSpy).toHaveBeenCalledTimes(1);
  });

  it("n'appelle pas onClose quand c'est le parent qui ferme", async () => {
    const user = userEvent.setup();
    const onCloseSpy = vi.fn();
    render(<Harness onCloseSpy={onCloseSpy} />);
    await user.click(screen.getByRole("button", { name: "Ouvrir" }));
    // Le bouton « Fermer » passe directement open à false, sans passer par onClose.
    await user.click(screen.getByRole("button", { name: "Fermer" }));
    expect(screen.getByRole("dialog", { hidden: true }).hasAttribute("open")).toBe(false);
    expect(onCloseSpy).not.toHaveBeenCalled();
  });

  it("se ferme quand <Activity> masque la page (navigation avec cacheComponents)", async () => {
    const onClose = vi.fn();
    function Page({ visible }: { visible: boolean }) {
      return (
        <Activity mode={visible ? "visible" : "hidden"}>
          <Dialog open onClose={onClose} label="Menu">
            <button type="button">Action</button>
          </Dialog>
        </Activity>
      );
    }
    const { rerender } = render(<Page visible />);
    const dialog = screen.getByRole("dialog", { name: "Menu" });
    expect(dialog.hasAttribute("open")).toBe(true);
    await act(async () => rerender(<Page visible={false} />));
    expect(dialog.hasAttribute("open")).toBe(false);
    // De retour sur la page, la boîte reflète de nouveau l'état du parent (ici, toujours ouvert ;
    // MobileMenu, lui, remet son état à « fermé » quand il est masqué).
    await act(async () => rerender(<Page visible />));
    expect(dialog.hasAttribute("open")).toBe(true);
  });
});
