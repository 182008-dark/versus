import { contrastPairs, primitives, semantic, tokenHex } from "@/data/design-tokens";
import { contrastRatio, formatRatio, wcagLevel } from "@/lib/color/contrast";
import { StyleguideSection } from "./StyleguideSection";

/** Résultat affiché d'une paire : le niveau WCAG est CALCULÉ, jamais écrit à la main. */
function verdict(ratio: number, nonText?: boolean, largeText?: boolean) {
  if (nonText) return ratio >= 3 ? "Conforme (≥ 3:1, non textuel)" : "Insuffisant";
  return wcagLevel(ratio, { largeText });
}

export function ColorsSection() {
  return (
    <StyleguideSection
      id="couleurs"
      eyebrow="1. Couleurs"
      title="Primitives, rôles et contrastes"
      intro={
        <p>
          Les composants n&apos;utilisent que les rôles sémantiques. Accent VERSUS vert (décision
          D1, ADR 002) : les bleus de la maquette sont interdits. Ratios calculés par{" "}
          <code>contrastRatio()</code> (src/lib/color/contrast.ts) à partir des tokens.
        </p>
      }
    >
      <h3 className="text-xl font-bold">Primitives</h3>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {Object.entries(primitives).map(([name, hex]) => (
          <li key={name} className="overflow-hidden rounded-option border border-line-soft">
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
              className="size-8 shrink-0 rounded-chip border border-line-soft"
              style={{ background: tokenHex(token as keyof typeof semantic) }}
            />
            <span>
              <code className="font-semibold">--{token}</code>{" "}
              <span className="text-muted">→ --{primitive}</span>
            </span>
          </li>
        ))}
      </ul>

      <h3 className="mt-10 text-xl font-bold">Contrastes mesurés (WCAG 2.2)</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <caption className="sr-only">Ratios de contraste des paires de couleurs du site</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-2 pr-4 font-semibold">
                Usage
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                Aperçu
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                Texte / fond
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                Ratio
              </th>
              <th scope="col" className="py-2 font-semibold">
                Niveau
              </th>
            </tr>
          </thead>
          <tbody>
            {contrastPairs.map((pair) => {
              const fg = tokenHex(pair.fg);
              const bg = tokenHex(pair.bg);
              const ratio = contrastRatio(fg, bg);
              return (
                <tr key={pair.usage} className="border-b border-line-soft">
                  <th scope="row" className="py-2 pr-4 font-normal">
                    {pair.usage}
                  </th>
                  <td className="py-2 pr-4">
                    <span
                      className="inline-grid h-9 w-14 place-items-center rounded-chip border border-line-soft font-semibold"
                      style={{ color: fg, background: bg }}
                      aria-hidden="true"
                    >
                      Aa
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <code>--{pair.fg}</code> / <code>--{pair.bg}</code>
                  </td>
                  <td className="py-2 pr-4 font-semibold tabular-nums">{formatRatio(ratio)}</td>
                  <td className="py-2">{verdict(ratio, pair.nonText, pair.largeText)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </StyleguideSection>
  );
}
