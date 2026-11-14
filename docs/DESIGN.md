# Design — Target 42

Statut : ✅ validé (2026-11-14, D24). Version du design system : **v2 « Corail »**. Remplace la v1 « Ardoise ».

- **Référence visuelle v2** : le prototype v0 (tag `v0-prototype`, écran `/`) affiné selon ce fichier, puis la page `/design` une fois migrée.
- Les artefacts v1 (design system « Ardoise » et canvas des maquettes) sont **obsolètes** jusqu'à leur mise à jour en v2.
- En cas de contradiction : **ce fichier fait foi pour le code**.

## 1. Intention

**Énergie course, claire et lisible.** Un fond crème, des cartes blanches, un seul accent corail et de grands chiffres condensés. Le matin sur le téléphone : en 10 secondes, on sait quoi faire, dans quel état on est, où on en est. Le soir sur le PC : un tableau de bord pour analyser le prévu contre le réalisé.

**Une seule app responsive** : mêmes données, mêmes composants, deux mises en page.

## 2. Principes

1. **Une carte = une question.** Un chiffre héros par carte.
2. **Une seule signature visuelle : le bandeau corail** (dégradé), et seulement sur Aujourd'hui. Ailleurs : pas de dégradé.
3. **Prévu et réalisé côte à côte.** Réalisé = corail plein (`done`). Prévu passé = aplat gris (`plan`) avec liseré (`plan-edge`). Prévu futur = pointillés `plan-edge`. Les écarts sont montrés, jamais cachés.
4. **La couleur a un sens.** `accent` = réalisé, action, sélection. `good` / `info` / `warn` / `alert` = état, **toujours avec un glyphe et un mot** (✓ Dans les clous, ↑ En avance, ! En retard, ✕ Non réalisée).
5. **Les chiffres en Barlow Condensed gras**, chiffres tabulaires. Le texte en Barlow.
6. **Ombres légères seulement** (`shadow-card`). Le flou est réservé aux barres collantes (en-tête, onglets).
7. **Pas d'emoji.** Les ressentis sont une échelle 1–5 nommée (le rendu des emoji varie selon le système et ils ne sont pas lisibles par les lecteurs d'écran).
8. **L'UI affiche, elle ne calcule pas** (ARCHITECTURE.md). Les composants reçoivent des valeurs déjà calculées par `engine/` et `planner/`, et déjà formatées par `lib/format.ts`.
9. **Données fictives marquées « démo »** tant que `engine/` ne les calcule pas (D16) : forme, prédiction.

## 3. Mises en page

| | Téléphone | PC |
|---|---|---|
| Largeur | < 768 px, référence **390 px** | ≥ 1024 px, référence 1280–1440 px, contenu ≤ **1152 px** centré |
| Usage | Quotidien : le matin, juste après une séance | Analyse : tableau de bord, calendrier, historique |
| Navigation | En-tête compact (56 px) + **barre d'onglets en bas** (64 px + safe-area) | En-tête collant (56 px) avec logo + **onglets en pilules** à droite |
| Grille | 1 colonne, marge `page-x` 16 px, écart 16 px | 6 colonnes (Aujourd'hui) ou 12 colonnes (autres écrans), marge 24 px, écart 20 px |
| Cartes | Padding 20 px | Padding 24 px |
| Interactions | Tap, cibles ≥ 44 px, saisie au pouce | Survol (info-bulles des graphiques), clavier |

Entre 768 et 1023 px (tablette, non ciblée), on applique la grille PC sur 2 colonnes.
Les points de rupture sont ceux de Tailwind : `md` = 768, `lg` = 1024.

**Navigation (5 destinations, même ordre partout)** : Aujourd'hui (`/`) · Plan (`/plan`) · Séances (`/seances`) · Journal (`/journal`) · Échéances (`/echeances`). Le coach (phase 3) sera accessible depuis Aujourd'hui, pas comme 6ᵉ onglet. Le tuteur voit les mêmes écrans, sans les actions d'écriture.

## 4. Tokens

Noms identiques dans le CSS (`--<nom>`) et Tailwind. On reprend les noms v1 avec de nouvelles valeurs. Les tokens marqués **+** sont nouveaux, ceux marqués **↺** sont renommés.

### Couleurs (thème clair unique, `color-scheme: light`)

| Token | Valeur | Usage | Contraste |
|---|---|---|---|
| `bg` | `#FAF7F3` | Fond de page (crème) | — |
| `surface` | `#FFFFFF` | Cartes | — |
| `surface-raised` | `#F4F0EB` | Tuiles dans une carte, champs, rail de progression | — |
| `track` | = `surface-raised` | Partie vide des barres et jauges | — |
| `line` | `#EBE5DE` | Bordures de cartes, filets, grille des graphiques | décoratif |
| `line-strong` | `#8A847E` | Contours porteurs de sens (champ, prévu futur) | 3,7:1 sur blanc |
| `text` | `#1C1917` | Texte, chiffres | 17,5:1 |
| `text-muted` | `#57534E` | Texte secondaire | 7,6:1 |
| **+** `text-subtle` | `#6F6862` | Libellés en capitales, unités, axes | 5,5:1 sur blanc, 4,8:1 sur `surface-raised` |
| `accent` | `#F2552C` | **Remplissages** : réalisé, barres, pastilles, logo. Jamais pour du petit texte | 3,4:1 (graphique ≥ 3:1) |
| **+** `accent-ink` | `#C2410C` | **Texte** accent, liens, fond du bouton principal, focus | 5,2:1 sur blanc, 4,6:1 sur `surface-raised` |
| `accent-hover` | `#A8360A` | Survol / appui du bouton principal | — |
| **+** `accent-soft` | `#FFEEE7` | Fond de tuile ou de badge accent | `accent-ink` dessus : 4,6:1 |
| `on-accent` | `#FFFFFF` | Texte sur `accent-ink` ou sur le bandeau (sur `accent` : ≥ 24 px ou icône seulement) | 5,2:1 sur `accent-ink` |
| `good` / **+** `good-soft` | `#137535` / `#E7F6EC` | ✓ Dans les clous, conforme | 5,2:1 sur soft |
| **+** `info` / `info-soft` | `#1D4ED8` / `#E8EEFC` | ↑ En avance | 5,8:1 sur soft |
| `warn` / **+** `warn-soft` | `#A84D08` / `#FDF1E2` | ! En retard, ✕ non réalisée, écart | 5,1:1 sur soft |
| `alert` / **+** `alert-soft` | `#B91C1C` / `#FDECEC` | Douleur ≥ 3/5, surcharge | 5,7:1 sur soft |
| `plan` | `#D6CFC7` | Aplat du prévu (passé) — toujours avec liseré `plan-edge` | — |
| **+** `plan-edge` | = `line-strong` | Liseré du prévu, pointillés du prévu futur | 3,7:1 |
| `done` | = `accent` | Le réalisé dans tous les graphiques | 3,4:1 |
| `focus-ring` | = `accent-ink` | Anneau de focus 2 px, décalage 2 px | — |
| **+** `hero-from` / `hero-to` | `#D04419` / `#A8360A` | Dégradé du bandeau (135°) | blanc dessus ≥ 4,6:1 |
| **+** `hero-tile` | `rgba(0,0,0,0.14)` | Tuiles dans le bandeau | blanc dessus ≥ 5,9:1 |

Changements par rapport au prototype, pour passer le niveau AA :
- `ink-3` `#78716C` → `text-subtle` `#6F6862` (était à 4,2:1 sur les tuiles) ;
- `good` `#15803D` → `#137535` et `warn` `#B45309` → `#A84D08` (étaient à 4,5:1 sur leur fond soft) ;
- `planned-edge` `#A8A29E` → `#8A847E` (était à 2,5:1) ;
- début du dégradé `#F2552C` → `#D04419` (le texte blanc était à 3,4:1) ;
- tuiles du bandeau `white/15` → `hero-tile` (2,9:1 → 5,9:1) ;
- bouton : texte blanc sur `accent-ink`, et non sur `accent` (3,4:1).

### Ombres (+)

- `shadow-card` : `0 1px 2px rgba(28,25,23,0.04)` (cartes)
- `shadow-hero` : `0 12px 32px -12px rgba(194,65,12,0.55)` (bandeau uniquement)
- `shadow-pop` : `0 8px 24px -8px rgba(28,25,23,0.25)` (info-bulles, menus)

### Typographie

Polices libres (Google Fonts, OFL), via `next/font/google` :
- `--font-sans` : **Barlow** (400, 500, 600, 700), fallback `system-ui, sans-serif`
- ↺ `--font-display` (était `--font-mono`) : **Barlow Condensed** (600, 700), fallback `"Arial Narrow", sans-serif`, avec `font-variant-numeric: tabular-nums` pour les chiffres

| Style | Famille | Téléphone | PC | Graisse | Usage |
|---|---|---|---|---|---|
| `num-hero` | display | 88 / 0,9 | 128 / 0,9 | 700, −0,02em | Compte à rebours J-n (bandeau seulement) |
| `num-xl` | display | 60 / 1 | 60 / 1 | 700 | Chiffre héros d'une carte (km de la semaine) |
| `num-lg` | display | 36 / 1 | 40 / 1 | 700 | Stat, écart d'allure |
| `num-md` | display | 30 / 1 | 30 / 1 | 700 | Tuiles (distance, objectif) |
| `num-sm` | display | 20 / 1,2 | 20 / 1,2 | 700 | Valeurs dans les listes et tableaux |
| `title-lg` | display | 36 / 1,05 | 48 / 1,05 | 700, −0,01em | Titre d'écran |
| `title` | display | 30 / 1,1 | 30 / 1,1 | 700, −0,01em | Titre de séance, de phase |
| **+** `title-sm` | display | 24 / 1,15 | 24 / 1,15 | 700 | Titre de semaine, sous-section |
| `body` | sans | 16 / 24 | 16 / 24 | 400 | Texte courant |
| `body-sm` | sans | 14 / 20 | 14 / 20 | 400 | Texte secondaire |
| `label` | sans | 14 / 20 | 14 / 20 | 600 | Libellé fort (bandeau, stat) |
| **+** `eyebrow` | sans | 12 / 16 | 12 / 16 | 700, +0,12em, CAPITALES | En-tête de carte (`text-subtle`) |
| `caption` | sans | 12 / 16 | 12 / 16 | 400 | Unités, légendes, axes |
| `button` | sans | 15 / 20 | 15 / 20 | 700 | Boutons |
| `nav` | sans | 11 / 14 | 14 / 20 | 600 | Onglets (bas sur téléphone, pilules sur PC) |

Formats (`lib/format.ts`) : allure `5'30 /km`, durée `3:30:00`, distance `25,6 km`, écart signé `+5 s` / `−0,6 km` (signe moins U+2212), dates `ven. 13 nov.`.

### Espacements, rayons, tailles

- Espacements : grille de 4 px inchangée (`space-1` 4 → `space-12` 48).
  **+** `page-x` : 16 px (téléphone) / 24 px (PC). **+** `card-pad` : 20 / 24. **+** `grid-gap` : 16 / 20. **+** `container` : 1152 px.
- Rayons : `radius-sm` **4** (haut des barres) · `radius-md` **16** (tuiles, champs, info-bulles) · `radius-lg` 24 (cartes, bandeau) · `radius-pill` 999 (badges, onglets, boutons).
- Tailles : `touch-min` 44 · `control-height` **48** · `nav-height` 64 (onglets du téléphone) · **+** `header-height` 56 · `ring-size` 124 · **+** `day-dot` 36.
- Bordures : `border-hairline` 1 px · `border-focus` 2 px · **+** `border-plan` 2 px (pointillés du prévu futur) · `stroke-chart` 2 px · `stroke-ring` 8 px.

### Mouvement

150 ms (survol), 250 ms (apparition), `ease-out`. Une seule animation d'entrée : les barres des graphiques poussent depuis la base (700 ms, `cubic-bezier(0.22,1,0.36,1)`, décalage de 50 ms par barre). Tout est coupé si `prefers-reduced-motion`.

## 5. Composants (12, dans `src/components/ui/`)

On garde les composants v1 et leurs props. On change leur aspect selon le prototype. Ils sont responsive par eux-mêmes : aucun composant « mobile » ou « desktop » séparé.

| Composant | Aspect v2 | Téléphone | PC |
|---|---|---|---|
| `Card` | Blanc, bordure `line`, `radius-lg`, `shadow-card`. En-tête : `eyebrow` à gauche, élément optionnel à droite (badge, unité) | padding 20 | padding 24 |
| `Chip` | Badge pilule 12/700. Variantes : `neutral` (raised / muted), `quality` (accent-soft / accent-ink : fractionné, seuil, allure, course), `long` (text / blanc : sortie longue), `good` / `info` / `warn` / `alert` (soft + glyphe + mot) | identique | identique |
| `Stat` | Valeur `num-lg` + unité (`title-sm`, `text-subtle`) + libellé `body-sm` dessous. Variante `tile` (fond `surface-raised` ou `accent-soft`, `radius-md`, valeur `num-md`) | tuiles en 3 colonnes, valeur réduite à 20 px si elle est longue (fourchette d'allure) | valeur pleine taille |
| `StatusBand` | **Le bandeau corail** : dégradé `hero-from`→`hero-to`, `shadow-hero`, courbe de profil décorative en blanc à 12 %. Contenu : course · date, `J-n`, « soit N semaines et J jours », tuiles Objectif + Allure cible (`hero-tile`), barre « Semaine n/30 · phase · % » | empilé, `num-hero` 88, hauteur ≤ 300 px pour laisser la séance du jour visible | une ligne : J-n à gauche (128), tuiles et barre à droite (≈ 384 px) |
| `Button` | `primary` : `accent-ink` + blanc, survol `accent-hover`. `secondary` : blanc + bordure `line` + texte `text`. `ghost` : texte `accent-ink`. Pilule, hauteur 48 | pleine largeur dans les formulaires | largeur du contenu |
| `TextField` | Fond `surface-raised`, bordure `line-strong`, `radius-md`, 16 px min. Erreur : bordure et aide `alert` | pleine largeur | max 480 px |
| `ScaleInput` | Échelle 1–5 nommée (remplace les emoji du prototype). Segments `surface-raised`, sélection `accent-ink` + blanc, mot sous la sélection (Épuisé · Difficile · Correct · Bien · Excellent). Variante 1–10 pour le RPE | segments ≥ 44 px, pleine largeur | segments 40 px |
| `SessionCard` | Prévue : `Chip` de type, titre `title`, consigne `body`, 3 tuiles (distance / allure en `accent-soft` / FC), lien `accent-ink`. Réalisée : 3 colonnes « réalisé en grand, visé dessous, écart signé en `accent-ink` ». Non réalisée : `Chip warn` ✕. Repos : titre seul | tuiles en 3 colonnes, compactes | idem, plus aérées |
| `ScoreCard` | Forme (démo D16) : jauge `stroke-ring` 8 en couleur d'état, valeur `num-xl` au centre, verdict + glyphe, 4 `Stat`, bouton « Questionnaire du matin » tant qu'il n'est pas rempli | jauge 124 | idem dans une carte de 2 colonnes sur 6 |
| `WeekChart` | « Cette semaine » : `num-xl` réalisé / prévu, barre de progression (réalisé corail, repère vertical « prévu à date »), 2 `Stat`, 7 pastilles jour (faite = corail ✓, non réalisée = warn-soft ✕, prévue = pointillés, repos = raised ; aujourd'hui = anneau accent), statut de la semaine en `Chip` | pastilles 36 px | idem |
| `TrendChart` | Variante `bars` (volume hebdo, comme le prototype) : prévu = aplat `plan` + liseré, réalisé = barre corail plus étroite, futur = pointillés, grille en tirets `line` avec 2 repères, axe S1…Sn, info-bulle `text` + blanc au survol/tap. Variante `line` (prédiction, allure dans le temps) : ligne `text` 2 px, cible en tirets `accent-ink` | 8 dernières semaines, info-bulle au tap | tout le plan (30 semaines), info-bulle au survol |
| `BottomNav` → nav responsive | Téléphone : barre en bas, fond blanc à 95 % + flou, onglet actif en `accent-ink`. PC : pilules dans l'en-tête, active = `text` + blanc. Logo : carré `accent` + nom « Target 42 » en `title-sm` | 5 onglets icône + libellé | 5 pilules texte |

Pièces du prototype qui disparaissent au profit des composants ci-dessus : `components/ui.tsx` (Card, CardTitle, PageHeader, TypeBadge, WeekStatusPill, Stat), `components/nav.tsx`, `components/volume-chart.tsx`. `PageHeader` devient un style de titre d'écran (`title-lg` + `body` muted), sans nouveau composant.

## 6. Écrans : téléphone et PC

### Aujourd'hui (`/`)
- **Téléphone** (ordre = la promesse) : StatusBand compact → Séance du jour (`SessionCard`) → Forme (`ScoreCard`, avec le questionnaire) → Cette semaine (`WeekChart`) → Focus endurance (`Card` + `Stat` signé) → Tendance du volume (`TrendChart bars`, 8 semaines).
- **PC** (grille 6 colonnes) : ligne 1, StatusBand (6). Ligne 2 : Séance du jour (2) · Forme (2) · Cette semaine (2). Ligne 3 : Tendance du volume (4) · Focus endurance (2).

### Plan (`/plan`) — calendrier prévu / réalisé / écarts
- **Téléphone** : titre + frise des 4 phases (barre segmentée, phase courante en `accent`), puis la **semaine en cours en premier**, dépliée. Bouton « Aujourd'hui » pour y revenir. Les autres semaines sont repliées : une ligne par semaine (n°, dates, km réalisé / prévu, `Chip` de statut). Dans une semaine : une ligne par séance (jour, titre, `Chip` de type, km réalisé / prévu, glyphe de statut). Tap sur une séance → détail.
- **PC** : frise des phases en pleine largeur, puis, par phase, les cartes de semaine en **2 colonnes**, toutes dépliées. La semaine en cours a un anneau `accent` et un badge « en cours ». Une colonne Δ (écart) est visible sur chaque ligne de séance.

### Séances (`/seances`) — historique
- **Téléphone** : liste de cartes (date + type, titre, puis 3 colonnes Distance / Allure / FC : réalisé en grand, visé dessous, écart en `accent-ink`). Les séances non réalisées montrent un `Chip warn` ✕. Filtre par type en haut (pilules défilantes).
- **PC** : la même ligne, en largeur : titre à gauche, bloc de comparaison aligné à droite (≈ 448 px). On peut la lire comme un tableau.

### Détail d'une séance (`/seances/[id]`)
- **Téléphone** : en-tête (date, type, titre) → comparaison prévu / réalisé (3 tuiles) → journal de la séance (ou bouton « Ajouter mon ressenti ») → graphiques allure et FC (`TrendChart line`, pleine largeur) → tours km par km (tableau défilant horizontalement) → analyse IA (phase 3).
- **PC** (12 colonnes) : à gauche (8), les graphiques et les tours. À droite (4), en colonne collante : prévu / réalisé, journal, analyse IA.

### Journal (`/journal`) — ressentis et questionnaire du matin
- **Téléphone** : en haut, une carte « Questionnaire du matin » (4 `ScaleInput` : fatigue, sommeil ressenti, douleur, motivation + une note), une fois par jour. Ensuite les entrées en 1 colonne : séance, chiffres clés, ressenti (mot + niveau), RPE (barre 10 segments), commentaire. La saisie après une séance est un écran plein : ressenti 1–5, RPE 1–10, douleur, commentaire libre, bouton « Enregistrer » collé en bas (pré-rempli par le ressenti de la montre, D20).
- **PC** : 2 colonnes d'entrées. Le questionnaire et la saisie s'ouvrent dans un panneau latéral de 480 px.

### Échéances (`/echeances`)
- **Téléphone** : liste des courses et tests (nom, date, J-n en `num-md`, objectif). La course cible est en tête avec un liseré `accent`.
- **PC** : frise horizontale du plan (30 semaines, 4 phases) avec les échéances posées dessus, puis la liste en 2 colonnes.

### Connexion (`/login`)
Carte centrée de 400 px maximum sur fond `bg`, logo, champ e-mail, bouton primary. Identique sur téléphone et PC.

### Coach IA (phase 3)
Accès depuis Aujourd'hui. Téléphone : écran plein. PC : panneau latéral de 480 px. À maquetter.

## 7. Accessibilité (minimum AA)

- Texte ≥ 4,5:1, éléments graphiques porteurs de sens ≥ 3:1. Les valeurs de la section 4 sont vérifiées.
- L'état n'est jamais porté par la couleur seule : glyphe et mot à chaque fois.
- Cibles ≥ 44 px, focus visible (`focus-ring`), vrais éléments HTML.
- Graphiques : chaque barre est focusable et a un `aria-label` (« Semaine 8 : 25,6 km réalisés sur 58 km prévus »), en plus d'une légende visible.

## 8. À éviter

Un dégradé ailleurs que dans le bandeau, du petit texte blanc sur `accent`, les emoji, plus d'un chiffre héros par carte, plus d'un bouton primary par écran, une couleur d'état sans glyphe ni mot, et toute couleur ou taille en dur hors tokens. Le prototype contient des couleurs en dur (`#f2552c`, `#c2410c` dans le bandeau) qui doivent passer en tokens.

## 9. Faire évoluer le design

1. **Tout changement passe par le QG** (conversation Design) : on décide, puis on met à jour ce fichier.
2. **Un nouveau besoin = d'abord un token ou un composant existant.** Un nouveau composant doit être justifié ici.
3. **Chaque nouvel écran est maquetté en deux formats** (390 px et 1280 px) avant d'être codé.
4. **Changement de token** = une ligne dans le journal ci-dessous + une tâche Claude Code qui ne touche que `globals.css`.
5. Une décision structurante (palette, police, navigation) donne aussi une entrée dans DECISIONS.md.

### Journal du design

| Version | Date | Changement |
|---|---|---|
| v1 | 2026-11-13 | Direction « Lac » (C) avec le bandeau de B. Palette Ardoise, Schibsted Grotesk + Fragment Mono, nom Target 42, 12 composants. |
| v2 | 2026-11-14 | **Retour au style du prototype v0, affiné.** Raison : en voyant le prototype avec ses vraies valeurs, Roméo le préfère à la v1 : plus d'énergie, plus lisible en plein jour, et un bandeau compte à rebours qui donne l'identité. La structure est conservée (noms de tokens, 12 composants, page `/design`), seules les valeurs et l'aspect changent. Ajouts : deux mises en page définies (téléphone 390 px / PC tableau de bord), 5 destinations de navigation, contrastes corrigés au niveau AA, emoji remplacés par une échelle nommée. Thème clair corail, Barlow + Barlow Condensed. |
