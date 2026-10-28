import Anthropic from "@anthropic-ai/sdk";
import type { RenewalInput, RenewalResult } from "@/types/renewal";
import {
  CAREER_OUTLOOK_LABELS,
  CURRENT_RATE_TYPE_LABELS,
  FINANCIAL_BUFFER_LABELS,
  LIFE_CHANGE_LABELS,
  PRIORITY_BALANCE_LABELS,
  STRESS_TOLERANCE_LABELS,
} from "./format";
import type { RecommendationContent } from "./recommendation";

/**
 * Génération de la réponse IA personnalisée (côté serveur uniquement).
 *
 * Si ANTHROPIC_API_KEY est défini, on appelle l'API Anthropic (Claude). Sinon
 * (ou en cas d'échec), on retombe proprement sur un texte construit localement —
 * le formulaire ne casse jamais et l'utilisateur voit toujours un résultat.
 */

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5";

export const SYSTEM_PROMPT = `Tu es un assistant spécialisé en vulgarisation hypothécaire pour un courtier hypothécaire au Canada.
Ton rôle est d'aider une personne qui renouvelle son hypothèque à comprendre pourquoi un taux FIXE ou VARIABLE, et un terme de 3 ou 5 ans, correspond mieux à SON profil personnel (carrière, projets de vie, tolérance au stress financier).
Règle la plus importante : tu ne dois JAMAIS prédire si les taux d'intérêt vont monter, baisser ou rester stables. Personne ne peut prédire les taux, et ce n'est jamais la base de la recommandation.
La recommandation repose UNIQUEMENT sur le profil et la tolérance personnelle de l'utilisateur, jamais sur une anticipation du marché.
Tu ne dois jamais garantir qu'un choix sera financièrement meilleur que l'autre.
Tu ne dois jamais présenter un taux affiché comme garanti ou disponible sans vérification — précise toujours qu'il faut le confirmer avec un courtier.
Tu dois toujours préciser que cette recommandation est basée sur les réponses fournies, pas une garantie.
Tu dois encourager l'utilisateur à valider son choix avec un courtier hypothécaire avant de signer son renouvellement.
Écris dans un français québécois professionnel, simple et humain. Ne sois pas trop technique.
Maximum 220 mots. Structure ta réponse en 4 sections avec ces titres exacts, chacun sur sa propre ligne :
Résumé simple
Ce que ton profil suggère
Pourquoi ça te correspond
Prochaine étape recommandée`;

export interface AIResult {
  text: string;
  generated: boolean;
}

export async function generateAnalysis(
  input: RenewalInput,
  result: Omit<RenewalResult, "aiResponse">,
  recommendation: RecommendationContent
): Promise<AIResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return { text: buildLocalAnalysis(input, recommendation), generated: false };
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(input, result, recommendation) }],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!text) throw new Error("Réponse IA vide");
    return { text, generated: true };
  } catch (e) {
    console.error("AI_GENERATION_FAILED", e);
    return { text: buildLocalAnalysis(input, recommendation), generated: false };
  }
}

function buildUserPrompt(
  input: RenewalInput,
  result: Omit<RenewalResult, "aiResponse">,
  recommendation: RecommendationContent
): string {
  return `Voici le profil d'une personne qui renouvelle son hypothèque, recueilli via un questionnaire :

Prénom : ${input.firstName}
Perspective de carrière (5 ans) : ${CAREER_OUTLOOK_LABELS[input.careerOutlook]}
Probabilité de changement de vie (déménagement, famille, etc.) : ${LIFE_CHANGE_LABELS[input.lifeChangeLikelihood]}
Réaction à une hausse imprévue de paiement : ${STRESS_TOLERANCE_LABELS[input.stressTolerance]}
Priorité actuelle : ${PRIORITY_BALANCE_LABELS[input.priorityBalance]}
Marge financière disponible : ${FINANCIAL_BUFFER_LABELS[input.financialBuffer]}
Type de taux actuel : ${CURRENT_RATE_TYPE_LABELS[input.currentRateType]}

Recommandation calculée par notre moteur (à expliquer, pas à remettre en question) :
Type de taux suggéré : ${recommendation.rateTypeLabel}
Raison interne (taux) : ${recommendation.rateMessage}
Terme suggéré : ${recommendation.termLabel}
Raison interne (terme) : ${recommendation.termMessage}

Génère la réponse personnalisée en 4 sections (titres exacts demandés dans tes consignes), adressée directement à ${input.firstName}.
Explique le type de taux ET le terme suggérés, en te basant sur SON profil — jamais sur une prédiction de l'évolution des taux.
Utilise des termes comme « selon ton profil », « semble te correspondre », « à valider ». Ne garantis jamais que ce choix sera le plus avantageux financièrement.`;
}

function buildLocalAnalysis(input: RenewalInput, recommendation: RecommendationContent): string {
  return [
    "Résumé simple",
    `Bonjour ${input.firstName}, selon tes réponses, ton profil penche vers un ${recommendation.rateTypeLabel.toLowerCase()} et un ${recommendation.termLabel.toLowerCase()}.`,
    "",
    "Ce que ton profil suggère",
    recommendation.rateMessage,
    "",
    "Pourquoi ça te correspond",
    recommendation.termMessage,
    "",
    "Prochaine étape recommandée",
    "Personne ne peut prédire avec certitude l'évolution des taux d'intérêt — cette suggestion est basée sur ton profil, pas sur une anticipation du marché. La meilleure prochaine étape serait d'en discuter avec un courtier hypothécaire qui pourra confirmer les taux réellement disponibles et valider ce choix avec toi, sans engagement.",
  ].join("\n");
}
