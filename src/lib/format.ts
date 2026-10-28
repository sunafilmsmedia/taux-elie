import type {
  CareerOutlook,
  CurrentRateType,
  FinancialBuffer,
  LifeChangeLikelihood,
  PriorityBalance,
  StressTolerance,
} from "@/types/renewal";

export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

// Les taux (RateSnapshot) sont déjà stockés comme pourcentages (ex: 4.19),
// pas comme fractions décimales — pas de multiplication par 100 ici.
export function formatRatePercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toLocaleString("fr-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
}

export const CAREER_OUTLOOK_LABELS: Record<CareerOutlook, string> = {
  stable: "Probablement au même endroit, revenu similaire",
  raise_expected: "Même emploi, progression de revenu probable",
  job_change_likely: "Changement d'emploi ou de carrière probable",
  uncertain: "Difficile à dire, plusieurs scénarios possibles",
};

export const LIFE_CHANGE_LABELS: Record<LifeChangeLikelihood, string> = {
  unlikely: "Rien de particulier prévu",
  maybe: "Peut-être, rien de concret",
  likely: "Assez probable dans les prochaines années",
  planned: "Déjà prévu",
};

export const STRESS_TOLERANCE_LABELS: Record<StressTolerance, string> = {
  very_stressed: "Serait très inquiet(ète)",
  somewhat: "Un peu inconfortable, mais s'ajusterait",
  comfortable: "À l'aise, bonne marge de manœuvre",
};

export const PRIORITY_BALANCE_LABELS: Record<PriorityBalance, string> = {
  stability: "La tranquillité d'esprit avant tout",
  balanced: "Un équilibre entre les deux",
  savings: "Le meilleur taux possible, même si ça fluctue",
};

export const FINANCIAL_BUFFER_LABELS: Record<FinancialBuffer, string> = {
  none: "Aucun coussin financier",
  some: "Une certaine marge",
  comfortable: "Bonne marge financière",
};

export const CURRENT_RATE_TYPE_LABELS: Record<CurrentRateType, string> = {
  fixed: "Taux fixe",
  variable: "Taux variable",
  not_sure: "Ne sait pas",
};
