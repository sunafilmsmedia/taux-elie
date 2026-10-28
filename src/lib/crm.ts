import type { RenewalInput, RenewalResult } from "@/types/renewal";
import { RATE_TYPE_LABELS, TERM_LABELS } from "./scoring";
import {
  CAREER_OUTLOOK_LABELS,
  CURRENT_RATE_TYPE_LABELS,
  FINANCIAL_BUFFER_LABELS,
  LIFE_CHANGE_LABELS,
  PRIORITY_BALANCE_LABELS,
  STRESS_TOLERANCE_LABELS,
} from "./format";

/**
 * Payload CRM (format GoHighLevel) construit à partir du lead.
 * C'est l'objet que le courtier veut récupérer.
 */
export interface CrmPayload {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  // Segmentation jour/nuit remontée au premier niveau pour être visible
  // directement dans le webhook GHL.
  periode: "jour" | "nuit";
  lead_type: "lead_jour" | "lead_nuit";
  tags: string[];
  customFields: Record<string, string | number>;
}

/**
 * Segmentation jour/nuit selon l'heure du Québec (America/Toronto — gère
 * automatiquement l'heure d'été/hiver). Jour = 8h à 20h, Nuit = 20h à 8h.
 */
export function getLeadPeriod(): { periode: "jour" | "nuit"; lead_type: "lead_jour" | "lead_nuit" } {
  const hourStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    hour: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
  const hour = Number(hourStr) % 24;
  const isDay = hour >= 8 && hour < 20;
  return isDay
    ? { periode: "jour", lead_type: "lead_jour" }
    : { periode: "nuit", lead_type: "lead_nuit" };
}

export function buildCrmPayload(input: RenewalInput, result: RenewalResult): CrmPayload {
  const { periode, lead_type } = getLeadPeriod();

  const tags = [
    "Lead - Quiz renouvellement",
    `Suggestion - ${RATE_TYPE_LABELS[result.rateType]}`,
    `Suggestion - ${TERM_LABELS[result.term]}`,
    lead_type, // "lead_jour" ou "lead_nuit" — pour router le lead dans GHL
  ];

  return {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    periode,
    lead_type,
    tags,
    customFields: {
      careerOutlook: CAREER_OUTLOOK_LABELS[input.careerOutlook],
      lifeChangeLikelihood: LIFE_CHANGE_LABELS[input.lifeChangeLikelihood],
      stressTolerance: STRESS_TOLERANCE_LABELS[input.stressTolerance],
      priorityBalance: PRIORITY_BALANCE_LABELS[input.priorityBalance],
      financialBuffer: FINANCIAL_BUFFER_LABELS[input.financialBuffer],
      currentRateType: CURRENT_RATE_TYPE_LABELS[input.currentRateType],
      stabilityScore: result.stabilityScore,
      horizonScore: result.horizonScore,
      rateTypeSuggested: RATE_TYPE_LABELS[result.rateType],
      termSuggested: TERM_LABELS[result.term],
      periode,
      lead_type,
      aiResponse: result.aiResponse,
    },
  };
}

export interface CrmSyncResult {
  ok: boolean;
  error?: string;
}

// Webhook GoHighLevel / LeadConnector — à pointer vers le même CRM que
// consolidation-ia (même courtier, Elie) via la variable d'env. Volontairement
// PAS hardcodé ici (contrairement à consolidation-ia) : tant que la variable
// n'est pas définie, on logue le lead côté serveur au lieu de l'envoyer — ça
// évite d'empoisonner le CRM de production pendant le développement/les tests.
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL;

/**
 * Envoi du lead au CRM (POST JSON vers le webhook GoHighLevel/LeadConnector).
 * Un échec CRM ne doit jamais bloquer l'utilisateur (le lead est quand même
 * retourné à la personne).
 */
export async function sendToCrm(payload: CrmPayload): Promise<CrmSyncResult> {
  if (!CRM_WEBHOOK_URL) {
    console.log("[CRM_STUB] CRM_WEBHOOK_URL non défini — lead loggué localement :", payload);
    return { ok: true };
  }

  try {
    const res = await fetch(CRM_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { ok: false, error: `CRM_SYNC_FAILED: HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: `CRM_SYNC_FAILED: ${(e as Error).message}` };
  }
}
