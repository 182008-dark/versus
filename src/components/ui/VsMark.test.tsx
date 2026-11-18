import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VsMark } from "./VsMark";

describe("VsMark", () => {
  it("est masqué aux lecteurs d'écran et n'est pas focalisable", () => {
    const { container } = render(
      <p>
        Apple <VsMark /> Samsung
      </p>,
    );
    const mark = container.querySelector("[data-vs-mark]") as HTMLElement;
    expect(mark.getAttribute("aria-hidden")).toBe("true");
    expect(mark.hasAttribute("tabindex")).toBe(false);
    expect(mark.tagName).toBe("SPAN");
    // Le nom accessible du paragraphe ne contient pas « VS ».
    expect(screen.queryByText("VS")).toBe(mark);
    expect(container.querySelectorAll("a, button, [role]")).toHaveLength(0);
  });

  it("mesure 44 px par défaut, 32 px en petite taille, et reste rond", () => {
    const { container, rerender } = render(<VsMark />);
    const mark = () => container.querySelector("[data-vs-mark]") as HTMLElement;
    expect(mark().className).toContain("size-11");
    expect(mark().className).toContain("rounded-full");
    rerender(<VsMark size="sm" />);
    expect(mark().className).toContain("size-8");
  });

  it("écrit « VS » en gras à l'encre VERSUS, texte blanc", () => {
    const { container } = render(<VsMark />);
    const mark = container.querySelector("[data-vs-mark]") as HTMLElement;
    expect(mark.textContent).toBe("VS");
    expect(mark.className).toContain("font-extrabold");
    expect(mark.className).toContain("bg-ink");
    expect(mark.className).toContain("text-on-dark");
  });
});
