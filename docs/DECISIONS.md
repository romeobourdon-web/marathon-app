# Journal des décisions

Format : une décision = une entrée. On n'efface pas : on remplace par une nouvelle entrée qui annule l'ancienne.

| ID | Date | Décision | Pourquoi | Statut |
|---|---|---|---|---|
| D01 | 2026-11-11 | Séparer l'usine (QG + Claude Code) et le produit (modules de l'app). | Éviter de confondre outils de construction et fonctionnalités. | ✅ |
| D02 | 2026-11-11 | Source de vérité = `docs/` dans le repo, synchronisé dans le projet Claude QG. | Une seule version des specs, lisible par le QG et par Claude Code. | ✅ |
| D03 | 2026-11-11 | Un seul utilisateur + tuteur en lecture seule. | Simplicité (authentification, données, limites des API). | ✅ |
| D04 | 2026-11-11 | L'ingénieur = code déterministe (`engine/`), jamais un modèle de langage. | Fiabilité des calculs, testabilité, démontrable au tuteur. | ✅ |
| D05 | 2026-11-11 | Données via des connecteurs interchangeables. Source cible : Garmin (API personnelle). Choix final en phase 1. | Garmin donne VFC/sommeil ; les conditions de Strava interdisent l'usage IA des données de leur API. | 🟡 à finaliser |
| D06 | 2026-11-11 | Stack : Next.js + TS + Tailwind, Supabase, Vercel, PWA mobile d'abord. | Continuité avec l'existant, gratuit à cette échelle, mobile sans app native. | ✅ |
| D07 | 2026-11-11 | Le coach (API Claude) propose, Roméo valide. Il ne modifie jamais le plan seul. | Garder le contrôle et tracer les décisions. | ✅ |
| D08 | 2026-11-11 | Prévu vs réalisé = concept central (écarts mesurés et expliqués). | L'entraînement réel s'écarte du plan, et le rendu du Défi analyse ces écarts. | ✅ |
| D09 | 2026-11-11 | Direction visuelle : sombre premium (WHOOP, Oura) × minimalisme Nothing. | Préférence de Roméo après revue de références. | 🟡 à préciser (DESIGN.md) |
| D10 | 2026-11-11 | Le prototype v0 (dashboard sur données fictives) est archivé (tag git). Garder la base Next.js ; reconstruire l'UI après l'audit. | Le design change entièrement et la couche données manque. | ✅ Audit fait : l'UI du prototype reste telle quelle jusqu'à la refonte du design, puis elle est supprimée. |
| D11 | 2026-11-11 | Le plan est **généré** par `planner/` (`buildPlan`) puis inséré en base. Ensuite, c'est la base qui fait foi : modifications manuelles ou propositions du coach validées (D07). | Le plan est une donnée modifiable et traçable ; le générateur ne sert qu'à l'amorcer. | ✅ |
