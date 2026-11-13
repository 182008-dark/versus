import { Eyebrow } from "@/components/ui/Eyebrow";
import { site } from "@/config/site";

// Page d'accueil provisoire (étapes 1 et 2) : l'accueil fidèle à la maquette arrive à l'étape 3.
// Les liens d'information sont dans le pied de page du gabarit.
export default function HomePage() {
  return (
    <div className="wrap flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
      <Eyebrow>Apple · Samsung · Xiaomi</Eyebrow>
      <h1 className="text-display-hero">Bientôt en ligne</h1>
      <p className="max-w-xl text-[17px] leading-relaxed text-muted sm:text-[19px]">
        {site.tagline} Smartphones, écouteurs et montres, avec des prix indicatifs en FCFA pour le
        Togo.
      </p>
    </div>
  );
}
