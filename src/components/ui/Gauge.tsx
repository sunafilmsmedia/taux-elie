"use client";

interface GaugeProps {
  eyebrow: string;
  score: number;
  label: string;
  description: string;
  color: string;
  hasEnoughInfo: boolean;
  compact?: boolean;
}

export default function Gauge({
  eyebrow,
  score,
  label,
  description,
  color,
  hasEnoughInfo,
  compact = false,
}: GaugeProps) {
  const fill = hasEnoughInfo ? Math.max(score, 6) : 0;

  return (
    <div
      className={`relative rounded-3xl border border-white/15 bg-white/[0.03] p-6 backdrop-blur ${
        compact ? "" : "shadow-card"
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neon">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-neon/15">
          ⚡
        </span>
        {eyebrow}
      </div>

      <div className={`mt-5 flex items-end gap-5 ${compact ? "" : "min-h-[160px]"}`}>
        {/* Jauge verticale */}
        <div className="relative h-32 w-7 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute bottom-0 left-0 w-full rounded-full transition-all duration-700 ease-out"
            style={{
              height: `${fill}%`,
              background: `linear-gradient(180deg, ${color}, ${color}aa)`,
            }}
          />
        </div>

        <div className="flex-1">
          <div className="text-xl font-extrabold text-white transition-colors" style={{ color }}>
            {label}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{description}</p>
        </div>
      </div>
    </div>
  );
}
