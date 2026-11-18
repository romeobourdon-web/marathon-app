# Maquettes — Séances (`/seances`) et Détail (`/seances/[id]`)

Résumé des maquettes v2.1 (canvas claude.ai, version 1794690802-f558), pour Claude Code.
Classes = `t42-reference.css`. Chiffres fictifs : ne jamais les recopier. DESIGN.md fait foi.

## Séances — téléphone (390)

1. En-tête de page : `h1.t-lg` « Séances » + `p.body.muted` « Prévu vs réalisé, de la plus récente à la plus ancienne. »
2. Filtres : 4 `Button toggle` (`aria-pressed`) : **Toutes · Course · Hors plan · Non réalisées**.
3. Groupes par semaine : `h2.eyebrow` « Semaine 8 · 9–15 nov. », puis une carte par séance ou activité. Dernier groupe : « Avant le plan · hors plan ».
4. Carte (lien vers le détail, padding 16, gap 14) :
   - ligne 1 : date (`caption subtle`, 600) + `Chip` de type (`neutral` Endurance · `quality` Fractionné/Seuil/Allure/Course · `long` Sortie longue · `off` Hors plan) ;
   - titre (`label`, 16 px) ;
   - **séance réalisée** : 3 colonnes `Stat compare` — Distance / Allure /km / FC moy. Chaque colonne : `cmp-l` (libellé capitales, style `micro`), `cmp-v` (réalisé), `cmp-p` « visé … » + écart signé en `accent-ink` entre parenthèses, seulement s'il sort de la zone (ex. « (−14 s) », « (+4) »). La valeur réalisée passe en `accent-ink` quand elle est hors zone ;
   - **séance de fractionné** : la colonne allure porte l'allure des répétitions (« Allure 400 m »), pas la moyenne ;
   - **non réalisée** : pas de chiffres, `Chip warn` « ✕ Non réalisée » ;
   - **hors plan** (autre sport, avant le 21/09, marche, foot) : une ligne `body-sm muted` « 25,3 km · 58'10 · FC 121 — non comptée dans le plan ».

Extrait d'une carte réalisée :

```html
<a href="#" class="card" style="padding:16px;display:flex;flex-direction:column;gap:14px">
  <div><div class="row"><span class="caption subtle" style="font-weight:600">mer. 11 nov.</span><span class="chip chip-neutral">Endurance</span></div>
  <div class="label" style="font-size:16px;margin-top:4px">Footing EF</div></div>
  <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px">
    <div><div class="cmp-l">Distance</div><div class="cmp-v">7,2 km</div><div class="cmp-p">visé 7 km</div></div>
    <div><div class="cmp-l">Allure /km</div><div class="cmp-v acc">5'31</div><div class="cmp-p">visé 5'45–6'10 <span class="acc" style="font-weight:700">(−14 s)</span></div></div>
    <div><div class="cmp-l">FC moy.</div><div class="cmp-v acc">146</div><div class="cmp-p">visé 128–142 <span class="acc" style="font-weight:700">(+4)</span></div></div>
  </div>
</a>
```

## Séances — PC (1280)

Même contenu. L'en-tête de page et les filtres sont sur une ligne (`between`). Chaque carte est en ligne (`align-items:center; gap:24px`) : titre à gauche (flex 1), bloc de comparaison à droite, largeur fixe **448 px**. Lisible comme un tableau.

## Détail — téléphone (390)

Ordre :
1. Lien retour `← Séances` (`label`, cible ≥ 44 px).
2. En-tête : date + « semaine n » (`caption subtle`) + `Chip` de type ; `h1.t-lg` titre ; `p.body.muted` « Prévu : <consigne> ».
3. Carte **Prévu / réalisé** : `Chip` d'état en en-tête (✓ Conforme, sinon warn) ; 3 `Stat compare` (Distance, Allure, FC) ; filet ; 3 valeurs simples : Durée, D+, Cadence (pas par minute, deux pieds : cadence Garmin × 2, D22).
4. Carte **Mon ressenti** (lien « Modifier ») : Ressenti (n + mot, ex. « 4 Bien »), RPE n/10, douleur Achille n/5 ; barre de 10 segments pour le RPE (remplis `accent`, vides `surface-raised`) ; commentaire en citation italique dans une tuile. **Sans journal** : bouton « Ajouter mon ressenti » (écran Journal, plus tard).
5. Carte **Allure** : `Chip` (✓ Dans la zone / ! hors zone) ; moyenne en `n-lg` + « /km moy. » ; `TrendChart line` par km avec **zone visée** (bande `surface-raised` bordée de tirets `plan-edge`), axe d'allure inversé (plus rapide en haut), dernier point marqué ; légende « km 1 · zone visée … · km n ».
6. Carte **Fréquence cardiaque** : idem (zone FC visée) ; `Chip warn` « ! Dérive en fin » si la FC sort de la zone sur les derniers km.
7. Carte **Tours km par km** : tableau `tbl` (Km, Allure, FC), FC hors zone en `accent-ink`, légende « FC en couleur : au-dessus de 144 ».
8. Carte **Analyse du coach** : `Chip neutral` « phase 3 » + texte d'attente.

Les tours, l'allure par km et la dérive sont calculés par `engine/` à partir de `activity_stream` (D04). Une activité sans séries (import téléphone) n'affiche que les cartes 3 et 4.

## Détail — PC (1280)

Grille 12 colonnes : **gauche (8)** = Allure, FC, Tours (tableau sur 2 colonnes : km 1-10 / 11-20) ; **droite (4)** = Prévu/réalisé, Mon ressenti, Analyse du coach.
