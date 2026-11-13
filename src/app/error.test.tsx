import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import RootError from "@/app/error";
import SiteError from "@/app/(site)/error";

describe("pages d'erreur", () => {
  it("l'erreur hors gabarit déclare le bandeau fictif et son propre <main id=contenu>", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <RootError error={new Error("détail interne")} retry={() => {}} />,
    );
    expect(container.querySelectorAll("main#contenu")).toHaveLength(1);
    expect(screen.getByText("Projet pédagogique")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    // Aucune exception brute affichée.
    expect(screen.queryByText(/détail interne/)).toBeNull();
  });

  it("l'erreur dans le gabarit n'ajoute pas de second <main> et propose « Réessayer »", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const retry = vi.fn();
    const { container } = render(<SiteError error={new Error("x")} retry={retry} />);
    expect(container.querySelector("main")).toBeNull();
    await userEvent.setup().click(screen.getByRole("button", { name: "Réessayer" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
