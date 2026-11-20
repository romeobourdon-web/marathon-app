import { Stat } from "@/components/ui/stat";
import type { CompletedRun } from "@/db/types";
import { paceGap, rangeGap } from "@/engine/pace";
import { formatDistance, formatDistanceParts, formatPaceRangeValue, formatPaceValue, formatSignedDelta } from "@/lib/format";
import type { Session } from "@/planner/types";

/**
 * Les 3 colonnes prévu / réalisé d'une séance (Distance, Allure, FC) ; écart signé seulement hors zone
 * (calculé par engine/pace). À placer dans un <dl>.
 */
export function SessionCompare({ session, actual }: { session: Session; actual: CompletedRun }) {
  const pace = paceGap(actual.avgPace, session.targetPace);
  const hr = actual.avgHr > 0 ? rangeGap(actual.avgHr, session.targetHr) : 0;
  const done = formatDistanceParts(actual.distanceKm * 1000);
  return (
    <>
      <Stat variant="compare" label="Distance" value={done.value} unit={done.unit} planned={formatDistance(session.distanceKm * 1000, 0)} />
      <Stat
        variant="compare"
        label="Allure /km"
        value={actual.avgPace > 0 ? formatPaceValue(actual.avgPace) : "—"}
        planned={formatPaceRangeValue(session.targetPace)}
        delta={pace !== 0 ? `${formatSignedDelta(pace)} s` : undefined}
      />
      <Stat
        variant="compare"
        label="FC moy."
        value={actual.avgHr > 0 ? String(actual.avgHr) : "—"}
        planned={`${session.targetHr.min}–${session.targetHr.max}`}
        delta={hr !== 0 ? formatSignedDelta(hr) : undefined}
      />
    </>
  );
}
