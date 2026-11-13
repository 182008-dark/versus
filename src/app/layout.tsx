import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { SkipLink } from "@/components/ui/SkipLink";
import { site } from "@/config/site";
import { allowIndexing, siteUrl } from "@/lib/env";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} · Boutique fictive Apple, Samsung et Xiaomi`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  // Site fictif : aucune indexation tant que ALLOW_INDEXING !== "true" (ADR 006).
  robots: allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

// Aucun landmark ici : <main id="contenu"> est placé dans chaque gabarit de groupe.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
