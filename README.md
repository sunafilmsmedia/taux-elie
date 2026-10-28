# Renouvellement IA — Taux fixe ou variable?

Quiz multi-étapes pour un courtier hypothécaire (Elie Ibrahim). Le visiteur qui renouvelle son
hypothèque répond à quelques questions sur sa carrière, ses projets de vie et sa tolérance au
stress financier. L'app en déduit **deux recommandations indépendantes** — taux fixe ou variable,
terme de 3 ou 5 ans — explique pourquoi via une analyse IA, et prépare un **lead prêt à envoyer au
CRM**.

Important : la recommandation repose uniquement sur le *profil personnel* de la personne, jamais
sur une prédiction de l'évolution des taux d'intérêt — voir `src/lib/ai.ts` (`SYSTEM_PROMPT`).

## Démarrage

```bash
npm install
npm run dev        # http://localhost:3000
```

## Statut des intégrations

| Service | État | Où le brancher |
|---|---|---|
| Scoring (taux + terme) | ✅ réel, en local | `src/lib/scoring.ts`, `recommendation.ts` |
| Taux du marché | 🟡 recherche web Claude, cache 12h | `src/lib/rates.ts` — nécessite `ANTHROPIC_API_KEY` |
| Réponse IA personnalisée | 🟡 **stub** sans clé | `src/lib/ai.ts` — nécessite `ANTHROPIC_API_KEY` |
| Envoi CRM | 🟡 **stub** (log serveur) sans URL | `src/lib/crm.ts` → définir `CRM_WEBHOOK_URL` |

Copie `.env.example` vers `.env.local` et remplis les clés au besoin. Sans clés, tout fonctionne
en mode stub : aucun taux chiffré affiché, texte IA générique, payload CRM imprimé en console.

## Flux

`/` (landing) → `/quiz` (questionnaire) → `POST /api/submit-lead` (validation Zod → scoring →
recommandation → taux du marché → IA → CRM) → `/results/[id]` → `/thank-you`.

## Données du lead (ce que le courtier récupère)

Le payload CRM est construit dans `src/lib/crm.ts` (`buildCrmPayload`) : coordonnées, profil
(carrière, changement de vie, tolérance au stress, priorité, marge financière, taux actuel),
scores, recommandation (taux + terme) et réponse IA, avec des tags automatiques.

## Configuration métier

Coordonnées du courtier (nom, téléphone, lien de prise de rendez-vous) : `src/lib/config.ts`.
Poids du scoring (taux fixe/variable, terme 3/5 ans) : `src/lib/scoring.ts`.
