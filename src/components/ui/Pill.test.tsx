import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pill } from "./Pill";

describe("Pill", () => {
  it("rend un <button type=button> dont aria-pressed suit la sélection", () => {
    render(
      <>
        <Pill selected>Toutes</Pill>
        <Pill>Apple</Pill>
      </>,
    );
    const selected = screen.getByRole("button", { name: "Toutes" });
    expect(selected.getAttribute("type")).toBe("button");
    expect(selected.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Apple" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
  });

  it("appelle onClick au clic", async () => {
    const onClick = vi.fn();
    render(<Pill onClick={onClick}>Samsung</Pill>);
    await userEvent.setup().click(screen.getByRole("button", { name: "Samsung" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("transmet data-state pour montrer survol et focus dans /styleguide", () => {
    render(<Pill data-state="focus">Xiaomi</Pill>);
    expect(screen.getByRole("button", { name: "Xiaomi" }).getAttribute("data-state")).toBe("focus");
  });
});
