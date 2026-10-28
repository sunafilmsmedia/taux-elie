import { z } from "zod";

const phoneRegex = /^[+]?[\d\s().-]{10,20}$/;

export const renewalInputSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis"),
  lastName: z.string().trim().optional(),
  email: z.string().trim().email("Courriel invalide"),
  phone: z.string().trim().regex(phoneRegex, "Numéro de téléphone invalide"),

  careerOutlook: z.enum(["stable", "raise_expected", "job_change_likely", "uncertain"]),
  lifeChangeLikelihood: z.enum(["unlikely", "maybe", "likely", "planned"]),
  stressTolerance: z.enum(["very_stressed", "somewhat", "comfortable"]),
  priorityBalance: z.enum(["stability", "balanced", "savings"]),
  financialBuffer: z.enum(["none", "some", "comfortable"]),
  currentRateType: z.enum(["fixed", "variable", "not_sure"]),

  consentContact: z.literal(true, {
    errorMap: () => ({ message: "Le consentement est requis" }),
  }),
});

export type ValidatedRenewalInput = z.infer<typeof renewalInputSchema>;
