import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Les visuels produits font au plus 900 px de côté (public/products/SOURCES.md) ; les
    // emplacements les plus grands (fiche produit) n'affichent pas plus de 520 px de haut, et
    // chaque largeur de plus alourdirait le srcset du HTML.
    deviceSizes: [384, 480, 640],
    imageSizes: [128, 192, 256],
    qualities: [75],
  },
  // Noms officiels Samsung (refonte, lot 1) : les anciennes adresses restent valides.
  async redirects() {
    return [
      {
        source: "/produit/galaxy-buds-4",
        destination: "/produit/galaxy-buds4",
        permanent: true,
      },
      {
        source: "/produit/galaxy-watch-9",
        destination: "/produit/galaxy-watch9",
        permanent: true,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
