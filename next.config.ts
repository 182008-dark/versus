import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Les visuels produits font au plus 618 px de large : l'optimiseur n'agrandit pas, toute
    // largeur au-delà de 640 px redonnerait le même fichier (et alourdirait le srcset du HTML).
    deviceSizes: [384, 480, 640],
    imageSizes: [128, 192, 256],
    qualities: [75],
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
