import { formatFCFA } from "@/lib/format/fcfa";

/** Prix en FCFA, toujours formaté par le formateur canonique du projet. */
export function Price({
  amount,
  prefix,
  className,
}: {
  amount: number;
  prefix?: string;
  className?: string;
}) {
  return (
    <span className={className}>
      {prefix ? `${prefix} ` : ""}
      {formatFCFA(amount)}
    </span>
  );
}
