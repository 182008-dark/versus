/**
 * Quantité maximale d'une même variante dans le panier (`shop_settings.max_qty_per_line`, §5.5).
 * Le panier local la respecte, et le serveur la réapplique (`qty_capped`). Module à part (réexporté
 * par `policies.ts`) : le magasin du panier part dans le JavaScript de chaque page, et importer
 * `policies.ts` y ajouterait les zones et les frais de livraison.
 */
export const maxQuantityPerLine = 5;
