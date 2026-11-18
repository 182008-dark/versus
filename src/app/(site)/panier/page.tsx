import type { Metadata } from "next";
import { CartPage } from "@/components/cart/CartPage";
import { routeFor } from "@/config/site";
import { getDeliveryZones } from "@/lib/cart/delivery-zones";

export const metadata: Metadata = { title: "Panier", robots: { index: false, follow: false } };

/**
 * Page panier (PLAN §6, étape 5). Le contenu du panier vit dans le navigateur (SKU et
 * quantités) ; les zones de livraison sont lues ici, côté serveur, par `CartQuoter.listZones()`,
 * et les totaux recalculés par la Server Action `priceCart`. « Commander » reste masqué tant que
 * la route `commande` n'est pas livrée (`routeFor` → `null`).
 */
export default async function PanierPage() {
  const zones = await getDeliveryZones();
  return (
    <CartPage zones={zones} shopHref={routeFor("boutique")} orderHref={routeFor("commande")} />
  );
}
