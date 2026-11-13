import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FictiveNotice } from "@/components/layout/FictiveNotice";

describe("FictiveNotice", () => {
  it("affiche le caractère fictif du site et les prix en FCFA", () => {
    render(<FictiveNotice />);
    expect(screen.getByText("Projet pédagogique")).toBeTruthy();
    expect(screen.getByText(/Site fictif, aucune vente réelle/)).toBeTruthy();
    expect(screen.getByText(/Prix indicatifs en FCFA/)).toBeTruthy();
  });
});
