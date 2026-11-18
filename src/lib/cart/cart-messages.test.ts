import { describe, expect, it } from "vitest";
import {
  articles,
  issueMessage,
  lineName,
  noticeMessage,
  quoteCorrections,
  quoteErrorMessage,
} from "./cart-messages";
import { formatFCFA } from "@/lib/format/fcfa";
import type { CartQuote, CartQuoteLine } from "./quote";

function line(overrides: Partial<CartQuoteLine>): CartQuoteLine {
  return {
    sku: "IP18-BOR-512",
    name: "iPhone 18 Pro",
    slug: "iphone-18-pro",
    variant_label: "Bordeaux · 512 Go",
    brand_slug: "apple",
    visual_kind: "phone",
    color_hex: null,
    image_src: null,
    image_width: null,
    image_height: null,
    qty: 1,
    stock: 18,
    price_fcfa: 1_134_000,
    line_total_fcfa: 1_134_000,
    issues: [],
    ...overrides,
  };
}

function quote(lines: CartQuoteLine[]): CartQuote {
  return {
    lines,
    subtotal_fcfa: 0,
    delivery_fee_fcfa: 0,
    total_fcfa: 0,
    zone_code: null,
    zone_label: null,
    eta_label: null,
    valid: false,
  };
}

describe("quoteCorrections", () => {
  it("retire une variante indisponible et l'explique", () => {
    const { actions, messages } = quoteCorrections(
      quote([line({ sku: "X-1", issues: ["unavailable"], name: "X-1", variant_label: null })]),
    );
    expect(actions).toEqual([{ type: "remove", sku: "X-1" }]);
    expect(messages).toEqual(["X-1 n'est plus disponible : retiré du panier."]);
  });

  it("retire une variante épuisée, ramène une quantité au stock restant", () => {
    const { actions, messages } = quoteCorrections(
      quote([
        line({ sku: "IP18-BOR-256", stock: 0, issues: ["insufficient_stock"] }),
        line({ qty: 4, stock: 2, issues: ["insufficient_stock"] }),
      ]),
    );
    expect(actions).toEqual([
      { type: "remove", sku: "IP18-BOR-256" },
      { type: "setQty", sku: "IP18-BOR-512", qty: 2, max: 2 },
    ]);
    expect(messages[1]).toBe(
      "Stock limité : quantité de iPhone 18 Pro (Bordeaux · 512 Go) ramenée à 2.",
    );
  });

  it("ne corrige rien sur un devis sans écart bloquant", () => {
    expect(quoteCorrections(quote([line({}), line({ issues: ["price_changed"] })]))).toEqual({
      actions: [],
      messages: [],
    });
  });
});

describe("messages", () => {
  it("nomme la ligne avec sa variante", () => {
    expect(lineName(line({}))).toBe("iPhone 18 Pro (Bordeaux · 512 Go)");
    expect(lineName(line({ variant_label: null }))).toBe("iPhone 18 Pro");
  });

  it("explique un plafond ou un prix changé", () => {
    expect(issueMessage(line({ qty: 5, issues: ["qty_capped"] }))).toBe(
      "Quantité limitée à 5 par article.",
    );
    expect(issueMessage(line({ issues: ["price_changed"] }))).toBe(
      `Le prix a changé : ${formatFCFA(1_134_000)} l'unité.`,
    );
    expect(issueMessage(line({}))).toBeNull();
  });

  it("couvre chaque avertissement de stockage et chaque erreur", () => {
    for (const notice of ["repaired", "reset", "quota", "unavailable"] as const) {
      expect(noticeMessage(notice)).toMatch(/panier/);
    }
    for (const code of ["VS_INVALID", "VS_INVALID_ZONE", "VS_UNAVAILABLE"] as const) {
      expect(quoteErrorMessage(code).length).toBeGreaterThan(10);
    }
  });

  it("accorde « article »", () => {
    expect(articles(1)).toBe("1 article");
    expect(articles(3)).toBe("3 articles");
  });
});
