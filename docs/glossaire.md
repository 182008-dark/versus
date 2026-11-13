# Glossaire : interface (FR) ↔ code (EN)

L'interface, les URL, les commentaires et la documentation sont en français ; les identifiants de
code et de base sont en anglais (`camelCase` en TypeScript, `snake_case` en SQL).

| Interface (FR)              | Code (EN)                     | Remarque                                   |
| --------------------------- | ----------------------------- | ------------------------------------------ |
| boutique, catalogue         | `catalog`                     | `/boutique`                                |
| produit                     | `product`                     | `/produit/[slug]`                          |
| variante                    | `variant`                     | couleur, stockage, taille                  |
| référence                   | `sku`                         | identifiant d'une variante                 |
| catégorie                   | `category`                    | smartphones, écouteurs, montres, bracelets |
| marque                      | `brand`                       | Apple, Samsung, Xiaomi                     |
| stock                       | `stock`                       | calculé en base                            |
| prix                        | `price_fcfa`                  | entier en FCFA, suffixe `_fcfa`            |
| panier                      | `cart`                        | `/panier`                                  |
| ligne de panier             | `cart line` / `CartLine`      |                                            |
| comparateur                 | `compare`                     | `/comparer`                                |
| aide au choix (quiz)        | `quiz`                        | `/aide-au-choix`                           |
| commande                    | `order`                       | `/commande`                                |
| numéro de commande          | `order number`                |                                            |
| paiement (simulé)           | `payment`                     | T-Money, Flooz, carte, à la livraison      |
| paiement à la livraison     | `cash on delivery` (`cod`)    |                                            |
| livraison                   | `delivery`                    | zones et frais                             |
| frais de livraison          | `delivery fee`                |                                            |
| suivi de commande           | `tracking`                    | `/suivi`                                   |
| invité                      | `guest`                       | commande sans compte                       |
| jeton invité                | `guest token`                 | stocké haché                               |
| compte                      | `account`                     | `/compte`                                  |
| client                      | `customer`                    |                                            |
| adresse                     | `address`                     |                                            |
| profil                      | `profile`                     |                                            |
| administration, back-office | `admin`                       | `/admin`                                   |
| nouveauté                   | `new` (`isNew`)               | badge « Nouveau »                          |
| mise en avant de l'accueil  | `home slot`                   | `home_slots`                               |
| mentions légales            | `legal notice`                | `/mentions-legales`                        |
| crédits                     | `credits`                     | `/credits`                                 |
| bandeau (site fictif)       | `announcement bar` / `notice` |                                            |
| lien d'évitement            | `skip link`                   | `SkipLink`                                 |
| contenu principal           | `main content`                | `<main id="contenu">`                      |
