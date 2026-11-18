import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuantityStepper } from "./QuantityStepper";

const label = "iPhone 18 Pro (Bordeaux · 512 Go)";

describe("QuantityStepper", () => {
  it("nomme le groupe et ses boutons d'après l'article", () => {
    render(<QuantityStepper label={label} qty={2} max={5} onChange={vi.fn()} />);
    expect(screen.getByRole("group", { name: `Quantité de ${label}` })).toBeTruthy();
    expect(screen.getByRole("button", { name: `Diminuer la quantité de ${label}` })).toBeTruthy();
    expect(screen.getByRole("button", { name: `Augmenter la quantité de ${label}` })).toBeTruthy();
  });

  it("change la quantité d'un cran", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuantityStepper label={label} qty={2} max={5} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: /^Augmenter/ }));
    expect(onChange).toHaveBeenLastCalledWith(3);
    await user.click(screen.getByRole("button", { name: /^Diminuer/ }));
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it("aux bornes : aria-disabled, focus conservé, clic ignoré", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <QuantityStepper label={label} qty={4} max={5} onChange={onChange} />,
    );
    const plus = screen.getByRole("button", { name: /^Augmenter/ });
    await user.click(plus);
    rerender(<QuantityStepper label={label} qty={5} max={5} onChange={onChange} />);
    expect(plus.getAttribute("aria-disabled")).toBe("true");
    expect(plus.hasAttribute("disabled")).toBe(false);
    expect(document.activeElement).toBe(plus);
    onChange.mockClear();
    await user.click(plus);
    expect(onChange).not.toHaveBeenCalled();
    rerender(<QuantityStepper label={label} qty={1} max={5} onChange={onChange} />);
    const minus = screen.getByRole("button", { name: /^Diminuer/ });
    expect(minus.getAttribute("aria-disabled")).toBe("true");
    await user.click(minus);
    expect(onChange).not.toHaveBeenCalled();
  });
});
