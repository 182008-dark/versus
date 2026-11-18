import { BrandMark } from "@/components/ui/BrandMark";
import { Price } from "@/components/ui/Price";
import { ScrollRegion } from "@/components/ui/ScrollRegion";
import { VsMark } from "@/components/ui/VsMark";
import { brandHref } from "@/config/site";
import { products } from "@/data/catalog";
import { tokenHex } from "@/data/design-tokens";
import { BRANDS, brandThemes, type Brand } from "@/lib/brand-themes";
import { contrastRatio, formatRatio } from "@/lib/color/contrast";
import { categoryLabel } from "@/lib/format/category";
import { formatSpec } from "@/lib/format/spec";
import { verdict } from "./ColorsSection";
import { ContrastTable, type ContrastRow } from "./ContrastTable";
import { StyleguideSection } from "./StyleguideSection";

/** Paires mesurées de chaque thème de marque (encre, texte secondaire, pastille décorative). */
function brandRows(brand: Brand): ContrastRow[] {
  const t = brandThemes[brand];
  const pairs = [
    {
      usage: "nom sur son fond pastel",
      fg: t.ink,
      bg: t.ground,
      label: "--brand-ink / --brand-ground",
    },
    {
      usage: "nom sur une carte blanche",
      fg: t.ink,
      bg: tokenHex("bg"),
      label: "--brand-ink / --bg",
    },
    {
      usage: "nom sur la surface grise",
      fg: t.ink,
      bg: tokenHex("surface"),
      label: "--brand-ink / --surface",
    },
    {
      usage: "texte secondaire sur le fond pastel",
      fg: tokenHex("muted"),
      bg: t.ground,
      label: "--muted / --brand-ground",
    },
    {
      usage: "« Dès » et « FCFA » sur le fond pastel",
      fg: tokenHex("muted-strong"),
      bg: t.ground,
      label: "--muted-strong / --brand-ground",
    },
  ];
  const rows: ContrastRow[] = pairs.map((pair) => {
    const ratio = contrastRatio(pair.fg, pair.bg);
    return {
      ...pair,
      usage: `${t.label} : ${pair.usage}`,
      ratio: formatRatio(ratio),
      level: verdict(ratio),
    };
  });
  const mark = contrastRatio(t.mark, tokenHex("bg"));
  rows.push({
    usage: `${t.label} : pastille et filet sur blanc (décoratifs, toujours avec le nom)`,
    fg: t.mark,
    bg: tokenHex("bg"),
    label: "--brand-mark / --bg",
    ratio: formatRatio(mark),
    level: "Décoratif (non mesuré pour AA)",
    nonText: true,
  });
  return rows;
}

const formats = [
  ['formatSpec(6.3, "″")', formatSpec(6.3, "″")],
  ['formatSpec(6.9, "mm")', formatSpec(6.9, "mm")],
  ['formatSpec(100, "W")', formatSpec(100, "W")],
  ['formatSpec(5000, "mAh")', formatSpec(5000, "mAh")],
  ['categoryLabel("ecouteurs")', categoryLabel("ecouteurs")],
] as const;

/** Prix des produits d'une marque, calculés à partir du catalogue (jamais écrits en dur). */
function brandPrices(brand: Brand): number[] {
  return products
    .filter((product) => product.brand_slug === brand)
    .flatMap((product) => (product.min_price_fcfa === null ? [] : [product.min_price_fcfa]));
}

export function BrandSection() {
  return (
    <StyleguideSection
      id="marques"
      eyebrow="5. Marques et signature"
      title="Thèmes de marque, pastille, médaillon VS et prix"
      intro={
        <p>
          Les couleurs des marques servent seulement à les reconnaître : fond pastel, pastille de 8
          px, filet de 3 px et nom. Jamais d&apos;aplat saturé, jamais d&apos;action. Aucun logo ni
          police de marque.
        </p>
      }
    >
      <ul className="grid gap-4 md:grid-cols-3">
        {BRANDS.map((brand) => (
          <li
            key={brand}
            data-brand={brand}
            className="flex flex-col gap-4 rounded-tile border-t-3 border-brand-mark bg-brand-ground p-6"
          >
            <BrandMark brand={brand} />
            <p className="text-display-tile text-brand-ink">{brandThemes[brand].label}</p>
            <p className="text-sm text-muted">Prix indicatifs, boutique fictive</p>
            <Price amount={brandPrices(brand)} size="card" />
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-card bg-surface-2 p-6">
          <h3 className="text-base font-bold">BrandMark · pastille + nom</h3>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            {BRANDS.map((brand) => (
              <BrandMark key={brand} brand={brand} />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            {BRANDS.map((brand) => (
              <BrandMark
                key={brand}
                brand={brand}
                size="lead"
                href={brandHref(brand) ?? undefined}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Taille « lead », en lien (cible de 44 px).</p>
        </div>
        <div className="rounded-card bg-surface-2 p-6">
          <h3 className="text-base font-bold">
            VsMark · médaillon de 44 px (masqué aux lecteurs d&apos;écran)
          </h3>
          <p className="mt-4 flex flex-wrap items-center gap-3 font-display text-xl font-bold">
            Apple <VsMark /> Samsung <VsMark /> Xiaomi
          </p>
          <p className="mt-4 flex items-center gap-2 text-sm font-semibold">
            Apple <VsMark size="sm" /> Samsung
            <span className="font-normal text-muted">· taille sm, 32 px</span>
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-card bg-surface-2 p-6">
          <h3 className="text-base font-bold">
            Price · « Dès » seulement s&apos;il y a plusieurs prix
          </h3>
          <dl className="mt-4 grid items-baseline gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-y-3">
            <dt className="text-muted">lead</dt>
            <dd>
              <Price amount={[970000, 1289000]} size="lead" />
            </dd>
            <dt className="text-muted">card</dt>
            <dd>
              <Price amount={[349000, 399000]} size="card" />
            </dd>
            <dt className="text-muted">inline, prix unique</dt>
            <dd>
              Garantie et livraison comprises : <Price amount={98000} />
            </dd>
          </dl>
        </div>
        <div className="rounded-card bg-surface-2 p-6">
          <h3 className="text-base font-bold">Formats français</h3>
          <dl className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-y-2">
            {formats.map(([call, result]) => (
              <div key={call} className="contents">
                <dt>
                  <code>{call}</code>
                </dt>
                <dd className="font-semibold">{result}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <h3 className="mt-10 text-xl font-bold">Contrastes des thèmes de marque</h3>
      <ScrollRegion label="Contrastes des thèmes de marque" className="mt-4">
        <ContrastTable
          caption="Contrastes des thèmes de marque"
          rows={BRANDS.flatMap((brand) => brandRows(brand))}
        />
      </ScrollRegion>
    </StyleguideSection>
  );
}
