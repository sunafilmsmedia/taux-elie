import BrokerCard from "@/components/ui/BrokerCard";
import TrackedLink from "@/components/ui/TrackedLink";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-black via-[#04130f] to-black text-white">
      {/* En-tête avec logo */}
      <header className="mx-auto flex w-full max-w-[1280px] justify-center px-6 pt-8">
        <span className="inline-flex rounded-xl bg-white px-3 py-2 shadow-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Alliance Hypothécaire" className="h-10 w-auto" />
        </span>
      </header>

      {/* Accroche centrée au milieu de la page */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center animate-fadeUp">
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

      {/* Elie en bas de page */}
      <div className="mx-auto w-full max-w-md px-6 pb-16">
        <BrokerCard />
      </div>
    </main>
  );
}
