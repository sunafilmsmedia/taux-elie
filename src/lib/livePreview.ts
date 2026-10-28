import type { RenewalInput } from "@/types/renewal";
import {
  calculateHorizonScore,
  calculateStabilityScore,
  horizonScoreToTerm,
  stabilityScoreToRateType,
} from "./scoring";

export interface LivePreview {
  stabilityScore: number;
  horizonScore: number;
  rateType: ReturnType<typeof stabilityScoreToRateType>;
  term: ReturnType<typeof horizonScoreToTerm>;
  hasEnoughInfo: boolean;
}

// Les 5 champs qui alimentent les scores (currentRateType est purement
// informatif, voir types/renewal.ts).
const SCORED_FIELDS: (keyof RenewalInput)[] = [
  "careerOutlook",
  "lifeChangeLikelihood",
  "stressTolerance",
  "priorityBalance",
  "financialBuffer",
];

/** Aperçu en direct pendant le quiz, calculé sur les réponses déjà données. */
export function computeLivePreview(answers: Partial<RenewalInput>): LivePreview {
  const answeredCount = SCORED_FIELDS.filter((f) => answers[f] !== undefined).length;

  const stabilityScore = calculateStabilityScore(answers);
  const horizonScore = calculateHorizonScore(answers);

  return {
    stabilityScore,
    horizonScore,
    rateType: stabilityScoreToRateType(stabilityScore),
    term: horizonScoreToTerm(horizonScore),
    hasEnoughInfo: answeredCount >= 2,
  };
}
