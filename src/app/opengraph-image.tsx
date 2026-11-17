import { ImageResponse } from "next/og";

/**
 * Image de partage (Open Graph), générée au build. Le site est `noindex`, mais un lien partagé
 * (soutenance, messagerie) affiche ainsi la marque et le caractère fictif. Couleurs en
 * hexadécimal : ce fichier est dans la liste blanche de check-forbidden (§7.3), car ImageResponse
 * ne lit pas les variables CSS.
 */
export const alt = "VERSUS, boutique fictive Apple, Samsung et Xiaomi au Togo. Projet pédagogique.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "radial-gradient(120% 100% at 75% 55%, #4A1420 0%, #120507 45%, #000000 80%)",
        color: "#FFFFFF",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 88,
            height: 88,
            borderRadius: 22,
            background: "#1D1D1F",
            fontSize: 36,
            fontWeight: 800,
          }}
        >
          V<span style={{ color: "#3DDC97", margin: "0 2px" }}>/</span>S
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "0.18em" }}>VERSUS</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em" }}>
          Apple, Samsung et Xiaomi, côte à côte.
        </div>
        <div style={{ fontSize: 32, color: "#A1A1A6" }}>
          Projet pédagogique · Site fictif, aucune vente réelle · Prix indicatifs en FCFA
        </div>
      </div>
    </div>,
    size,
  );
}
