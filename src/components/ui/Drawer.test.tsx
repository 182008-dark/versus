import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { describe, expect, it } from "vitest";
import { Drawer } from "./Drawer";

function Harness() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={trigger} type="button" onClick={() => setOpen(true)}>
        Panier
      </button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Votre panier"
        returnFocusRef={trigger}
        footer={<a href="/panier">Voir le panier</a>}
      >
        <p>Contenu</p>
      </Drawer>
    </>
  );
}

describe("Drawer", () => {
  it("s'ouvre nommé par son titre, focalise « Fermer » et se ferme avec Échap", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Panier" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Votre panier" });
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Fermer" }));
    await user.keyboard("{Escape}");
    expect(dialog.hasAttribute("open")).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it("piège le focus : Tab depuis le dernier élément revient au premier", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Panier" }));
    screen.getByRole("link", { name: "Voir le panier" }).focus();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Fermer" }));
  });

  it("le bouton « Fermer » rend le focus au déclencheur", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Panier" });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Fermer" }));
    expect(document.activeElement).toBe(trigger);
  });
});
