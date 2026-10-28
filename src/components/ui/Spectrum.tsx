"use client";

interface SpectrumProps {
  leftLabel: string;
  rightLabel: string;
  value: number; // 0-100 : 0 = colle au pôle gauche, 100 = colle au pôle droit
  color: string;
  active?: boolean;
}

export default function Spectrum({ leftLabel, rightLabel, value, color, active = true }: SpectrumProps) {
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div>
      <div className="relative h-2.5 w-full rounded-full bg-white/10">
        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-black shadow-glow transition-all duration-700 ease-out"
          style={{ left: `${active ? pct : 50}%`, background: active ? color : "#4b5563" }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
