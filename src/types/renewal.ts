// Profil de carrière : influence surtout le choix du TERME (3 ans vs 5 ans).
export type CareerOutlook =
  | "stable"
  | "raise_expected"
  | "job_change_likely"
  | "uncertain";

// Probabilité de déménager / vivre un changement de vie majeur.
export type LifeChangeLikelihood = "unlikely" | "maybe" | "likely" | "planned";

// Tolérance au stress si le paiement hypothécaire fluctuait.
export type StressTolerance = "very_stressed" | "somewhat" | "comfortable";

// Ce qui compte le plus pour la personne en ce moment.
export type PriorityBalance = "stability" | "balanced" | "savings";

// Marge financière pour absorber une hausse de paiement (taux variable).
export type FinancialBuffer = "none" | "some" | "comfortable";

// Type de taux actuel — informatif seulement, n'influence pas le score.
export type CurrentRateType = "fixed" | "variable" | "not_sure";

export type RateTypeRecommendation = "fixed" | "variable" | "balanced";
export type TermRecommendation = "3" | "5";

export interface RenewalInput {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;

  careerOutlook: CareerOutlook;
  lifeChangeLikelihood: LifeChangeLikelihood;
  stressTolerance: StressTolerance;
  priorityBalance: PriorityBalance;
  financialBuffer: FinancialBuffer;
  currentRateType: CurrentRateType;

  consentContact: boolean;
}

export interface RateSnapshot {
  fixed3yr: number | null;
  fixed5yr: number | null;
  variable: number | null;
  sourceName: string | null;
  sourceUrl: string | null;
  asOfDate: string | null;
  fetchedAt: number;
  generated: boolean;
}

export interface RenewalResult {
  stabilityScore: number;
  horizonScore: number;

  rateType: RateTypeRecommendation;
  term: TermRecommendation;

  rateMessage: string;
  termMessage: string;
  counterfactualLabel: string | null;
  counterfactualMessage: string | null;

  rates: RateSnapshot;
  aiResponse: string;
}

export interface SubmitLeadResponse {
  success: boolean;
  leadId: string;
  resultUrl: string;
  result: RenewalResult;
}
