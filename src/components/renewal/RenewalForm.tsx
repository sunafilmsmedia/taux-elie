"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { RenewalInput } from "@/types/renewal";
import Gauge from "@/components/ui/Gauge";
import ProgressBar from "@/components/ui/ProgressBar";
import LoadingAI from "./LoadingAI";
import { computeLivePreview } from "@/lib/livePreview";
import { RATE_TYPE_LABELS, TERM_LABELS } from "@/lib/scoring";
import {
  CAREER_OUTLOOK_OPTIONS,
  CURRENT_RATE_TYPE_OPTIONS,
  FINANCIAL_BUFFER_OPTIONS,
  LIFE_CHANGE_OPTIONS,
  PRIORITY_BALANCE_OPTIONS,
  STRESS_TOLERANCE_OPTIONS,
  type ChoiceOption,
} from "./questions";

type StepKey =
  | "careerOutlook"
  | "lifeChangeLikelihood"
  | "stressTolerance"
  | "priorityBalance"
  | "financialBuffer"
  | "currentRateType"
  | "contact";

const STEPS: StepKey[] = [
  "careerOutlook",
  "lifeChangeLikelihood",
  "stressTolerance",
  "priorityBalance",
  "financialBuffer",
  "currentRateType",
  "contact",
];

interface Answers extends Partial<RenewalInput> {
  fullName?: string;
}

const GAUGE_COLOR = "#00C9A7";

export default function RenewalForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clampedIndex = Math.min(stepIndex, STEPS.length - 1);
  const currentStep = STEPS[clampedIndex];

  const preview = useMemo(() => computeLivePreview(answers), [answers]);
  const showMobilePreview = preview.hasEnoughInfo && currentStep !== "contact";

  function update(patch: Answers) {
    setAnswers((prev) => ({ ...prev, ...patch }));
    setError(null);
  }

  function goNext() {
    if (clampedIndex < STEPS.length - 1) setStepIndex(clampedIndex + 1);
  }

  function goBack() {
    if (clampedIndex > 0) setStepIndex(clampedIndex - 1);
  }

  const canContinue = useMemo(() => validateStep(currentStep, answers), [currentStep, answers]);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const payload = buildPayload(answers);
    const startedAt = Date.now();

    try {
      const res = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Il manque quelques informations avant de générer ton résultat.");
        setSubmitting(false);
        return;
      }

      const elapsed = Date.now() - startedAt;
      const wait = Math.max(1000 - elapsed, 0);
      sessionStorage.setItem(
        `result:${data.leadId}`,
        JSON.stringify({ result: data.result, firstName: payload.firstName })
      );
      setTimeout(() => router.push(data.resultUrl), wait);
    } catch {
      setError("Une erreur est survenue. Réessaie dans un instant.");
      setSubmitting(false);
    }
  }

  if (submitting) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-[#04130f] to-black text-white">
        <LoadingAI />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#04130f] to-black text-white">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-10 lg:grid-cols-[1fr_360px] lg:py-16">
        <div>
          {showMobilePreview && (
            <div className="sticky top-3 z-20 mb-5 lg:hidden">
              <div className="rounded-2xl border border-neon/30 bg-[#04130f]/90 px-4 py-3 text-center shadow-glow backdrop-blur">
                <span className="ai-gradient-text text-[10px] font-bold uppercase tracking-wide">
                  Ton profil en direct
                </span>
                <p className="mt-0.5 text-base font-extrabold text-neon">
                  <span className="select-none blur-[6px]">
                    {RATE_TYPE_LABELS[preview.rateType]} · {TERM_LABELS[preview.term]}
                  </span>
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-white/50">
                  🔒 Débloque les détails à la fin
                </p>
              </div>
            </div>
          )}

          <ProgressBar current={clampedIndex + 1} total={STEPS.length} />

          <div key={currentStep} className="mt-8 animate-fadeUp">
            <StepContent step={currentStep} answers={answers} update={update} advance={goNext} />
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-alert/40 bg-alert/10 px-4 py-3 text-sm text-orange-200">
              {error}
            </p>
          )}

          <div className="mt-8 flex items-center gap-3">
            {clampedIndex > 0 && (
              <button
                onClick={goBack}
                className="h-14 rounded-2xl border border-white/15 px-6 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >
                Retour
              </button>
            )}
            {currentStep === "contact" ? (
              <button
                onClick={handleSubmit}
                disabled={!canContinue}
                className="h-14 flex-1 rounded-2xl bg-gradient-to-r from-brand to-ai px-8 text-base font-extrabold text-black shadow-glow transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Voir mon résultat IA
              </button>
            ) : (
              <p className="text-sm text-white/40">Touche une réponse pour continuer →</p>
            )}
          </div>
        </div>

        <aside className="hidden flex-col gap-4 lg:flex">
          <Gauge
            eyebrow="Ton profil de taux"
            score={preview.stabilityScore}
            label={preview.hasEnoughInfo ? RATE_TYPE_LABELS[preview.rateType] : "À découvrir"}
            description={
              preview.hasEnoughInfo
                ? "Basé sur ta tolérance au stress financier et tes priorités."
                : "Réponds à quelques questions pour voir ton profil se préciser."
            }
            color={GAUGE_COLOR}
            hasEnoughInfo={preview.hasEnoughInfo}
            compact
          />
          <Gauge
            eyebrow="Ton horizon"
            score={preview.horizonScore}
            label={preview.hasEnoughInfo ? TERM_LABELS[preview.term] : "À découvrir"}
            description={
              preview.hasEnoughInfo
                ? "Basé sur ta carrière et tes projets de vie à venir."
                : "Réponds à quelques questions pour voir ton horizon se préciser."
            }
            color={GAUGE_COLOR}
            hasEnoughInfo={preview.hasEnoughInfo}
            compact
          />
        </aside>
      </div>
    </main>
  );
}

/* --------------------------- Validation par étape --------------------------- */

function validateStep(step: StepKey, a: Answers): boolean {
  switch (step) {
    case "careerOutlook":
      return !!a.careerOutlook;
    case "lifeChangeLikelihood":
      return !!a.lifeChangeLikelihood;
    case "stressTolerance":
      return !!a.stressTolerance;
    case "priorityBalance":
      return !!a.priorityBalance;
    case "financialBuffer":
      return !!a.financialBuffer;
    case "currentRateType":
      return !!a.currentRateType;
    case "contact":
      return (
        !!a.fullName?.trim() &&
        !!a.email?.trim() &&
        /.+@.+\..+/.test(a.email ?? "") &&
        !!a.phone?.trim() &&
        a.consentContact === true
      );
    default:
      return false;
  }
}

/* ------------------------------- Payload final ------------------------------ */

function buildPayload(a: Answers): RenewalInput {
  const nameParts = (a.fullName ?? "").trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") || undefined;

  return {
    firstName,
    lastName,
    email: a.email?.trim() ?? "",
    phone: a.phone?.trim() ?? "",
    careerOutlook: a.careerOutlook!,
    lifeChangeLikelihood: a.lifeChangeLikelihood!,
    stressTolerance: a.stressTolerance!,
    priorityBalance: a.priorityBalance!,
    financialBuffer: a.financialBuffer!,
    currentRateType: a.currentRateType!,
    consentContact: a.consentContact === true,
  };
}

/* ------------------------------- Rendu étapes ------------------------------- */

interface StepContentProps {
  step: StepKey;
  answers: Answers;
  update: (patch: Answers) => void;
  advance: () => void;
}

function StepContent({ step, answers, update, advance }: StepContentProps) {
  const pick = (patch: Answers) => {
    update(patch);
    advance();
  };

  switch (step) {
    case "careerOutlook":
      return (
        <SingleChoice
          title="Où te vois-tu professionnellement dans 5 ans?"
          subtitle="Ça aide à choisir entre un terme de 3 ou 5 ans."
          options={CAREER_OUTLOOK_OPTIONS}
          value={answers.careerOutlook}
          onSelect={(v) => pick({ careerOutlook: v })}
        />
      );
    case "lifeChangeLikelihood":
      return (
        <SingleChoice
          title="Penses-tu déménager ou vivre un changement de vie important?"
          subtitle="Nouvelle ville, couple, famille — dans les prochaines années."
          options={LIFE_CHANGE_OPTIONS}
          value={answers.lifeChangeLikelihood}
          onSelect={(v) => pick({ lifeChangeLikelihood: v })}
        />
      );
    case "stressTolerance":
      return (
        <SingleChoice
          title="Si ton paiement hypothécaire augmentait de façon imprévisible pendant quelques mois, comment réagirais-tu?"
          options={STRESS_TOLERANCE_OPTIONS}
          value={answers.stressTolerance}
          onSelect={(v) => pick({ stressTolerance: v })}
        />
      );
    case "priorityBalance":
      return (
        <SingleChoice
          title="Qu'est-ce qui compte le plus pour toi en ce moment?"
          options={PRIORITY_BALANCE_OPTIONS}
          value={answers.priorityBalance}
          onSelect={(v) => pick({ priorityBalance: v })}
        />
      );
    case "financialBuffer":
      return (
        <SingleChoice
          title="As-tu un coussin financier pour absorber une hausse de paiement si jamais ton taux variable augmentait?"
          options={FINANCIAL_BUFFER_OPTIONS}
          value={answers.financialBuffer}
          onSelect={(v) => pick({ financialBuffer: v })}
        />
      );
    case "currentRateType":
      return (
        <SingleChoice
          title="Quel est ton type de taux actuel?"
          subtitle="Juste pour qu'on comprenne mieux ton dossier."
          options={CURRENT_RATE_TYPE_OPTIONS}
          value={answers.currentRateType}
          onSelect={(v) => pick({ currentRateType: v })}
        />
      );
    case "contact":
      return <ContactStep answers={answers} update={update} />;
    default:
      return null;
  }
}

/* ------------------------------ Sous-composants ----------------------------- */

function StepTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
    </div>
  );
}

function SingleChoice<T extends string>({
  title,
  subtitle,
  options,
  value,
  onSelect,
}: {
  title: string;
  subtitle?: string;
  options: ChoiceOption<T>[];
  value?: T;
  onSelect: (v: T) => void;
}) {
  return (
    <div>
      <StepTitle title={title} subtitle={subtitle} />
      <div className="grid gap-3">
        {options.map((opt) => (
          <OptionButton
            key={opt.value}
            label={opt.label}
            selected={value === opt.value}
            onClick={() => onSelect(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition ${
        selected
          ? "border-ai bg-ai/15 text-white shadow-glow"
          : "border-white/12 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/10"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
          selected ? "border-ai bg-ai text-white" : "border-white/30"
        }`}
      >
        {selected ? "✓" : ""}
      </span>
      {label}
    </button>
  );
}

function ContactStep({ answers, update }: { answers: Answers; update: (patch: Answers) => void }) {
  const preview = computeLivePreview(answers);

  return (
    <div>
      <div className="rounded-2xl border border-neon/30 bg-neon/5 p-4 text-center">
        <span className="ai-gradient-text text-[11px] font-bold uppercase tracking-wide">
          Ton profil de renouvellement
        </span>
        <p className="mt-1 text-sm text-white/70">Selon tes réponses, ton profil penche vers</p>
        <p className="mt-0.5 text-xl font-extrabold text-neon sm:text-2xl">
          <span className="select-none blur-[7px]">
            {RATE_TYPE_LABELS[preview.rateType]} · {TERM_LABELS[preview.term]}
          </span>
        </p>
        <p className="mt-1.5 text-xs font-semibold text-neon">
          🔒 Laisse tes coordonnées ci-dessous pour dévoiler le détail
        </p>
      </div>

      <h2 className="mt-4 text-lg font-extrabold leading-tight">
        Reçois ton analyse complète
      </h2>
      <p className="mt-0.5 text-xs text-white/50">
        Elie analyse ton profil et peut te confirmer les taux réellement disponibles. Gratuit,
        sans engagement.
      </p>

      <div className="mt-3 space-y-2.5">
        <Field label="Nom complet" value={answers.fullName ?? ""} onChange={(v) => update({ fullName: v })} />
        <Field
          label="Courriel"
          type="email"
          value={answers.email ?? ""}
          onChange={(v) => update({ email: v })}
        />
        <Field
          label="Numéro de téléphone"
          type="tel"
          value={answers.phone ?? ""}
          onChange={(v) => update({ phone: v })}
        />
      </div>

      <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs text-slate-300">
        <input
          type="checkbox"
          checked={answers.consentContact === true}
          onChange={(e) => update({ consentContact: e.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-white/30 accent-ai"
        />
        J&apos;accepte d&apos;être contacté au sujet de mon analyse et de mon renouvellement
        hypothécaire.
      </label>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-ai focus:outline-none"
      />
    </label>
  );
}
