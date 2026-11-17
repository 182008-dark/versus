/** Petit tableau « token · valeur · usage » du styleguide. */
export function TokensTable({
  caption,
  rows,
}: {
  caption: string;
  rows: readonly (readonly [string, string, string])[];
}) {
  return (
    <table className="mt-3 w-full border-collapse text-left text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">Token</th>
          <th scope="col">Valeur</th>
          <th scope="col">Usage</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([token, value, usage]) => (
          <tr key={token} className="border-b border-line-soft last:border-0">
            <th scope="row" className="py-2 pr-3 align-top font-normal">
              <code className="font-semibold">{token}</code>
            </th>
            <td className="py-2 pr-3 align-top tabular-nums">{value}</td>
            <td className="py-2 align-top text-muted">{usage}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
