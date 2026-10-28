import type { RateTypeRecommendation, RenewalInput, TermRecommendation } from "@/types/renewal";

/**
 * Deux axes indépendants :
 *  - stabilityScore (0-100) : haut = besoin de prévisibilité -> taux FIXE.
 *                             bas  = tolère les fluctuations -> taux VARIABLE.
 *  - horizonScore   (0-100) : haut = situation stable à long terme -> terme 5 ANS.
 *                             bas  = changements attendus bientôt  -> terme 3 ANS.
 *
 * Les poids sont calibrés pour que le score max atteigne 100 sur chaque axe ;
 * un petit plancher (base) évite qu'un profil "neutre" tombe à 0.
 */

const STRESS_POINTS: Record<RenewalInput["stressTolerance"], number> = {
  very_stressed: 40,
  somewhat: 18,
  comfortable: 0,
};

const PRIORITY_POINTS: Record<RenewalInput["priorityBalance"], number> = {
  stability: 30,
  balanced: 12,
  savings: 0,
};

const BUFFER_POINTS: Record<RenewalInput["financialBuffer"], number> = {
  none: 20,
  some: 8,
  comfortable: 0,
};

// Un taux variable a généralement une pénalité de rupture bien plus basse
// qu'un taux fixe : un changement de vie probable pèse donc légèrement en
// faveur du variable, indépendamment de la tolérance au stress.
const LIFE_CHANGE_PENALTY: Record<RenewalInput["lifeChangeLikelihood"], number> = {
  unlikely: 0,
  maybe: 3,
  likely: 8,
  planned: 15,
};

const STABILITY_BASE = 10;

function points<T extends string>(map: Record<T, number>, value: T | undefined): number {
  return value !== undefined ? map[value] : 0;
}

// Accepte un input PARTIEL : les champs pas encore répondus contribuent 0,
// ce qui permet de réutiliser cette même fonction pour l'aperçu en direct
// pendant le quiz (lib/livePreview.ts) et pour le calcul final.
export function calculateStabilityScore(input: Partial<RenewalInput>): number {
  const raw =
    STABILITY_BASE +
    points(STRESS_POINTS, input.stressTolerance) +
    points(PRIORITY_POINTS, input.priorityBalance) +
    points(BUFFER_POINTS, input.financialBuffer) -
    points(LIFE_CHANGE_PENALTY, input.lifeChangeLikelihood);

  return Math.min(100, Math.max(0, raw));
}

export function stabilityScoreToRateType(score: number): RateTypeRecommendation {
  if (score >= 65) return "fixed";
  if (score < 40) return "variable";
  return "balanced";
}

const CAREER_POINTS: Record<RenewalInput["careerOutlook"], number> = {
  stable: 40,
  raise_expected: 35,
  uncertain: 15,
  job_change_likely: 0,
};

const LIFE_STABILITY_POINTS: Record<RenewalInput["lifeChangeLikelihood"], number> = {
  unlikely: 40,
  maybe: 25,
  likely: 10,
  planned: 0,
};

const HORIZON_BASE = 20;

export function calculateHorizonScore(input: Partial<RenewalInput>): number {
  const raw =
    HORIZON_BASE +
    points(CAREER_POINTS, input.careerOutlook) +
    points(LIFE_STABILITY_POINTS, input.lifeChangeLikelihood);
  return Math.min(100, Math.max(0, raw));
}

export function horizonScoreToTerm(score: number): TermRecommendation {
  return score >= 55 ? "5" : "3";
}

export const RATE_TYPE_LABELS: Record<RateTypeRecommendation, string> = {
  fixed: "Taux fixe",
  variable: "Taux variable",
  balanced: "Fixe ou variable — les deux se défendent",
};

export const TERM_LABELS: Record<TermRecommendation, string> = {
  "3": "Terme de 3 ans",
  "5": "Terme de 5 ans",
};
