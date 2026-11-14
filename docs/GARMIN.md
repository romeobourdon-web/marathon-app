# Garmin Personal API — résultats de la sonde (M1)

Sonde exécutée le 2026-11-14 avec `scripts/garmin-probe.ts` (`node --env-file=.env.local scripts/garmin-probe.ts`).
Les réponses brutes sont dans `samples/garmin/`, **jamais commitées** (D15). Ce document ne contient ni valeur de santé ni coordonnée GPS : uniquement des noms de champs, des dates, des comptes et des codes HTTP.

Sources : [présentation de la Personal API](https://developer.garmin.com/gc-developer-program/personal/personal-api), [FAQ](https://developer.garmin.com/gc-developer-program/personal/personal-faq/), client officiel [garmin/connect-personal-api-python](https://github.com/garmin/connect-personal-api-python). La page Swagger de Garmin ne contient pas de spécification exploitable : la liste des endpoints vient du client officiel, puis a été vérifiée par la sonde.

## 1. En bref

| Question | Réponse |
|---|---|
| Activités depuis le 2026-04-04 (D17) ? | ✅ **87 activités**. La plus ancienne disponible depuis cette date est **le 2026-04-04 lui-même** : course de 5 014 m, le 5 km de référence. |
| Plus ancienne activité du compte | **2024-10-06** (131 activités au total). Aucune limite de profondeur constatée pour les activités. |
| Séries temporelles (FC, allure, altitude, GPS seconde par seconde) | ❌ Aucun endpoint JSON. ✅ Disponibles **uniquement dans le fichier FIT** (livré en ZIP). Décodage en M5. |
| VFC | ✅ `GET /hrv-service/hrv/daily/{début}/{fin}` → `hrvSummaries[].lastNightAvg` (ms). Données éparses : 56 nuits, depuis le 2026-05-17. |
| Sommeil | ✅ `GET /sleep-service/sleep/dailySleepSummariesByDate?startDate&endDate` → `sleepTimeSeconds`, `sleepScores.overall.value`. Plage ≤ 32 jours par requête. Très peu de nuits enregistrées. |
| FC de repos | ✅ `GET /usersummary-service/v2/dailysummaries?startDate&endDate` → `data[].heartRate.restingValue`. 140 jours renseignés depuis le 2026-04-04. |
| Limites de requêtes | Aucune rencontrée (≈ 100 appels, 0,7 s d'intervalle) ; aucun en-tête de quota renvoyé. |
| Conditions d'utilisation | ✅ Relues par Roméo le 2026-11-14 : usage autorisé pour ce projet (voir §7 et D13). |

## 2. Authentification

1. `POST https://personal.connectapi.garmin.com/personalapitoken-service/personal-api/personal-api-key/token`
   En-têtes : `Accept: */*`, `Authorization: ApiKey <GARMIN_PERSONAL_API_KEY>`. Pas de corps.
2. La réponse est **le jeton brut en texte** (un JWT), pas du JSON. Durée de vie lue dans le claim `exp` : **24 h**. Pas de refresh token : on redemande un jeton.
3. Appels de données : `Authorization: Bearer <jeton>`, `Accept: application/json`, même hôte.

La clé (`.env.local`) et le jeton ne sont jamais écrits ni affichés. La clé expire au bout d'un an (créée le 2026-11-14).

## 3. Endpoints testés

Tous en `GET` sur `https://personal.connectapi.garmin.com`. Dates au format `AAAA-MM-JJ`, bornes incluses.

### Activités

| Endpoint | Statut | Remarques |
|---|---|---|
| `/activitylist-service/activities/search/activities?start&limit[&startDate&endDate&activityType]` | 200 | Liste des activités, pagination `start`/`limit` (`limit=100` accepté). Contient déjà le résumé complet (voir §4). |
| `/activity-service/activity/{activityId}` | 200 | Détail (`summaryDTO`, `splitSummaries`, métadonnées). Seule source de `directWorkoutRpe` et `directWorkoutFeel` (ressenti saisi sur la montre). |
| `/activity-service/activity/{activityId}/workouts` | 200 | `[]` pour les deux activités testées. |
| `/download-service/files/activity/{activityId}` | 200 | **ZIP** contenant `<id>_ACTIVITY.fit`. Envoyer `Accept: application/zip, application/x-zip-compressed, application/octet-stream`. |
| `/activity-service/activity/activityTypes/simple` | 200 | Référentiel des types (`typeKey`). |

Types d'activités depuis le 2026-04-04 : `running` 84, `treadmill_running` 1, `cycling` 1, `stand_up_paddleboarding_v2` 1. Il faudra **filtrer sur le sport** à la synchro. Aucune activité saisie manuellement dans Garmin.

### Bien-être

| Endpoint | Statut | Plage max. par requête | Contenu utile |
|---|---|---|---|
| `/usersummary-service/v2/dailysummaries?startDate&endDate` | 200 | **365 jours OK** en une requête | `data[].calendarDate`, `heartRate.restingValue/minValue/maxValue`, `stress.*`, `bodyBattery.*`, `respiration.*`, pas, calories |
| `/hrv-service/hrv/daily/{début}/{fin}` | 200 | **365 jours OK** | `hrvSummaries[].calendarDate`, `lastNightAvg`, `lastNight5MinHigh`, `weeklyAvg`, `baseline.*`, `status` |
| `/hrv-service/hrv/{date}` | 200 / **204** | 1 jour | Résumé + `hrvReadings[]` (mesures de la nuit, toutes les 5 min environ). 204 sans corps si aucune mesure ce jour-là. |
| `/sleep-service/sleep/dailySleepSummariesByDate?startDate&endDate` | 200 / **400** | **≤ 32 jours** (45 refusé, 400 avec `{}`) | `sleepTimeSeconds`, `deep/light/rem/awakeSleepSeconds`, `sleepScores.overall.value`, `avgHeartRate`, `avgSleepStress` |
| `/sleep-service/sleep/dailySleep?date` | 200 | 1 jour | Mêmes champs ; tous à `null` si pas de nuit enregistrée. |
| `/wellness-service/wellness/dailyHeartRate?date` | 200 | 1 jour | `restingHeartRate`, `lastSevenDaysAvgRestingHeartRate`, `heartRateValues[]` (couples `[timestamp, bpm]`, ~2 min) |
| `/biometric-service/heartRateZones/v2` | 200 | — | Zones FC de la montre : `zone1Floor`…`zone5Floor`, `maxHeartRateUsed`, `restingHeartRateUsed`, `lactateThresholdHeartRateUsed` |
| `/metrics-service/metrics/maxmet/daily/{début}/{fin}` | 200 | 30 jours testés | VO2max estimée : `generic.vo2MaxPreciseValue` |
| `/usersummary-service/stats/stress/daily/{début}/{fin}` | 200 / **400** | **≤ 28 jours** (31 refusé) | Stress quotidien (redondant avec `dailysummaries`) |
| `/wellness-service/wellness/bodyBattery/reports/daily?startDate&endDate` | 200 | 30 jours testés | Body Battery (redondant avec `dailysummaries`) |
| `/wellnessactivity-service/activity/summary/range/{début}/{fin}` | 200 | — | `[]` : inutile |

## 4. Comparaison avec le schéma V1 (ARCHITECTURE.md §4)

### `activity` — tout est disponible dans la liste d'activités

| Colonne | Champ Garmin | Unité vérifiée |
|---|---|---|
| `source_id` | `activityId` | nombre |
| `start_time` | `startTimeGMT` | texte `AAAA-MM-JJ HH:MM:SS` en UTC (sans fuseau : à convertir) |
| `local_date` | `startTimeLocal` (10 premiers caractères) | — |
| `sport` | `activityType.typeKey` | `running`, `treadmill_running`… |
| `distance_m` | `distance` | m |
| `moving_time_s` | `movingDuration` | s |
| `elapsed_time_s` | `elapsedDuration` | s (chrono = `duration`) |
| `avg_hr` / `max_hr` | `averageHR` / `maxHR` | bpm (renseignés sur 87/87 activités) |
| `avg_speed_mps` | `averageSpeed` | m/s (vérifié : = `distance / duration`) |
| `elevation_gain_m` | `elevationGain` | m |
| `raw` | réponse complète de la liste | — |

Champs utiles **absents du schéma**, disponibles dans `raw` sans migration : cadence moyenne (`averageRunningCadenceInStepsPerMinute`), temps par zone FC (`hrTimeInZone_1…5`), `activityTrainingLoad`, `aerobicTrainingEffect`, `fastestSplit_1000/5000/10000/21098`, `avgGradeAdjustedSpeed`. Ce sont des valeurs calculées par Garmin : D14 les laisse dans `raw`, `engine/` recalcule ce dont il a besoin.

⚠️ **À trancher au QG (M3)** :
- **GPS dans `raw`** : la liste contient `startLatitude/startLongitude/endLatitude/endLongitude`, soit l'adresse du domicile. Proposition : les retirer de `raw` avant insertion (le tracé complet reste dans `activity_stream`, à protéger de la même façon pour le tuteur).
- **Ressenti Garmin** : `directWorkoutRpe` et `directWorkoutFeel` (détail d'activité uniquement) recoupent `journal_entry.rpe` / `feeling`. Les importer pré-remplirait le journal, mais cela demande un appel détail par activité.

### `activity_stream` — uniquement via FIT

Aucun endpoint JSON ne fournit de séries temporelles. Le fichier FIT les contient toutes :

| Course testée | ZIP | FIT décompressé | Messages `record` |
|---|---|---|---|
| 2026-11-13 | 127 Ko | 289 Ko | 3 261 |
| 2026-04-04 | 43 Ko | 93 Ko | 1 132 |

Champs des messages `record` (identiques sur les deux fichiers) : `timestamp`, `position_lat`, `position_long`, `distance`, `enhanced_speed`, `enhanced_altitude`, `heart_rate`, `cadence`, `fractional_cadence`, `power`, plus des champs non documentés (numéros 29, 39–42, 83–90, 107, 134–143). Toutes les colonnes de `activity_stream` sont donc couvertes (`time_s`, `distance_m`, `hr`, `speed_mps`, `altitude_m`, `cadence`, `lat`, `lng`).
Autres messages présents : `session`, `lap`, `split`, `time_in_zone`, `event`, `device_info`, et des messages propriétaires (`global_233`, `global_160`, `global_325`…).

Conséquence pour M5 : il faut un **décodeur FIT**. Le format est simple (la sonde le parcourt déjà en ~60 lignes sans dépendance) ; décoder les valeurs demande en plus les échelles (`enhanced_speed` en mm/s, positions en semicircles, etc.). Choix entre décodeur maison et SDK officiel Garmin : à proposer en M5 (point 3 de la mission). Le ZIP se lit avec `zlib` (natif), en prenant les tailles dans le répertoire central (l'en-tête local les laisse à 0).

### `wellness` — tout est disponible, mais les données sont éparses

| Colonne | Endpoint | Champ | Couverture constatée |
|---|---|---|---|
| `resting_hr` | `/usersummary-service/v2/dailysummaries` | `data[].heartRate.restingValue` | 152 jours sur 257 depuis le 2025-11-15 ; **140 depuis le 2026-04-04** |
| `hrv_ms` | `/hrv-service/hrv/daily/{début}/{fin}` | `hrvSummaries[].lastNightAvg` | **56 nuits**, de 2026-05-17 à 2026-11-14 (pic en juillet-août), **aucune avant** |
| `sleep_s` | `/sleep-service/sleep/dailySleepSummariesByDate` | `sleepTimeSeconds` | **4 nuits sur les 30 derniers jours** |
| `sleep_score` | idem | `sleepScores.overall.value` | idem |

Alternative pour la FC de repos jour par jour : `/wellness-service/wellness/dailyHeartRate?date` → `restingHeartRate`.
Les trous de VFC et de sommeil viennent du port de la montre la nuit, pas de l'API : il faudra que `engine/` gère les jours manquants (pas d'interpolation silencieuse, D04).

Colonnes du schéma sans source Garmin : aucune.

## 5. Historique disponible

| Donnée | Plus ancienne date obtenue |
|---|---|
| Activités | **2024-10-06** (toutes les activités du compte, sans limite constatée) |
| Activités depuis le lancement du Défi | **2026-04-04** (5 km de référence) |
| Résumés quotidiens (FC repos) | 2025-11-15 (bord de la fenêtre de 365 jours demandée ; non testé au-delà) |
| VFC | 2026-05-17 (aucune mesure avant) |
| Sommeil | nuit trouvée à 3 mois ; aucune à 6 mois ni au 2026-04-04 |

Import initial M5 depuis le 2026-04-04 (D17) : **1 requête** pour la liste des activités (87 < 100), 87 téléchargements FIT, 1 requête `dailysummaries` et 1 requête `hrv/daily`, et 7 requêtes de sommeil (tranches de ≤ 32 jours).

## 6. Limites et comportements

- **Quotas** : aucun refus (pas de 429) sur ≈ 100 appels en deux exécutions, à 0,7 s d'intervalle. Aucun en-tête `X-RateLimit-*` ni `Retry-After` renvoyé. Latence max. 1,3 s. Garder un intervalle de 0,5 à 1 s et gérer un éventuel 429 par précaution.
- **Plage trop longue** : `400` avec un corps `{}`, sans message. Limites constatées : sommeil ≤ 32 jours, stress ≤ 28 jours ; résumés quotidiens et VFC : 365 jours OK.
- **Jour sans donnée** : `204` sans corps (VFC d'un jour) ou objet aux champs `null` (sommeil d'un jour).
- **Jeton** : 24 h, à redemander (pas de refresh token).

## 7. Conditions d'utilisation

Roméo a relu les conditions de la Personal API lors de la création de la clé, le **2026-11-14** : l'usage des données est **autorisé pour ce projet**, y compris l'affichage au tuteur et l'utilisation par le coach IA. Voir D13 dans `docs/DECISIONS.md`.

Règles qui restent en vigueur : clé uniquement dans `.env.local`, échantillons bruts uniquement dans `samples/` (non versionné), aucune trace GPS ni valeur de santé dans un fichier commité.
