# État des lieux — Application marathon

> Bilan au **20 octobre 2026**, pour reprendre le projet après une pause.

## En bref

- L'app **fonctionne en local**. Lint et build passent sans erreur.
- Les **4 écrans de la V1 existent**. Le dashboard est terminé, les 3 autres sont en version simple.
- Toutes les données sont **fictives** : pas encore de Supabase ni de Strava.
- ⚠️ **Rien n'est sauvegardé dans git**, à part le commit de départ créé par Next.js.

## 1. Ce qui existe

| Dossier | Contenu |
|---|---|
| `CLAUDE.md` | Mémoire du projet : objectif, choix techniques, style, vocabulaire, avancement |
| `src/app/` | Une page par écran (`page.tsx` = dashboard, `plan/`, `seances/`, `journal/`) + `layout.tsx` (menu, polices) + `globals.css` (couleurs) |
| `src/components/` | Les briques réutilisables : `nav.tsx` (menu), `ui.tsx` (cartes, badges…), `volume-chart.tsx` (graphe du volume) |
| `src/data/` | Les données : `plan.ts` (course, 4 phases, 30 semaines), `mock-activity.ts` (sorties et journal inventés), `index.ts` (les fonctions que les pages utilisent pour lire les données) |
| `src/lib/` | Des outils : `dates.ts` (dates à l'heure de Paris), `format.ts` (afficher les allures, durées et km) |

## 2. Les écrans de la V1

| Écran | État | Détail |
|---|---|---|
| **Dashboard** `/` | ✅ Terminé | Compte à rebours, allure cible, bloc « cette semaine » avec le statut, séance du jour, graphe du volume |
| **Plan** `/plan` | 🟡 Version simple | Les 4 phases et chaque semaine avec ses séances, la cible d'allure et de FC. La semaine en cours est mise en avant |
| **Séances** `/seances` | 🟡 Version simple | Prévu vs réalisé pour la distance, l'allure et la FC, avec l'écart d'allure en secondes. Les séances ratées sont signalées |
| **Journal** `/journal` | 🟡 Lecture seule | Ressenti, RPE et note par séance. **On ne peut pas encore ajouter d'entrée** |

## 3. Ce qui manque

- [ ] Les finitions sur Plan, Séances et Journal
- [ ] Le formulaire pour remplir le journal
- [ ] Supabase (pour enregistrer les vraies données)
- [ ] L'import des sorties Strava

## 4. Les données de référence

- Course : **Marathon du Lac d'Annecy 2027**. Date provisoire : **dimanche 18 avril 2027** (⚠️ à confirmer quand elle sera publiée)
- Début du plan : **lundi 21 septembre 2026**, donc on est en semaine 5 sur 30. En réalité, tu es encore en « phase libre » : ~40-50 km/semaine, sortie longue à 22 km
- FC max : **185 bpm**, la même que dans tes zones Strava

## 5. Lancer l'app

Dans le terminal :

```bash
cd "/Users/romeo/Desktop/Centrale G1/DEFI G1:G2/Application marathon "
npm run dev
```

Ouvre ensuite **http://localhost:3000** dans ton navigateur. Pour arrêter l'app, fais `Ctrl + C` dans le terminal.

Garde bien les guillemets autour du chemin : le nom du dossier contient un `:` et se termine par un espace.

## 6. Prochaines étapes

1. **Faire un commit git**, pour ne pas risquer de perdre le travail déjà fait.
2. **Confirmer la date de la course** dès qu'elle est publiée.
3. **Coder le formulaire du journal**, la dernière fonctionnalité de base qui manque à la V1.
4. Brancher **Supabase**, puis l'**import Strava**.
