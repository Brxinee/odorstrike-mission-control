/**
 * Deterministic Action Priority Engine — ported from Admin
 * lib/overview-actions.mjs (commit 17fd2d6).
 * score = severity × financialImpact × urgency × confidence
 * No LLM. Missing money never inflates priority.
 */

export const ACTION_STATES = {
  OPEN: "OPEN",
  SNOOZED: "SNOOZED",
  HANDLED: "HANDLED",
  EXPIRED: "EXPIRED",
} as const;

export const SEVERITY: Record<string, number> = {
  critical: 4,
  warning: 3,
  info: 2,
  watch: 1,
};

export const URGENCY: Record<string, number> = {
  immediate: 3,
  today: 2,
  week: 1,
};

export const CONFIDENCE: Record<string, number> = {
  PROVEN: 1,
  INFERRED: 0.7,
  UNKNOWN: 0.4,
};

export function financialImpactFactor(paise: number | null | undefined) {
  if (paise == null || !Number.isFinite(Number(paise)) || Number(paise) <= 0) return 1;
  const rupees = Number(paise) / 100;
  return 1 + Math.min(10, Math.floor(rupees / 100));
}

export function scoreAction(input: {
  severity: string;
  paise: number | null | undefined;
  urgency: string;
  confidence: string;
  ageHours?: number | null;
}) {
  const sev = SEVERITY[input.severity] || 1;
  const fin = financialImpactFactor(input.paise);
  let urg = URGENCY[input.urgency] || 1;
  if (input.ageHours != null && Number(input.ageHours) >= 24) {
    urg = Math.max(urg, URGENCY.immediate);
  }
  const conf = CONFIDENCE[input.confidence] || CONFIDENCE.UNKNOWN;
  return { score: sev * fin * urg * conf, severity: sev, financialImpact: fin, urgency: urg, confidenceFactor: conf };
}
