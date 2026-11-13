# Fidélité à la maquette — étape 3

Référence : `Accueil VERSUS-html/Main.dc.html`, captures initiales dans `docs/maquette/captures/`.
Captures d'implémentation : `docs/maquette/implementation/{1440,390}/accueil.png`, générées par
`npm run capture:accueil` avec le site démarré.

| Section                     | Maquette                                                                         | Implémentation de l'étape 3                                                                                                                                | Statut                                                     |
| --------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Hero                        | Carrousel de trois produits, visuel produit, prix et CTA ; hauteur bureau 680 px | Trois diapositives Apple, Samsung et Xiaomi, prix et CTA fiche ; contrôles au clavier, pause hover/focus/onglet caché, sans autoplay sous mouvement réduit | Conforme à la structure ; contraste du thème Xiaomi adapté |
| Navigation catégories       | Six icônes menant aux sections                                                   | Quatre catégories vers les ancres de `/boutique` et « Comparer » vers `#comparer` ; quiz absent avant l'étape 5                                            | Écart validé D5                                            |
| Tuiles promotionnelles      | Une tuile iPhone, Galaxy A57 et quatre tuiles compactes                          | Tuile iPhone supprimée ; Galaxy A57 pleine largeur, autres produits en grille ; tous les CTA ouvrent une fiche                                             | Écart validé D5                                            |
| Section épinglée            | Section Smartphones épinglée sur 2 200 px                                        | Supprimée ; contenu essentiel repris dans la comparaison                                                                                                   | Écart validé D5                                            |
| Nouveautés                  | Filtres de marque et cartes en rail horizontal                                   | Rail filtrable avec boutons désactivés aux extrémités, cartes typées et prix FCFA                                                                          | Conforme, contrôles clavier                                |
| Univers de marque           | Trois cartes Apple, Samsung, Xiaomi                                              | Apple Watch, Galaxy Buds et Redmi Watch comme visuels ; cartes ouvrant la boutique                                                                         | Écart validé D5                                            |
| Comparateur d'accueil       | Sélection de famille avec tableau plus complet et CTA panier                     | Tableau accessible à six lignes, trois smartphones, CTA « Voir le produit » ; bouton panier prévu à l'étape 5                                              | Écart validé D5                                            |
| Quiz                        | Quiz interactif en plusieurs étapes                                              | Absent de l'accueil jusqu'à l'étape 5, conformément à la décision D5                                                                                       | Écart validé D5                                            |
| Réassurance et pied de page | Réassurance puis gabarit global                                                  | Réassurance pédagogique, mentions du caractère fictif, paiements simulés et liens livrés                                                                   | Conforme                                                   |

La hauteur de page à 1440 px, la répétition des visuels, les routes, les badges « Nouveau » et
l'accessibilité sont vérifiés par `e2e/accueil.spec.ts`. Le transfert total reste sous 1 Mo. Le
JavaScript de l'accueil atteint 175 328 octets, sous le plafond de 180 Ko (184 320 octets). Ce
plafond a été ajusté de 150 à 180 Ko après arbitrage afin de préserver les interactions de la page.
Les trois tests de `e2e/budget.spec.ts` passent : JavaScript de l'accueil et d'une fiche produit,
ainsi que le transfert total.
