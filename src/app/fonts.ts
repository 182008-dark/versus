import { Inter, Plus_Jakarta_Sans } from "next/font/google";

/**
 * Polices auto-hébergées par next/font (§4.1), partagées par le layout racine et par
 * global-error.tsx (qui remplace le layout racine et doit donc les charger lui-même).
 */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const fontVariables = `${inter.variable} ${jakarta.variable}`;
