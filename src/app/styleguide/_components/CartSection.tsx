import { CartSummary } from "@/components/cart/CartSummary";
import { deliveryZoneOptions } from "@/config/policies";
import type { CartQuote } from "@/lib/cart/quote";
import { DrawerDemo } from "./DrawerDemo";
import { QuantityStepperDemo } from "./QuantityStepperDemo";
import { StyleguideSection } from "./StyleguideSection";

/** Devis d'exemple (styleguide) : Lomé, sous le seuil de la livraison offerte. */
const sampleQuote: CartQuote = {
  lines: [],
  subtotal_fcfa: 196_000,
  delivery_fee_fcfa: 1_500,
  total_fcfa: 197_500,
  zone_code: "lome",
  eta_label: "24 à 48 h",
  valid: true,
};

/** Primitives du panier (étape 5) : tiroir, sélecteur de quantité, récapitulatif. */
export function CartSection() {
  return (
    <StyleguideSection
      id="panier"
      eyebrow="9. Panier"
      title="Tiroir, quantités et récapitulatif"
      intro="Primitives du panier : les montants viennent toujours du devis du serveur."
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-8">
          <div>
            <h3 className="mb-3 text-base font-bold">Drawer · tiroir latéral</h3>
            <DrawerDemo />
          </div>
          <div>
            <h3 className="mb-3 text-base font-bold">QuantityStepper · de 1 au stock</h3>
            <div className="flex flex-wrap gap-6">
              {[
                { label: "Borne basse (− inactif)", qty: 1 },
                { label: "Valeur courante", qty: 2 },
                { label: "Plafond atteint (+ inactif)", qty: 5 },
              ].map((state) => (
                <figure key={state.label} className="flex flex-col items-start gap-2">
                  <figcaption className="text-xs text-muted">{state.label}</figcaption>
                  <QuantityStepperDemo label={`l’exemple « ${state.label} »`} initial={state.qty} />
                </figure>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[360px] rounded-card border border-line-soft p-6">
          <h3 className="mb-5 text-lg font-bold">CartSummary · récapitulatif</h3>
          <CartSummary
            quote={sampleQuote}
            count={2}
            pending={false}
            zoneLabel={deliveryZoneOptions[0]!.label}
            zoneOption={deliveryZoneOptions[0]}
          />
        </div>
      </div>
    </StyleguideSection>
  );
}
