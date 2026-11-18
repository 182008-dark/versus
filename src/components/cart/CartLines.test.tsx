import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { getCartSnapshot, updateCart } from "@/lib/cart/cart-store";
import { useCart } from "@/lib/cart/use-cart";
import { CartLines } from "./CartLines";

const title = createRef<HTMLHeadingElement>();

/** `unmountWhenEmpty` : comme le tiroir et la page, qui remplacent la liste par l'état vide. */
function Harness({ unmountWhenEmpty = false }: { unmountWhenEmpty?: boolean }) {
  const cart = useCart();
  const empty = !cart || cart.lines.length === 0;
  return (
    <>
      <h1 ref={title} tabIndex={-1}>
        Votre panier
      </h1>
      {cart && !(unmountWhenEmpty && empty) ? (
        <CartLines lines={cart.lines} quote={null} media={{}} fallbackFocus={title} />
      ) : (
        <p>Votre panier est vide.</p>
      )}
    </>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  updateCart({ type: "clear" });
  for (const sku of ["IP18-BOR-512", "S26U-NOI-256", "AP5-BLA"]) updateCart({ type: "add", sku });
});

describe("CartLines", () => {
  it("après « Retirer », focalise la ligne suivante, puis la précédente, puis le titre", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Retirer IP18-BOR-512 du panier" }));
    expect(document.activeElement?.getAttribute("data-sku")).toBe("S26U-NOI-256");
    await user.click(screen.getByRole("button", { name: "Retirer AP5-BLA du panier" }));
    expect(document.activeElement?.getAttribute("data-sku")).toBe("S26U-NOI-256");
    await user.click(screen.getByRole("button", { name: "Retirer S26U-NOI-256 du panier" }));
    expect(document.activeElement).toBe(title.current);
    expect(getCartSnapshot().lines).toEqual([]);
  });

  it("retirer la dernière ligne quand la liste laisse place à l'état vide : focus sur le titre", async () => {
    const user = userEvent.setup();
    updateCart({ type: "clear" });
    updateCart({ type: "add", sku: "AP5-BLA" });
    render(<Harness unmountWhenEmpty />);
    await user.click(screen.getByRole("button", { name: "Retirer AP5-BLA du panier" }));
    expect(screen.getByText("Votre panier est vide.")).toBeTruthy();
    expect(document.activeElement).toBe(title.current);
  });

  it("annonce les quantités et les retraits dans une région montée vide", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("");
    await user.click(screen.getByRole("button", { name: "Augmenter la quantité de AP5-BLA" }));
    expect(status.textContent).toBe("Quantité de AP5-BLA : 2.");
    await user.click(screen.getByRole("button", { name: "Retirer AP5-BLA du panier" }));
    expect(status.textContent).toBe("AP5-BLA retiré du panier.");
  });

  it("suit les changements faits ailleurs (autre îlot)", () => {
    render(<Harness />);
    act(() => {
      updateCart({ type: "remove", sku: "AP5-BLA" });
    });
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
