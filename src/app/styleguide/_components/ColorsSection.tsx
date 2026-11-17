import { contrastPairs, primitives, semantic, tokenHex, translucent } from "@/data/design-tokens";
import { contrastRatio, formatRatio, wcagLevel } from "@/lib/color/contrast";
import { ScrollRegion } from "@/components/ui/ScrollRegion";
import { ContrastTable } from "./ContrastTable";
import { StyleguideSection } from "./StyleguideSection";

/** Résultat affiché d'une paire : le niveau WCAG est CALCULÉ, jamais écrit à la main. */
export function verdict(ratio: number, nonText?: boolean, largeText?: boolean) {
  if (nonText) return ratio >= 3 ? "Conforme (≥ 3:1, non textuel)" : "Insuffisant";
  return wcagLevel(ratio, { largeText });
}

export function ColorsSection() {
  const rows = contrastPairs.map((pair) => {
    const fg = tokenHex(pair.fg);
    const bg = tokenHex(pair.bg);
    const ratio = contrastRatio(fg, bg);
    return {
      usage: pair.usage,
      fg,
      bg,
      label: `--${pair.fg} / --${pair.bg}`,
      ratio: formatRatio(ratio),
      level: verdict(ratio, pair.nonText, pair.largeText),
      nonText: pair.nonText,
    };
  });

  return (
    <StyleguideSection
      id="couleurs"
      eyebrow="1. Couleurs"
      title="Gris pierre, vert VERSUS et contrastes"
      intro={
        <p>
          Gris légèrement verdis (refonte, lot 2), une seule couleur d&apos;action : le vert VERSUS
          (décision D1, ADR 002). Tout texte vert posé sur un gris clair passe en vert foncé{" "}
          <code>--accent-ink</code>. Les composants n&apos;utilisent que les rôles. Ratios calculés
          par <code>contrastRatio()</code> à partir des tokens, verrouillés par un test.
        </p>
      }
    >
      <h3 className="text-xl font-bold">Primitives</h3>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {Object.entries(primitives).map(([name, hex]) => (
          <li key={name} className="overflow-hidden rounded-control border border-line-soft">
            <span className="block h-14" style={{ background: hex }} />
            <span className="block px-3 py-2 text-xs">
              <code className="font-semibold">--{name}</code>
              <br />
              <span className="text-muted">{hex}</span>
            </span>
          </li>
        ))}
      </ul>

      <h3 className="mt-10 text-xl font-bold">Rôles sémantiques</h3>
      <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(semantic).map(([token, primitive]) => (
          <li key={token} className="flex items-center gap-3 text-sm">
            <span
              className="size-8 shrink-0 rounded-full border border-line-soft"
              style={{ background: tokenHex(token as keyof typeof semantic) }}
            />
            <span>
              <code className="font-semibold">--{token}</code>{" "}
              <span className="text-muted">→ --{primitive}</span>
            </span>
          </li>
        ))}
        {Object.entries(translucent).map(([token, value]) => (
          <li key={token} className="flex items-center gap-3 text-sm">
            <span
              className="size-8 shrink-0 rounded-full border border-line-soft"
              style={{ background: value }}
            />
            <span>
              <code className="font-semibold">--{token}</code>{" "}
              <span className="text-muted">{value}</span>
            </span>
          </li>
        ))}
      </ul>

      <h3 className="mt-10 text-xl font-bold">Contrastes mesurés (WCAG 2.2)</h3>
      <p className="mt-2 max-w-3xl text-sm text-muted">
        Toutes les paires texte / fond employées par l&apos;interface. Le vert VERSUS n&apos;atteint
        que {formatRatio(contrastRatio(tokenHex("accent"), tokenHex("surface-hover")))} sur le gris
        de survol : texte vert sur gris = vert foncé. <code>--line-control</code> se pose sur un
        fond blanc ({formatRatio(contrastRatio(tokenHex("line-control"), tokenHex("bg")))}), pas sur
        la surface grise (
        {formatRatio(contrastRatio(tokenHex("line-control"), tokenHex("surface")))}).
      </p>
      <ScrollRegion label="Ratios de contraste des paires de couleurs du site" className="mt-4">
        <ContrastTable caption="Ratios de contraste des paires de couleurs du site" rows={rows} />
      </ScrollRegion>
    </StyleguideSection>
  );
}
