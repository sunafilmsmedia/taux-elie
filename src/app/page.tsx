import Gauge from "@/components/ui/Gauge";
import BrokerCard from "@/components/ui/BrokerCard";
import TrackedLink from "@/components/ui/TrackedLink";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#04130f] to-black text-white">
      {/* En-tête avec logo */}
      <header className="mx-auto flex max-w-[1280px] justify-center px-6 pt-8 lg:justify-start">
        <span className="inline-flex rounded-xl bg-white px-3 py-2 shadow-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Alliance Hypothécaire" className="h-10 w-auto" />
        </span>
      </header>

      <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-6 py-10 lg:flex-row lg:items-center lg:py-16">
        {/* Colonne gauche */}
        <div className="flex-1 animate-fadeUp text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-200">
            <span className="h-2 w-2 rounded-full bg-savings" />
            Gratuit • Sans engagement • 2 minutes
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Taux{" "}
            <span className="neon-word inline-block pr-1 align-baseline text-[1.15em] leading-none">
              fixe
            </span>{" "}
            ou variable pour ton renouvellement?
          </h1>

          <p className="ai-gradient-text mt-6 text-lg font-semibold">
            Découvre ce qui correspond à TON profil, propulsé par l&apos;IA
          </p>

          <p className="mt-4 text-sm text-slate-400">
            Carrière, projets de vie, tolérance au stress financier — pas une prédiction des taux.
          </p>

          <div className="mt-8 flex justify-center">
            <TrackedLink
              href="/quiz"
              event="ViewContent"
              className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-brand to-ai px-8 text-base font-extrabold text-black shadow-glow transition hover:brightness-110 sm:w-auto"
            >
              Découvrir mon profil de renouvellement
            </TrackedLink>
          </div>

          <p className="mt-4 text-sm text-slate-400">
            Gratuit. Sans engagement. Aucun impact sur ton crédit.
          </p>
        </div>

        {/* Colonne droite */}
        <div className="flex w-full flex-col gap-4 lg:w-[40%]">
          <Gauge
            eyebrow="Ton profil de taux"
            score={0}
            label="À découvrir"
            description="Réponds à quelques questions pour voir ton profil se préciser."
            color="#00C9A7"
            hasEnoughInfo={false}
          />
          <BrokerCard />
        </div>
      </div>
    </main>
  );
}
