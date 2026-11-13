import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { styleguideEnabled } from "@/lib/env";
import { ButtonsSection } from "./_components/ButtonsSection";
import { ColorsSection } from "./_components/ColorsSection";
import { LayoutSection } from "./_components/LayoutSection";
import { LinksBadgesSection } from "./_components/LinksBadgesSection";
import { TypographySection } from "./_components/TypographySection";

export const metadata: Metadata = {
  title: "Design system",
  description: "Vitrine du design system VERSUS : tokens, contrastes mesurés et composants.",
};

const sections = [
  { id: "couleurs", label: "Couleurs" },
  { id: "typographie", label: "Typographie" },
  { id: "boutons", label: "Boutons" },
  { id: "liens-badges", label: "Liens et badges" },
  { id: "gabarit", label: "Gabarit et marques" },
];

/**
 * Vitrine du design system (§4.6). Hors gabarit de groupe : elle recompose le gabarit public
 * et déclare son <main id="contenu">. 404 en production (VERCEL_ENV, voir lib/env.ts) ; visible
 * en local, en preview et sous `next start`.
 */
export default function StyleguidePage() {
  if (!styleguideEnabled) notFound();

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main id="contenu" tabIndex={-1} className="flex-1 outline-none">
        <div className="wrap pt-16 pb-8">
          <Eyebrow>Design system</Eyebrow>
          <h1 className="mt-3 text-display-h2">Styleguide VERSUS</h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">
            Tokens en trois couches, contrastes mesurés par le calcul WCAG, et tous les états des
            composants. Page absente en production.
          </p>
          <nav aria-label="Sections du styleguide" className="mt-6">
            <ul className="flex flex-wrap gap-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm font-medium state-hover:border-ink"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <ColorsSection />
        <TypographySection />
        <ButtonsSection />
        <LinksBadgesSection />
        <LayoutSection />
      </main>
      <SiteFooter />
    </>
  );
}
