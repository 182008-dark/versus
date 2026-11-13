import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Dialog } from "./Dialog";

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-expanded={open}>
        Ouvrir
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} label="Exemple">
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
});
