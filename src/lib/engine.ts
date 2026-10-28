import type { RenewalInput, RenewalResult } from "@/types/renewal";
import {
  calculateHorizonScore,
  calculateStabilityScore,
  horizonScoreToTerm,
  stabilityScoreToRateType,
} from "./scoring";
import { determineRecommendation } from "./recommendation";
import { generateAnalysis } from "./ai";
import { getCurrentRates } from "./rates";

export interface EngineOutput {
  result: RenewalResult;
  aiGenerated: boolean;
}

/**
 * Pipeline complet : score -> recommandation -> taux du marché -> texte IA.
 * Utilisé côté serveur dans /api/submit-lead.
 */
export async function processLead(input: RenewalInput): Promise<EngineOutput> {
  const stabilityScore = calculateStabilityScore(input);
  const horizonScore = calculateHorizonScore(input);

  const rateType = stabilityScoreToRateType(stabilityScore);
  const term = horizonScoreToTerm(horizonScore);

  const recommendation = determineRecommendation(input, rateType, term);

  // Les taux du marché sont mis en cache côté serveur (voir lib/rates.ts) :
  // cet appel ne déclenche une recherche web que quelques fois par jour.
  const rates = await getCurrentRates();

  const partial: Omit<RenewalResult, "aiResponse"> = {
    stabilityScore,
    horizonScore,
    rateType,
    term,
    rateMessage: recommendation.rateMessage,
    termMessage: recommendation.termMessage,
    rates,
  };

  const ai = await generateAnalysis(input, partial, recommendation);

  return {
    result: { ...partial, aiResponse: ai.text },
    aiGenerated: ai.generated,
  };
}
