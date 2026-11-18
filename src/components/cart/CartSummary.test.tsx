import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { deliveryZoneOptions } from "@/config/policies";
import { products } from "@/data/catalog";
import { computeQuote, quoteSourceFromCatalog } from "@/lib/cart/compute-quote";
import { CartSummary } from "./CartSummary";
import { LineThumb } from "./LineThumb";

const source = quoteSourceFromCatalog(products, deliveryZoneOptions);

describe("CartSummary", () => {
  it("nomme la zone et son délai sous « Livraison », sans zone fournie par l'appelant", () => {
    const kara = deliveryZoneOptions.find((zone) => zone.code === "kara")!;
    const quote = computeQuote([{ sku: "AP5-BLA", qty: 2 }], "kara", source);
    // Le tiroir ne passe que le devis : la ligne vient du serveur, identique à la page.
    render(<CartSummary quote={quote} count={2} pending={false} />);
    expect(screen.getByText(`${kara.label} · ${kara.eta_label}`)).toBeTruthy();
  });

  it("garde « (n articles) » d'un seul tenant", () => {
    render(<CartSummary quote={null} count={2} pending={false} />);
    const count = screen.getByText("(2 articles)");
    expect(count.className).toContain("whitespace-nowrap");
  });
});

describe("LineThumb", () => {
  it("montre la pastille du coloris de la ligne, la photo étant celle du produit", () => {
    const quote = computeQuote([{ sku: "IP18-NOI-256", qty: 1 }], null, source);
    const line = quote.lines[0]!;
    const { container } = render(
      <LineThumb brand={line.brand_slug} media={undefined} swatch={line.color_hex} />,
    );
    const swatch = container.querySelector<HTMLElement>("[data-testid=pastille-coloris]");
    expect(swatch?.getAttribute("aria-hidden")).toBe("true");
    expect(swatch?.style.backgroundColor).toBe("rgb(41, 41, 45)");
  });
});
