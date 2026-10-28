import type { RateTypeRecommendation, RenewalInput, TermRecommendation } from "@/types/renewal";
import { RATE_TYPE_LABELS, TERM_LABELS } from "./scoring";

export interface RecommendationContent {
  rateType: RateTypeRecommendation;
  term: TermRecommendation;
  rateTypeLabel: string;
  termLabel: string;
  rateMessage: string;
  termMessage: string;
  cta: string;
}

function buildRateMessage(input: RenewalInput, rateType: RateTypeRecommendation): string {
  if (rateType === "fixed") {
    const reasons: string[] = [];
    if (input.stressTolerance === "very_stressed") {
      reasons.push("une hausse imprévue de paiement t'inquiéterait beaucoup");
    }
    if (input.priorityBalance === "stability") {
      reasons.push("tu as dit que la tranquillité d'esprit compte plus que tout pour toi en ce moment");
    }
    if (input.financialBuffer === "none") {
      reasons.push("tu n'as pas vraiment de coussin financier pour absorber une hausse");
    }
    const why = reasons.length > 0 ? reasons.join(" et ") : "tu sembles préférer la prévisibilité";
    return `Ton profil penche vers un taux FIXE : ${why}. Un taux fixe te garantit le même paiement pendant tout le terme, peu importe ce que font les taux d'intérêt.`;
  }

  if (rateType === "variable") {
    const reasons: string[] = [];
    if (input.stressTolerance === "comfortable") {
      reasons.push("tu te sens à l'aise avec des fluctuations de paiement");
    }
    if (input.priorityBalance === "savings") {
      reasons.push("tu as dit viser le meilleur taux possible, même si ça peut bouger");
    }
    if (input.financialBuffer === "comfortable") {
      reasons.push("tu as une bonne marge financière pour absorber une hausse si jamais");
    }
    if (input.lifeChangeLikelihood === "planned" || input.lifeChangeLikelihood === "likely") {
      reasons.push("un changement de vie est probable, et un taux variable vient généralement avec une pénalité de rupture beaucoup plus basse qu'un taux fixe");
    }
    const why = reasons.length > 0 ? reasons.join(" et ") : "tu sembles tolérer assez bien l'incertitude";
    return `Ton profil penche vers un taux VARIABLE : ${why}. Un taux variable bouge avec le marché (à la hausse ou à la baisse), mais il offre généralement plus de flexibilité.`;
  }

  return "Ton profil est assez équilibré entre les deux options : ni un grand besoin de prévisibilité, ni une forte tolérance aux fluctuations ne se dégage clairement. Les deux se défendent pour toi — ça devient surtout une question de préférence personnelle à discuter avec ton courtier.";
}

function buildTermMessage(input: RenewalInput, term: TermRecommendation): string {
  if (term === "5") {
    const reasons: string[] = [];
    if (input.careerOutlook === "stable" || input.careerOutlook === "raise_expected") {
      reasons.push("ta carrière semble stable pour les prochaines années");
    }
    if (input.lifeChangeLikelihood === "unlikely" || input.lifeChangeLikelihood === "maybe") {
      reasons.push("tu ne prévois pas de changement de vie majeur à court terme");
    }
    const why = reasons.length > 0 ? reasons.join(" et ") : "ta situation semble relativement stable";
    return `Un terme de 5 ANS te conviendrait probablement mieux : ${why}. Tu te branches pour plus longtemps, sans avoir à renégocier aussi souvent.`;
  }

  const reasons: string[] = [];
  if (input.careerOutlook === "job_change_likely") {
    reasons.push("tu penses changer d'emploi ou de carrière");
  }
  if (input.careerOutlook === "uncertain") {
    reasons.push("ton avenir professionnel reste difficile à prévoir pour l'instant");
  }
  if (input.lifeChangeLikelihood === "planned" || input.lifeChangeLikelihood === "likely") {
    reasons.push("un changement de vie est assez probable dans les prochaines années");
  }
  const why = reasons.length > 0 ? reasons.join(" et ") : "ta situation pourrait évoluer dans les prochaines années";
  return `Un terme de 3 ANS te laisserait plus de flexibilité : ${why}. Tu pourrais revisiter tes options plus souvent, sans rester engagé aussi longtemps.`;
}

export function determineRecommendation(
  input: RenewalInput,
  rateType: RateTypeRecommendation,
  term: TermRecommendation
): RecommendationContent {
  return {
    rateType,
    term,
    rateTypeLabel: RATE_TYPE_LABELS[rateType],
    termLabel: TERM_LABELS[term],
    rateMessage: buildRateMessage(input, rateType),
    termMessage: buildTermMessage(input, term),
    cta: "Valider mon renouvellement avec un courtier",
  };
}
