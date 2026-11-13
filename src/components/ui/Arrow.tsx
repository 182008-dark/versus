/**
 * Flèche « → » des liens fléchés (signature VERSUS, à la place du « › » de la maquette).
 * Elle se décale au survol ET au focus clavier du lien parent (règle `.vs-arrow` de
 * animations.css), uniquement sans mouvement réduit. Décorative : masquée aux lecteurs d'écran.
 */
export function Arrow() {
  return (
    <span aria-hidden="true" className="vs-arrow inline-block">
      →
    </span>
  );
}
