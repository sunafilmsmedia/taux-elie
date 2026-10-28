import type {
  CareerOutlook,
  CurrentRateType,
  FinancialBuffer,
  LifeChangeLikelihood,
  PriorityBalance,
  StressTolerance,
} from "@/types/renewal";

export interface ChoiceOption<T = string> {
  label: string;
  value: T;
}

export const CAREER_OUTLOOK_OPTIONS: ChoiceOption<CareerOutlook>[] = [
  { label: "Probablement au même endroit, revenu similaire", value: "stable" },
  { label: "Même emploi, mais avec une progression de revenu probable", value: "raise_expected" },
  { label: "Je pense changer d'emploi ou de carrière", value: "job_change_likely" },
  { label: "Difficile à dire, plusieurs scénarios possibles", value: "uncertain" },
];

export const LIFE_CHANGE_OPTIONS: ChoiceOption<LifeChangeLikelihood>[] = [
  { label: "Non, je ne prévois rien de particulier", value: "unlikely" },
  { label: "Peut-être, rien de concret pour l'instant", value: "maybe" },
  { label: "Assez probablement dans les prochaines années", value: "likely" },
  { label: "Oui, c'est déjà prévu (déménagement, famille, etc.)", value: "planned" },
];

export const STRESS_TOLERANCE_OPTIONS: ChoiceOption<StressTolerance>[] = [
  { label: "Ça m'inquiéterait beaucoup — je veux savoir exactement ce que je paie", value: "very_stressed" },
  { label: "Un peu inconfortable, mais je m'ajusterais", value: "somewhat" },
  { label: "Pas de problème, j'ai une bonne marge de manœuvre", value: "comfortable" },
];

export const PRIORITY_BALANCE_OPTIONS: ChoiceOption<PriorityBalance>[] = [
  { label: "La tranquillité d'esprit — savoir exactement combien je paie chaque mois", value: "stability" },
  { label: "Un équilibre entre les deux", value: "balanced" },
  { label: "Le meilleur taux possible, même si ça peut fluctuer", value: "savings" },
];

export const FINANCIAL_BUFFER_OPTIONS: ChoiceOption<FinancialBuffer>[] = [
  { label: "Aucune — un coussin serait serré", value: "none" },
  { label: "Une certaine marge, sans plus", value: "some" },
  { label: "Oui, je suis à l'aise d'absorber une hausse", value: "comfortable" },
];

export const CURRENT_RATE_TYPE_OPTIONS: ChoiceOption<CurrentRateType>[] = [
  { label: "Taux fixe", value: "fixed" },
  { label: "Taux variable", value: "variable" },
  { label: "Je ne suis pas certain", value: "not_sure" },
];
