import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateCart } from "@/lib/cart/cart-store";
import { CartButton } from "./CartButton";

const navigation = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

beforeEach(() => {
  navigation.pathname = "/";
  window.localStorage.clear();
  updateCart({ type: "clear" });
});

describe("CartButton", () => {
  it("nomme le bouton « Panier » sans pastille quand le panier est vide", () => {
    render(<CartButton href="/panier" shopHref="/boutique" icon={null} />);
    const button = screen.getByRole("button", { name: "Panier" });
    expect(button.getAttribute("aria-haspopup")).toBe("dialog");
    expect(button.querySelector(".anim-bump")).toBeNull();
  });

  it("annonce « Panier, 3 articles » et affiche la pastille CountBadge (bump)", () => {
    updateCart({ type: "add", sku: "IP18-BOR-512", qty: 3 });
    render(<CartButton href="/panier" shopHref="/boutique" icon={null} />);
    const button = screen.getByRole("button", { name: "Panier, 3 articles" });
    const badge = button.querySelector(".anim-bump");
    expect(badge?.textContent).toBe("3");
    expect(badge?.getAttribute("aria-hidden")).toBe("true");
  });

  it("sur la page panier, est un lien vers la page courante, sans dialogue annoncé", () => {
    navigation.pathname = "/panier";
    updateCart({ type: "add", sku: "IP18-BOR-512", qty: 2 });
    render(<CartButton href="/panier" shopHref="/boutique" icon={null} />);
    expect(screen.queryByRole("button")).toBeNull();
    const link = screen.getByRole("link", { name: "Panier, 2 articles" });
    expect(link.getAttribute("href")).toBe("/panier");
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(link.hasAttribute("aria-haspopup")).toBe(false);
    expect(link.hasAttribute("aria-expanded")).toBe(false);
    expect(link.querySelector(".anim-bump")?.textContent).toBe("2");
  });
});
