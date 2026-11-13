import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";

describe("AnnouncementBar", () => {
  it("affiche le caractère fictif du site et les prix en FCFA", () => {
    render(<AnnouncementBar />);
    expect(screen.getByText("Projet pédagogique")).toBeTruthy();
    expect(screen.getByText(/Site fictif, aucune vente réelle/)).toBeTruthy();
    expect(screen.getByText(/Prix indicatifs en FCFA/)).toBeTruthy();
  });

  it("n'est pas un landmark (l'en-tête reste le seul banner)", () => {
    const { container } = render(<AnnouncementBar />);
    expect(container.querySelector("header, [role]")).toBeNull();
  });
});
