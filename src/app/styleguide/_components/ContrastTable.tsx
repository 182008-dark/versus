export type ContrastRow = {
  usage: string;
  fg: string;
  bg: string;
  /** Tokens de la paire, ex. « --accent-ink / --surface ». */
  label: string;
  ratio: string;
  level: string;
  /** Élément non textuel (contour, anneau, pastille) : aperçu sans texte. */
  nonText?: boolean;
};

/** Tableau de contrastes du styleguide : aperçu, tokens, ratio calculé et niveau WCAG. */
export function ContrastTable({ caption, rows }: { caption: string; rows: ContrastRow[] }) {
  return (
    <table className="w-full min-w-[640px] border-collapse text-left text-sm">
      <caption className="sr-only">{caption}</caption>
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
        {rows.map((row) => (
          <tr key={row.usage} className="border-b border-line-soft">
            <th scope="row" className="py-2 pr-4 font-normal">
              {row.usage}
            </th>
            <td className="py-2 pr-4">
              {row.nonText ? (
                <span
                  className="inline-grid h-9 w-14 place-items-center rounded-control border border-line-soft"
                  style={{ background: row.bg }}
                  aria-hidden="true"
                >
                  <span className="size-5 rounded-full border-2" style={{ borderColor: row.fg }} />
                </span>
              ) : (
                <span
                  className="inline-grid h-9 w-14 place-items-center rounded-control border border-line-soft font-semibold"
                  style={{ color: row.fg, background: row.bg }}
                  aria-hidden="true"
                >
                  Aa
                </span>
              )}
            </td>
            <td className="py-2 pr-4">
              <code>{row.label}</code>
            </td>
            <td className="py-2 pr-4 font-semibold tabular-nums">{row.ratio}</td>
            <td className="py-2">{row.level}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
