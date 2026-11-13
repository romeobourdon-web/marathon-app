# Design — Target 42

Statut : ✅ validé (2026-11-13, D09). Version du design system : **v1**.

- **Référence visuelle (design system)** : https://claude.ai/artifact/CRSHiW5EfDsRmCWUer4BiV — tokens, composants avec aperçus, règles.
- **Maquettes** : https://claude.ai/artifact/C7PqLDJb2yhV12B4kEuaM2 — page « Retenu » = écran Aujourd'hui de référence.
- En cas de contradiction : **ce fichier fait foi pour le code**. L'artefact design system est sa vitrine visuelle et doit être mis à jour en même temps (voir « Faire évoluer le design »).

## 1. Intention

**Calme, précis, chiffres d'abord.** On ouvre l'app au réveil : en 10 secondes, on sait quoi faire aujourd'hui, dans quel état on est, où on en est.
Les références sont Polestar et Oura pour le calme, F1 Live Timing pour le bandeau et les écarts, Nothing pour la retenue. Le thème est sombre, unique, nommé « Ardoise ».

## 2. Principes

1. **Une carte = une question**, avec un seul chiffre héros par carte.
2. **Prévu et réalisé côte à côte.** Prévu = contour (`plan`), réalisé = plein (`done`). Les écarts sont montrés, jamais cachés.
3. **La couleur a un sens.** `accent` = action ou sélection. `good` / `warn` / `alert` = état, **toujours doublé d'un mot**. Tout le reste est en gris.
4. **Les chiffres sont en mono**, jamais en gras (Fragment Mono n'a qu'une graisse). La hiérarchie passe par la taille.
5. **Surfaces séparées par des paliers de gris et des bordures de 1 px.** Ni ombre, ni dégradé.
6. **Mouvement sobre** : 150 ms (survol, appui), 250 ms (apparition), `ease-out`. On respecte `prefers-reduced-motion`.
7. **L'UI affiche, elle ne calcule pas** (ARCHITECTURE.md). Seuils, écarts et statuts arrivent tout faits depuis `engine/` et `planner/`.

## 3. Tokens

Noms identiques dans le CSS (`--<nom>`), Tailwind et l'artefact design system.

### Couleurs

| Token | Valeur | Usage | Contraste sur `surface` |
|---|---|---|---|
| `bg` | `#0A0A0B` | Fond de page | — |
| `surface` | `#141416` | Cartes | — |
| `surface-raised` | `#18181B` | Nav flottante, champs, segments | — |
| `track` | `#1E1E22` | Rail des jauges, bouton désactivé | — |
| `line` | `#27272B` | Bordures et filets décoratifs | — |
| `line-strong` | `#63636C` | Contours porteurs de sens (barre prévue, champ) | 3,1:1 |
| `text` | `#EDEDEF` | Texte, chiffres | 15,7:1 |
| `text-muted` | `#93939B` | Libellés, unités | 6,0:1 |
| `accent` | `#A795FF` | Action, sélection, lien, jour courant, compte à rebours | 7,4:1 |
| `accent-hover` | `#B9ABFF` | Survol / appui du bouton principal | — |
| `on-accent` | `#0A0A0B` | Texte sur `accent` | 7,9:1 |
| `good` | `#5FD4A0` | État favorable | 10,0:1 |
| `warn` | `#FFB547` | Vigilance, écart au plan | 10,5:1 |
| `alert` | `#FF6F61` | Alerte, séance manquée | 6,7:1 |
| `plan` | = `line-strong` | Le prévu dans les graphiques | — |
| `done` | = `text` | Le réalisé dans les graphiques | — |
| `focus-ring` | = `accent` | Anneau de focus | — |

Règles : un seul bouton `accent` par écran. Jamais de texte en `line` ni en `line-strong`. Jamais de couleur d'état sans libellé.

### Typographie

Polices libres (Google Fonts, licence OFL), chargées via `next/font/google` :
- `--font-sans` : **Schibsted Grotesk** (400, 500, 600), fallback `system-ui, sans-serif`
- `--font-mono` : **Fragment Mono** (400), fallback `ui-monospace, monospace`, avec `font-variant-numeric: tabular-nums`

| Style | Famille | Taille / interligne | Graisse | Interlettrage | Usage |
|---|---|---|---|---|---|
| `num-hero` | mono | 64 / 58 | 400 | −0,04em | Chiffre principal d'une carte |
| `num-xl` | mono | 44 / 48 | 400 | −0,03em | Score de forme, temps prédit |
| `num-lg` | mono | 22 / 28 | 400 | −0,01em | Totaux |
| `num-md` | mono | 17 / 22 | 400 | 0 | Bandeau, valeurs de stat |
| `num-sm` | mono | 13 / 18 | 400 | 0 | Chips, tableaux, écarts |
| `title-lg` | sans | 34 / 38 | 500 | −0,02em | Titre d'écran |
| `title` | sans | 22 / 28 | 500 | −0,01em | Titre de séance ou de carte |
| `body` | sans | 16 / 24 | 400 | 0 | Texte courant |
| `body-sm` | sans | 14 / 20 | 400 | 0 | Texte secondaire |
| `label` | sans | 13 / 18 | 400 | 0 | En-tête de carte (muted) |
| `caption` | sans | 12 / 16 | 400 | 0 | Unités, légendes |
| `button` | sans | 16 / 20 | 600 | 0 | Boutons |
| `nav` | sans | 11 / 14 | 500 | 0 | Onglets |

Formats : allure `5'30 /km`, durée `1:06:00` ou `≈ 1 h 06`, distance `25,6 km` (virgule décimale), écart signé `+5` / `−0,6` (vrai signe moins U+2212). La mise en forme est faite par `src/lib/format.ts`, jamais dans le composant.

### Espacements, rayons, bordures, tailles

- Espacements (grille de 4 px) : `space-1` 4 · `space-2` 8 · `space-3` 12 · `space-4` 16 · `space-5` 20 · `space-6` 24 · `space-8` 32 · `space-12` 48.
  Marge de page et padding de carte = `space-5`. Écart entre cartes = `space-4`.
- Rayons : `radius-sm` 6 (barres) · `radius-md` 12 (champs, segments) · `radius-lg` 24 (cartes) · `radius-pill` 999 (boutons, chips, nav).
- Bordures : `border-hairline` 1px · `border-focus` 2px (décalage 2 px) · `stroke-chart` 1.6px · `stroke-ring` 6px.
- Tailles : `touch-min` 44px · `control-height` 52px · `nav-height` 64px · `ring-size` 124px.

## 4. Composants (v1)

Ce sont des composants de présentation dans `src/components/ui/`. Ils reçoivent leurs données en props, n'importent jamais `db/`, `engine/` ni `planner/`, et ne contiennent aucune valeur en dur hors tokens. Le détail visuel de chacun est dans l'artefact design system.

| Composant | Rôle | Points clés |
|---|---|---|
| `StatusBand` | Bandeau Date · Semaine · J-n | 3 colonnes séparées de filets ; seul J-n en `accent` ; `<dl>` |
| `Card` | Conteneur de base | `surface`, bordure `line`, `radius-lg`, padding `space-5`, libellé `label` |
| `SessionCard` | Séance du jour / d'un jour | Distance en `num-hero`, titre en `title`, consignes en `Chip`, lien détail. Variantes : prévue, réalisée (prévu · réalisé · écart), repos |
| `ScoreCard` | État de forme | Jauge 0–100 (couleur selon le statut reçu), verdict en mots, 4 `Stat`, bouton questionnaire tant qu'il n'est pas rempli. Jauge masquée si pas de score |
| `Stat` | Une mesure | Libellé, valeur en mono 19 px, unité ou verdict ; couleur d'état + mot |
| `Chip` | Consigne ou statut court | Mono 13, pilule `line` ; variantes neutre / good / warn / alert (seul le texte se colore) |
| `WeekChart` | Prévu vs réalisé de la semaine | 7 barres : contour `plan`, plein `done`, point `warn` si écart signalé, jour courant en `accent` ; `role="img"` + `aria-label` ; légende visible |
| `TrendChart` | Valeur dans le temps vs cible | Ligne `text` 1,6 px, cible en pointillés muted, dernier point marqué, pas de grille |
| `Button` | Actions | primary (`accent`, 1 par écran) / secondary (contour `line-strong`) / ghost ; pilule, 52 px ; état désactivé |
| `TextField` | Saisie | Label au-dessus, aide en dessous, `surface-raised` + `line-strong`, 16 px minimum, état d'erreur `alert` + `aria-invalid` |
| `ScaleInput` | Échelle 1–5 du questionnaire | `fieldset` + radios natifs, 5 segments ≥ 44 px, sélection en `accent`, extrêmes nommés |
| `BottomNav` | Navigation | Pilule flottante, 4 onglets (Aujourd'hui, Calendrier, Journal, Échéances), actif en `accent` + `aria-current` |

Icônes : au trait, 24 px, épaisseur 1,8, `currentColor`. Pas d'icônes pleines, pas d'emoji.

## 5. Écrans

| Écran | Statut design | Contenu |
|---|---|---|
| Aujourd'hui | ✅ maquette de référence | StatusBand → SessionCard → ScoreCard → WeekChart → TrendChart (objectif) + échéance suivante → BottomNav |
| Calendrier (prévu / réalisé / écarts) | ⏳ à maquetter | — |
| Détail d'une séance | ⏳ à maquetter | — |
| Journal + questionnaire du matin | ⏳ à maquetter | — |
| Échéances | ⏳ à maquetter | — |
| Coach IA | ⏳ plus tard (phase 3) | Accès depuis Aujourd'hui, pas un 5ᵉ onglet |

## 6. Accessibilité (minimum AA)

- Texte ≥ 4,5:1 ; éléments graphiques porteurs de sens ≥ 3:1. Les valeurs ci-dessus sont vérifiées.
- L'état n'est jamais porté par la couleur seule. `good` et `alert` diffèrent aussi en luminosité.
- Cibles tactiles ≥ 44 px, focus clavier visible partout, vrais éléments HTML (`button`, `a`, `label`, `fieldset`).
- Graphiques : `role="img"` + `aria-label` qui lit les valeurs.

## 7. À éviter

Les ombres, les dégradés, les cartes avec bordure gauche colorée, les emoji, plus d'un chiffre héros par carte, plus d'un bouton `accent` par écran, et toute couleur ou taille codée en dur hors tokens.

## 8. Faire évoluer le design

Le design va bouger. Pour qu'il reste cohérent :

1. **Tout changement passe par le QG** (projet Claude, conversation Design) : on décide, on met à jour l'artefact design system, puis ce fichier.
2. **Un nouveau besoin = d'abord un token ou un composant existant.** On n'en crée un nouveau que si rien ne convient, et il est ajouté ici et dans l'artefact.
3. **Chaque écran est maquetté** dans le canvas des maquettes avant d'être codé.
4. **Changement de token** = nouvelle ligne dans le journal ci-dessous + une tâche Claude Code qui ne modifie que le fichier de tokens.
5. Une décision structurante (palette, police, navigation) donne aussi une entrée dans DECISIONS.md.

### Journal du design

| Version | Date | Changement |
|---|---|---|
| v1 | 2026-11-13 | Direction « Lac » (C) retenue avec le bandeau de B. Palette Ardoise, Schibsted Grotesk + Fragment Mono, nom Target 42, 11 composants. |