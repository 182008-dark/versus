import { formatFCFA } from "@/lib/format/fcfa";
import type { CartAction } from "./cart-reducer";
import type { CartNotice } from "./cart-store";
import type { CartQuote, CartQuoteLine, PriceCartResult } from "./quote";

/**
 * Textes du panier (écarts du devis, stockage, erreurs) et corrections à appliquer après un devis.
 * Fonctions pures, testées : les composants ne font qu'afficher.
 */

/** « iPhone 18 Pro (Bordeaux · 512 Go) » */
export function lineName(line: Pick<CartQuoteLine, "name" | "variant_label">): string {
  return line.variant_label ? `${line.name} (${line.variant_label})` : line.name;
}

/** Écart d'une ligne encore présente au panier (prix changé, quantité plafonnée). */
export function issueMessage(line: CartQuoteLine): string | null {
  if (line.issues.includes("qty_capped")) {
    return `Quantité limitée à ${line.qty} par article.`;
  }
  if (line.issues.includes("price_changed") && line.price_fcfa !== null) {
    return `Le prix a changé : ${formatFCFA(line.price_fcfa)} l'unité.`;
  }
  return null;
}

export type QuoteCorrection = { actions: CartAction[]; messages: string[] };

/**
 * Le serveur fait foi : une variante indisponible ou épuisée est retirée, une quantité au-delà du
 * stock est ramenée au stock. Chaque correction est expliquée par un message (critère de
 * l'étape 5 : « une variante désactivée est signalée et retirée »).
 */
export function quoteCorrections(quote: CartQuote): QuoteCorrection {
  const actions: CartAction[] = [];
  const messages: string[] = [];
  for (const line of quote.lines) {
    const name = lineName(line);
    if (line.issues.includes("unavailable")) {
      actions.push({ type: "remove", sku: line.sku });
      messages.push(`${name} n'est plus disponible : retiré du panier.`);
    } else if (line.issues.includes("insufficient_stock")) {
      if (line.stock <= 0) {
        actions.push({ type: "remove", sku: line.sku });
        messages.push(`${name} est en rupture de stock : retiré du panier.`);
      } else {
        actions.push({ type: "setQty", sku: line.sku, qty: line.stock, max: line.stock });
        messages.push(`Stock limité : quantité de ${name} ramenée à ${line.stock}.`);
      }
    }
  }
  return { actions, messages };
}

/** Avertissement sur le stockage local. */
export function noticeMessage(notice: CartNotice): string {
  switch (notice) {
    case "repaired":
      return "Une partie du panier enregistré était illisible : elle a été retirée.";
    case "reset":
      return "Le panier enregistré était illisible : il a été vidé.";
    case "quota":
      return "Le stockage de ce navigateur est plein : le panier ne sera pas conservé.";
    case "unavailable":
      return "Ce navigateur bloque le stockage local : le panier sera perdu en quittant le site.";
  }
}

/** Erreur du calcul (Server Action) traduite pour l'interface. */
export function quoteErrorMessage(code: Extract<PriceCartResult, { ok: false }>["code"]): string {
  switch (code) {
    case "VS_INVALID":
      return "Le panier contient des données invalides. Videz-le puis ajoutez de nouveau vos articles.";
    case "VS_INVALID_ZONE":
      return "Cette zone de livraison n'est pas desservie. Choisissez-en une autre.";
    case "VS_UNAVAILABLE":
      return "Le calcul du panier est momentanément indisponible.";
  }
}

/** « 3 articles » */
export function articles(count: number): string {
  return `${count} article${count > 1 ? "s" : ""}`;
}
