import { site } from "@/config/site";

/**
 * Moyens de paiement présentés dans le pied de page (maquette : `.pay`). Tous sont simulés :
 * aucun champ de carte, aucun code PIN, aucun encaissement (principe 7).
 */
export function PaymentBadges() {
  return (
    <ul aria-label="Moyens de paiement (simulés)" className="mt-[18px] flex flex-wrap gap-1.5">
      {site.payments.map((payment) => (
        <li
          key={payment}
          className="rounded-chip border border-line bg-white px-2.5 py-1.5 text-xs leading-[normal] font-semibold text-ink"
        >
          {payment}
        </li>
      ))}
    </ul>
  );
}
