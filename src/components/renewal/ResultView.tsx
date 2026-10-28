"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { RenewalResult } from "@/types/renewal";
import { RATE_TYPE_LABELS, TERM_LABELS } from "@/lib/scoring";
import { formatRatePercent } from "@/lib/format";
import { renewalConfig } from "@/lib/config";
import { trackPixel } from "@/lib/pixel";
import BrokerCard from "@/components/ui/BrokerCard";

interface StoredResult {
  result: RenewalResult;
  firstName: string;
}

export default function ResultView({ leadId }: { leadId: string }) {
  const [data, setData] = useState<StoredResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(`result:${leadId}`);
    if (raw) {
      setData(JSON.parse(raw) as StoredResult);
      const firedKey = `lead-fired:${leadId}`;
      if (!sessionStorage.getItem(firedKey)) {
        trackPixel("Lead");
        sessionStorage.setItem(firedKey, "1");
      }
    }
    setLoaded(true);
  }, [leadId]);

  if (loaded && !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-6 text-center text-white">
        <div>
          <h1 className="text-2xl font-bold">Résultat introuvable</h1>
          <p className="mt-3 text-slate-400">
            Ton résultat n&apos;est plus disponible. Tu peux refaire le quiz en quelques minutes.
          </p>
          <Link
            href="/quiz"
            className="mt-6 inline-flex h-12 items-center rounded-2xl bg-gradient-to-r from-brand to-ai px-6 font-extrabold text-black"
          >
            Recommencer
          </Link>
        </div>
      </main>
    );
  }

  if (!data) {
    return <main className="min-h-screen bg-ink" />;
  }

  const { result, firstName } = data;
  const rateTypeLabel = RATE_TYPE_LABELS[result.rateType];
  const termLabel = TERM_LABELS[result.term];
  const hasRates = result.rates.generated && (result.rates.fixed3yr || result.rates.fixed5yr || result.rates.variable);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#04130f] to-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="animate-fadeUp">
          <span className="ai-gradient-text text-sm font-bold uppercase tracking-wide">
            Ton analyse IA
          </span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
            {firstName} — ton profil penche vers {rateTypeLabel.toLowerCase()}.
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Selon tes réponses, un {termLabel.toLowerCase()} te conviendrait aussi probablement
            mieux. Ce résultat reflète ton profil personnel — pas une prédiction de l&apos;évolution
            des taux.
          </p>
        </div>

        {/* Cartes de recommandation */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <ResultCard label="Type de taux suggéré" value={rateTypeLabel} accent="ai" />
          <ResultCard label="Terme suggéré" value={termLabel} accent="brand" />
        </div>

        {/* Explications */}
        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm leading-relaxed text-slate-200 sm:text-base">{result.rateMessage}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm leading-relaxed text-slate-200 sm:text-base">{result.termMessage}</p>
          </div>
        </div>

        {/* Taux du marché */}
        <div className="mt-8 rounded-3xl border border-ai/30 bg-ai/5 p-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Taux actuellement observés sur le marché
          </div>
          {hasRates ? (
            <>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <RateFigure label="Fixe 3 ans" value={result.rates.fixed3yr} />
                <RateFigure label="Fixe 5 ans" value={result.rates.fixed5yr} />
                <RateFigure label="Variable" value={result.rates.variable} />
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Source : {result.rates.sourceName ?? "comparateur en ligne"}
                {result.rates.asOfDate ? ` — en date du ${result.rates.asOfDate}` : ""}. À titre
                indicatif seulement : les taux fluctuent et ton taux réel dépendra de ton dossier.
                Personne ne peut prédire s&apos;ils vont monter ou baisser.
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Les taux fluctuent quotidiennement — {renewalConfig.brokerName} pourra te donner les
              taux exacts du jour lors de votre appel.
            </p>
          )}
        </div>

        {/* Réponse IA */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <span>⚡</span> Ton analyse personnalisée
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-slate-200">
            {result.aiResponse.split("\n").map((line, i) =>
              line.trim() === "" ? <div key={i} className="h-1" /> : <p key={i}>{line}</p>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-slate-400">
          Ce résultat est fourni à titre informatif seulement, selon ton profil de réponses. Il ne
          constitue pas un conseil financier personnalisé ni une prédiction de l&apos;évolution des
          taux d&apos;intérêt. Les taux affichés peuvent varier et doivent être confirmés avec un
          courtier hypothécaire avant toute décision de renouvellement.
        </p>

        {/* Carte courtier */}
        <div className="mt-8">
          <BrokerCard />
        </div>

        {/* CTA */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={renewalConfig.calendarLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-14 flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-brand to-ai px-6 text-base font-extrabold text-black shadow-glow transition hover:brightness-110"
          >
            Valider mon renouvellement avec un courtier
          </a>
          <Link
            href="/thank-you"
            className="inline-flex h-14 flex-1 items-center justify-center rounded-2xl border border-white/15 px-6 text-base font-semibold text-slate-200 transition hover:bg-white/5"
          >
            Recevoir mon analyse par courriel
          </Link>
        </div>
      </div>
    </main>
  );
}

function RateFigure({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-2xl bg-black/20 p-4 text-center">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-extrabold text-ai">{formatRatePercent(value)}</div>
    </div>
  );
}

function ResultCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "ai" | "brand";
}) {
  const accentClass = accent === "ai" ? "text-ai" : "text-white";
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-2 text-2xl font-extrabold ${accentClass}`}>{value}</div>
    </div>
  );
}
