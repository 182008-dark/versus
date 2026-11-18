import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CartSnapshot } from "@/lib/cart/cart-store";
import type { CartQuote, CartQuoteLine, PriceCartResult } from "@/lib/cart/quote";
import { QUOTE_DEBOUNCE_MS, useCartQuote } from "./use-cart-quote";

const priceCart = vi.fn<(input: unknown) => Promise<PriceCartResult>>();
vi.mock("@/server/actions/cart", () => ({ priceCart: (input: unknown) => priceCart(input) }));

function line(sku: string, qty: number, extra: Partial<CartQuoteLine> = {}): CartQuoteLine {
  return {
    sku,
    name: sku,
    slug: null,
    variant_label: null,
    brand_slug: null,
    visual_kind: null,
    image_src: null,
    image_width: null,
    image_height: null,
    qty,
    stock: 10,
    price_fcfa: 1000,
    line_total_fcfa: 1000 * qty,
    issues: [],
    ...extra,
  };
}

function quote(lines: CartQuoteLine[]): CartQuote {
  const subtotal = lines.reduce((sum, item) => sum + item.line_total_fcfa, 0);
  return {
    lines,
    subtotal_fcfa: subtotal,
    delivery_fee_fcfa: 0,
    total_fcfa: subtotal,
    zone_code: null,
    eta_label: null,
    valid: true,
  };
}

function cart(lines: { sku: string; qty: number }[]): CartSnapshot {
  return { lines, zone: null, count: lines.reduce((s, l) => s + l.qty, 0), notice: null };
}

/** Laisse passer le délai de regroupement et la réponse du serveur. */
async function settle() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(QUOTE_DEBOUNCE_MS + 10);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  priceCart.mockReset();
  priceCart.mockImplementation(async (input) => {
    const { lines } = input as { lines: { sku: string; qty: number }[] };
    return { ok: true, data: quote(lines.map((item) => line(item.sku, item.qty))), media: {} };
  });
});

afterEach(() => vi.useRealTimers());

describe("useCartQuote", () => {
  it("ne demande rien et n'affiche aucun total pour un panier vide", async () => {
    const { result } = renderHook(() => useCartQuote(cart([])));
    await settle();
    expect(priceCart).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({ quote: null, pending: false, error: null, count: 0 });
  });

  it("n'envoie que les SKU, les quantités et la zone", async () => {
    renderHook(() => useCartQuote(cart([{ sku: "IP18-BOR-512", qty: 2 }])));
    await settle();
    expect(priceCart).toHaveBeenCalledWith({
      lines: [{ sku: "IP18-BOR-512", qty: 2 }],
      zone: null,
    });
  });

  it("n'affiche jamais les anciens totaux d'un panier devenu vide", async () => {
    const { result, rerender } = renderHook((props) => useCartQuote(props), {
      initialProps: cart([{ sku: "IP18-BOR-512", qty: 1 }]),
    });
    await settle();
    expect(result.current.quote?.subtotal_fcfa).toBe(1000);
    rerender(cart([]));
    expect(result.current.quote).toBeNull();
    expect(result.current.pending).toBe(false);
  });

  it("regroupe les clics rapprochés en un seul devis et compte les articles du devis", async () => {
    const { result, rerender } = renderHook((props) => useCartQuote(props), {
      initialProps: cart([{ sku: "AP5-BLA", qty: 1 }]),
    });
    await settle();
    priceCart.mockClear();
    rerender(cart([{ sku: "AP5-BLA", qty: 2 }]));
    rerender(cart([{ sku: "AP5-BLA", qty: 3 }]));
    expect(result.current.pending).toBe(true);
    // Pendant le recalcul, l'ancien devis reste affiché (atténué).
    expect(result.current.quote?.subtotal_fcfa).toBe(1000);
    await settle();
    expect(priceCart).toHaveBeenCalledTimes(1);
    expect(result.current).toMatchObject({ pending: false, count: 3 });
  });

  it("applique et explique les corrections du serveur", async () => {
    priceCart.mockResolvedValueOnce({
      ok: true,
      data: quote([line("IP18-BOR-256", 1, { stock: 0, issues: ["insufficient_stock"] })]),
      media: {},
    });
    const { result } = renderHook(() => useCartQuote(cart([{ sku: "IP18-BOR-256", qty: 1 }])));
    await settle();
    expect(result.current.adjustments).toEqual([
      "IP18-BOR-256 est en rupture de stock : retiré du panier.",
    ]);
    act(() => result.current.clearAdjustments());
    expect(result.current.adjustments).toEqual([]);
  });

  it("expose le code d'erreur et permet de réessayer", async () => {
    priceCart.mockResolvedValueOnce({ ok: false, code: "VS_UNAVAILABLE" });
    const { result } = renderHook(() => useCartQuote(cart([{ sku: "AP5-BLA", qty: 1 }])));
    await settle();
    expect(result.current).toMatchObject({ error: "VS_UNAVAILABLE", quote: null });
    act(() => result.current.retry());
    expect(result.current.error).toBeNull();
    await settle();
    expect(result.current.quote?.subtotal_fcfa).toBe(1000);
  });
});
