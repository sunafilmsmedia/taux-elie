"use client";

import { useEffect, useState } from "react";

const SWITCH_MS = 5000;
const NEON = "#00C9A7";
const AMBER = "#F97316";

export default function HookHeadline() {
  // true = "fixe" est neon et "variable" est ambre ; false = l'inverse.
  const [fixeIsNeon, setFixeIsNeon] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setFixeIsNeon((v) => !v), SWITCH_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
      Taux{" "}
      <span
        className="neon-word inline-block pr-1 align-baseline text-[1.15em] leading-none transition-colors duration-700"
        style={{ color: fixeIsNeon ? NEON : AMBER }}
      >
        fixe
      </span>{" "}
      ou{" "}
      <span
        className="neon-word inline-block pr-1 align-baseline text-[1.15em] leading-none transition-colors duration-700"
        style={{ color: fixeIsNeon ? AMBER : NEON }}
      >
        variable
      </span>{" "}
      pour ton renouvellement?
    </h1>
  );
}
