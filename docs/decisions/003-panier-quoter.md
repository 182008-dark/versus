# ADR 003 : panier local, devis serveur (`CartQuoter`) et passage à Supabase

- **Statut** : accepté pour le catalogue statique ; le passage à Supabase reste à faire (étape 4)
- **Date** : 18 novembre 2026 (étape 5 avancée sur la branche `panier`)
- **Référence** : `docs/PLAN.md`, §1.2 (principes), §5.6 et §5.8 (« le serveur fait foi »), §6
  étapes 4 et 5 ; refonte, règle 4 de la direction

## Contexte

L'utilisateur a demandé un panier avant l'étape 4 (base Supabase). Le plan prévoit, à l'étape 5,
un `CartProvider` (contexte React avec un drapeau `hydrated`), un tiroir mini-panier, une page
`/panier` et un recalcul par la RPC `quote_cart(p_items jsonb, p_zone_code text)`. La base n'existe
pas encore : le catalogue est statique (`src/data/catalog.ts`).

Il fallait donc :

1. que le navigateur n'envoie que des SKU et des quantités, et que tout montant vienne du serveur ;
2. pouvoir remplacer le calcul statique par la RPC sans toucher aux composants ;
3. tenir le budget de 150 Ko de JavaScript sur `/` et une fiche, alors que l'icône du panier est
   sur chaque page.

## Décisions

### 1. Une interface unique, au contrat de `quote_cart`

`src/lib/cart/quote.ts` décrit le devis exactement comme la RPC le renverra (`snake_case`,
montants `_fcfa` entiers, `issues` par ligne : `unavailable`, `insufficient_stock`, `qty_capped`,
`price_changed`) et l'interface `CartQuoter` : `quote(items, zoneCode)` et `listZones()`.

- Aujourd'hui : `staticCartQuoter` (`static-quoter.ts`) appelle `computeQuote()` sur le catalogue
  statique et lit les zones de `config/policies.ts` (décision D6).
- À l'étape 4 : un adaptateur appellera `supabase.rpc("quote_cart", …)` et lira la table
  `delivery_zones`. **Seul `src/lib/cart/quoter.ts` change** : la Server Action `priceCart`, la
  page `/panier` (zones lues côté serveur par `getDeliveryZones()` → `listZones()`) et les
  composants restent identiques.
- `computeQuote()` reste la référence testée du calcul ; les tests de la RPC (pgTAP) reprendront
  ses cas.
- Champs d'affichage du contrat, lus par la même requête : `zone_label` et `eta_label`
  (`delivery_zones`), pour que le tiroir et la page disent la même chose sous « Livraison »
  (« Lomé et environs · 24 à 48 h ») ; `color_hex` par ligne (`product_variants`), montré en
  pastille sur la vignette tant que la photo est celle du produit et non celle du coloris (une
  photo par variante viendra de `product_images.variant_id`).

### 2. Le serveur fait foi

- Entrée de `priceCart` validée par zod en mode strict (`schema.ts`) : un prix envoyé fait refuser
  la requête (`VS_INVALID`). Erreurs traduites par `quoteErrorMessage()`.
- Le navigateur applique les corrections du devis (ligne retirée, quantité ramenée au stock) et les
  explique (`quoteCorrections()`).
- La Server Action ajoute, hors contrat de la RPC, l'adresse de la fiche et la vignette optimisée
  de chaque ligne (`media`, via `productHref()` et `getImageProps()`) : ni la table des routes ni
  l'optimiseur d'images ne partent dans le JavaScript de la page panier.

### 3. Un magasin module plutôt qu'un `CartProvider` (écart au plan, §6 étape 5)

Le panier vit dans `localStorage` (`versus.cart.v1`, versionné, réparé à la relecture, synchronisé
entre onglets par l'évènement `storage`) et dans un module (`cart-store.ts`) lu par
`useSyncExternalStore` (`use-cart.ts`), au lieu d'un contexte React :

- aucun fournisseur client à placer autour de tout le site : seuls les îlots qui lisent le panier
  (icône de l'en-tête, bouton d'ajout de la fiche, page panier, tiroir) chargent ce code ;
- l'instantané serveur vaut `null` : le premier rendu est identique au serveur et à l'hydratation,
  le stockage n'est lu qu'ensuite. C'est le rôle du drapeau `hydrated` du plan, sans état
  supplémentaire ;
- validation écrite à la main (`storage.ts`, `sku.ts`) plutôt qu'avec zod dans le navigateur, pour
  le budget JavaScript ; zod valide côté serveur.

### 4. Aucune commande ni paiement

La route `commande` est déclarée dans `plannedRoutes` mais non livrée : `routeFor("commande")`
renvoie `null`, le récapitulatif affiche « La commande simulée arrive bientôt » à la place du
bouton « Commander ».

## Conséquences

- Le tiroir est chargé à la demande (survol, focus ou premier clic de l'icône).
- Le JavaScript de `/` et des fiches reste sous 150 Ko (152 592 octets mesurés). Celui de
  `/panier` le dépasse (environ 156,6 Ko) : le plan ne fixe pas de seuil pour cette page, la mesure
  est suivie dans `docs/audits/budget.md`.
- Au passage à Supabase : remplacer l'implémentation de `quoter.ts`, garder `computeQuote()` comme
  oracle de tests, et vérifier que `delivery_zones` renvoie les mêmes six zones que
  `deliveryZoneOptions`.
