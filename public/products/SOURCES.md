# Sources des visuels produits

Visuels officiels des marques (visuels © leurs fabricants : Apple, Samsung, Xiaomi), copiés sur le
site pour un projet pédagogique non commercial, non indexé. Aucun logo ni police de marque. Retrait
immédiat sur simple demande. La page `/credits` reprend ce tableau (`src/data/product-visuals.ts`).

## Traitement commun (17/11/2026)

Script `sharp` exécuté hors du dépôt, sur des copies téléchargées dans un dossier temporaire dédié :

1. conversion en RGBA (les PNG à palette de mi.com sont convertis) ;
2. fond blanc retiré quand la source n'est pas détourée (`awu4`, `awse3`, `aw12`) : zones quasi blanches
   reliées aux bords ou assez grandes pour être un trou du bracelet, bord adouci ;
3. recadrage sur le produit (alpha > 8), puis marge transparente de 4 % du plus grand côté sur
   les quatre bords : produit centré, même marge relative pour les 30 fichiers ;
4. 900 px au plus de côté (jamais agrandi) ;
5. PNG à palette si l'écart reste invisible (PSNR ≥ 40 dB), sinon PNG 24 bits ; réduction par
   paliers de 100 px tant que le fichier dépasse 195 Ko.

Les neuf visuels de l'étape 3 (téléchargés le 12/11/2026) ont été retraités de la même façon.

## Apple (apple.com)

| Fichier | Produit | Source | Téléchargé le |
|---|---|---|---|
| ipd.png | iPhone Duo (blanc stellaire) | store.storeimages.cdn-apple.com — `iphone-compare-iphone-duo-202609` (page apple.com/fr/shop/buy-iphone, comparateur) | 17/11/2026 |
| ip18.png | iPhone 18 Pro (bordeaux) | store.storeimages.cdn-apple.com — `iphone-18-pro-finish-select-202609-6-3inch-burgundy` (page apple.com/fr/shop/buy-iphone/iphone-18-pro), fond gris retiré | 12/11/2026 |
| ip17.png | iPhone 17 (lavande) | store.storeimages.cdn-apple.com — `iphone-compare-iphone-17-202609` (page apple.com/fr/shop/buy-iphone/iphone-17) | 17/11/2026 |
| ip17e.png | iPhone 17e (rose pastel) | store.storeimages.cdn-apple.com — `iphone-compare-iphone-17e-202609` (page apple.com/fr/shop/buy-iphone/iphone-17e) | 17/11/2026 |
| apm2.png | AirPods Max 2 (minuit) | www.apple.com — `/v/airpods/af/images/overview/airpods_max_black__x3byrd2venmu_large_2x.png` (page apple.com/fr/airpods), version 2x du visuel retenu | 17/11/2026 |
| app3.png | AirPods Pro 3 | store.storeimages.cdn-apple.com — `airpods-pro-3-hero-select-202509` (page apple.com/fr/shop/buy-airpods/airpods-pro-3) | 17/11/2026 |
| ap5.png | AirPods 5 | store.storeimages.cdn-apple.com — `airpods-5-hero-select-202609` (page apple.com/fr/shop/buy-airpods/airpods-5) | 12/11/2026 |
| awu4.png | Apple Watch Ultra 4 (titane naturel, bracelet Océan) | store.storeimages.cdn-apple.com — `watch-compare-ultra-4-202609_GEO_FR` (page apple.com/fr/shop/buy-watch/apple-watch-ultra), fond blanc retiré | 17/11/2026 |
| aw12.png | Apple Watch Series 12 (aluminium bronze sombre, bracelet sport kaki) | store.storeimages.cdn-apple.com — `watch-compare-series-12-202609_GEO_FR` (page apple.com/fr/shop/buy-watch/apple-watch), fond blanc retiré | 17/11/2026 |
| awse3.png | Apple Watch SE 3 (lumière stellaire) | store.storeimages.cdn-apple.com — `watch-compare-se-3-202609_GEO_FR` (page apple.com/fr/shop/buy-watch/apple-watch-se), fond blanc retiré | 17/11/2026 |

## Samsung (samsung.com)

Visuels de galerie `images.samsung.com/is/image/samsung/p6pim/…`, demandés avec le préréglage
haute définition `$Q90_1368_1094_F_PNG$` (même image que le préréglage `$684_547_PNG$`, où le
produit ne faisait que 178 à 360 px de haut).

| Fichier | Produit | Source | Téléchargé le |
|---|---|---|---|
| zf8.png | Galaxy Z Fold8 (lavande) | `fr/f2607/gallery/fr-galaxy-z-fold8-f971-sm-f971blvbeub-thumb-553805006` (page samsung.com/fr/smartphones/galaxy-z-fold8/buy) | 17/11/2026 |
| s26u.png | Galaxy S26 Ultra (violet) | `fr/s2602/gallery/fr-galaxy-s26-ultra-s948-sm-s948bzvdeub-thumb-550858460` (page samsung.com/fr/smartphones/galaxy-s26-ultra/buy) | 17/11/2026 |
| zfl8.png | Galaxy Z Flip8 (rose) | `fr/f2607/gallery/fr-galaxy-zflip8-f776-sm-f776bligeub-thumb-553805932` (page samsung.com/fr/smartphones/galaxy-z-flip8/buy) | 17/11/2026 |
| s26.png | Galaxy S26 (violet) | `fr/s2602/gallery/fr-galaxy-s26-s942-sm-s942bzvgeub-thumb-550923094` (page samsung.com/fr/smartphones/galaxy-s26/buy) | 17/11/2026 |
| a57.png | Galaxy A57 5G (bleu clair) | images.samsung.com — `260320_a57_icyblue_color-section_buypage_1600x864px.png` (page samsung.com/fr/…/galaxy-a57-5g/buy), recadré sur 2 vues | 12/11/2026 |
| gb4p.png | Galaxy Buds4 Pro (noir) | `fr/s2602/gallery/fr-galaxy-buds4-r640-579870-sm-r640nzkaxef-thumb-551037965` (page samsung.com/fr/audio-sound/galaxy-buds/galaxy-buds4-pro-black-sm-r640nzkaxef) | 17/11/2026 |
| gb4.png | Galaxy Buds4 (blanc) | images.samsung.com — `be_fr/galaxy-buds4/buy/05_Color_Selection/Bach/Color_Selection_White_PC.png`, fond blanc retiré | 12/11/2026 |
| gwu2.png | Galaxy Watch Ultra2 (argent titane, bracelet sport vert) | `fr/f2607/gallery/fr-galaxy-watch-ultra2-l710-sm-l715fzsaeub-thumb-553808798` (page samsung.com/fr/watches/galaxy-watch/galaxy-watch-ultra2-titanium-silver-lte-sm-l715fzsaeub) | 17/11/2026 |
| gw9.png | Galaxy Watch9 (graphite) | images.samsung.com — `us/f2607/buypage/galaxy-watch9/designstudio/SM-L340NZK_ET-SNL34SB.png` (page samsung.com/us/watches/galaxy-watch9/buy) | 12/11/2026 |
| gf3.png | Galaxy Fit3 (gris) | `africa_fr/sm-r390nzaaxfa/gallery/africa-fr-galaxy-fit3-r390-sm-r390nzaaxfa-540082310` (page samsung.com/africa_fr/watches/galaxy-fit/galaxy-fit3-gray-bluetooth-sm-r390nzaaxfa) | 17/11/2026 |

## Xiaomi (mi.com)

| Fichier | Produit | Source | Téléchargé le |
|---|---|---|---|
| x17u.png | Xiaomi 17 Ultra (noir) | i05.appmifile.com — `130_item_fr/10/02/2026/ca8701fb….png` (page mi.com/fr/product/xiaomi-17-ultra) | 17/11/2026 |
| x17.png | Xiaomi 17 (noir) | i05.appmifile.com — `869_item_fr/10/02/2026/6fad1503….png` (page mi.com/fr/product/xiaomi-17) | 17/11/2026 |
| x17tp.png | Xiaomi 17T Pro (bleu) | i05.appmifile.com — `58_item_fr/20/05/2026/351dc878….png` (page mi.com/fr/product/xiaomi-17t-pro) | 17/11/2026 |
| rn15.png | Redmi Note 15 Pro+ 5G (noir et moka) | i02.appmifile.com — `200_operator_sg/19/01/2026/094fd0b7….png` (page mi.com/africa-en/product/redmi-note-15-pro-plus-5g/specs), recadré sur 2 coloris | 12/11/2026 |
| xb6.png | Xiaomi Buds 6 (violet nébuleux) | i05.appmifile.com — `426_item_fr/14/05/2026/a18be666….png` (page mi.com/fr/product/xiaomi-buds-6) | 17/11/2026 |
| rb8.png | Redmi Buds 8 (noir) | i05.appmifile.com — `159_item_fr/03/06/2026/ddc06d9e….png` (page mi.com/fr/product/redmi-buds-8) | 17/11/2026 |
| xws5.png | Xiaomi Watch S5 46 mm (noir) | i05.appmifile.com — `355_item_fr/12/05/2026/01c9bd9a….png` (page mi.com/fr/product/xiaomi-watch-s5-46mm) | 17/11/2026 |
| rw6.png | Redmi Watch 6 (noir) | i02.appmifile.com — `383_operator_sg/10/04/2026/c258c9fe….png` (page mi.com/global/product/redmi-watch-6/specs), recadré | 12/11/2026 |
| sb10p.png | Xiaomi Smart Band 10 Pro (noir) | i05.appmifile.com — `658_item_fr/19/05/2026/19b6d0a5….png` (page mi.com/fr/product/xiaomi-smart-band-10-pro) | 17/11/2026 |
| sb10.png | Xiaomi Smart Band 10 (gris) | i02.appmifile.com — `616_operator_sg/27/08/2025/29fc7b82….png` (page mi.com/africa-en/product/xiaomi-smart-band-10/specs), recadré | 12/11/2026 |

## Limites connues

- `ipd`, `ip17` et `ip17e` : le visuel « comparateur » d'Apple ne dépasse pas 260 × 322 px de
  produit (le serveur ne l'agrandit pas). Le visuel « finish-select » de la page d'achat est un
  gros plan, inutilisable ici. La fiche produit n'affiche donc jamais un visuel au-delà de sa
  taille intrinsèque en pixels CSS (`noUpscale` de `ProductVisual`) : sans cette limite, `ip17`
  (286 × 348) et `ip17e` (284 × 340) seraient agrandis d'environ 1,5 fois. Sur écran haute
  densité (DPR 2), le rendu reste moins net : la source manque de pixels.
- `sb10` : 129 × 339 px seulement (produit de 103 × 313 px). Dans le cadre « bracelet » de 120 px
  de large, un écran DPR 2 demande 240 px : rendu agrandi d'environ 1,9 fois, donc moins net.
- `aw12` : la tuile « comparateur » est un carré blanc opaque ; le blanc est retiré avec un bord
  adouci (fond blanc retiré, étape 2), sans liseré clair sur les fonds noirs (carte Apple, tuile
  `apple-night`).
- `gwu2` : le bracelet sport vert vient de la galerie officielle de la référence Argent titane ;
  la fiche affiche les boîtiers argent et noir titane.
