import { useState, useCallback } from "react";
import type { RegisteredLevel } from "./types";
import SelectorOficial from "../shared/SelectorOficial";
import SelectorComunidad from "../shared/SelectorComunidad";

import Lvl1 from "../levels/official/lvl1";
import lvl1Manifest from "../levels/official/lvl1/manifest";
import Lvl2 from "../levels/official/lvl2";
import lvl2Manifest from "../levels/official/lvl2/manifest";

const OFFICIAL_LEVELS: RegisteredLevel[] = [
  { manifest: lvl1Manifest, Component: Lvl1 },
  { manifest: lvl2Manifest, Component: Lvl2 },
];

const PROGRESS_KEY = "two-fractor-progress";

type SelectorMode = "oficial" | "comunidad";

const SvgGithub = () => (
  <svg
    className="w-3.5 h-3.5 inline-block fill-current"
    viewBox="0 0 24 24"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export default function GameEngine() {
  const [maxCompletado, setMaxCompletado] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_KEY);
      if (saved !== null) return parseInt(saved, 10);

      const legacy = localStorage.getItem("two-fractor-progress");
      if (legacy !== null) return Math.max(0, parseInt(legacy, 10) - 1);

      return 0;
    } catch {
      return 0;
    }
  });

  const [nivelActivoId, setNivelActivoId] = useState<string | null>(null);
  const [modoSelector, setModoSelector] = useState<SelectorMode>("oficial");

  const nivelActivo = nivelActivoId
    ? OFFICIAL_LEVELS.find((l) => l.manifest.id === nivelActivoId) ?? null
    : null;

  const handleComplete = useCallback(() => {
    if (!nivelActivo) return;

    const order = nivelActivo.manifest.order;

    if (order > maxCompletado) {
      const nuevoMax = order;
      setMaxCompletado(nuevoMax);
      try {
        localStorage.setItem(PROGRESS_KEY, nuevoMax.toString());
      } catch {}
    }
  }, [nivelActivo, maxCompletado]);

  const handleBack = () => setNivelActivoId(null);

  const handleReiniciarProgreso = () => {
    if (confirm("¿Seguro que quieres reiniciar todo tu progreso?")) {
      setMaxCompletado(0);
      setNivelActivoId(null);
      try {
        localStorage.setItem(PROGRESS_KEY, "0");
      } catch {}
    }
  };

  const renderContent = () => {
    if (nivelActivo) {
      const { Component, manifest } = nivelActivo;
      const isCompleted = manifest.order <= maxCompletado;

      return (
        <Component
          onComplete={handleComplete}
          onBack={handleBack}
          isCompleted={isCompleted}
        />
      );
    }

    if (modoSelector === "comunidad") {
      return <SelectorComunidad onBack={() => setModoSelector("oficial")} />;
    }

    return (
      <SelectorOficial
        niveles={OFFICIAL_LEVELS}
        maxCompletado={maxCompletado}
        onSelectNivel={(id) => setNivelActivoId(id)}
        onAbrirComunidad={() => setModoSelector("comunidad")}
        onReiniciarProgreso={handleReiniciarProgreso}
      />
    );
  };

  const renderFooter = () => {
    if (nivelActivo) {
      const { manifest } = nivelActivo;
      const gh = manifest.github ? manifest.github.replace(/^@/, "") : manifest.autor.replace(/^@/, "");

      return (
        <footer className="py-3 my-2 sm:my-3 text-center text-[10px] sm:text-xs font-black uppercase tracking-wider text-black/60 shrink-0 z-50 flex items-center justify-center gap-1.5 flex-wrap">
          <span>Creado por:</span>
          <a
            href={`https://github.com/${gh}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 hover:text-black cursor-pointer bg-white border-2 border-black px-2 py-0.5 rounded shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] transition-transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px]"
            title={`Perfil de GitHub de ${gh}`}
          >
            <SvgGithub />
            <span>@{gh}</span>
          </a>
        </footer>
      );
    }

    return (
      <footer className="py-3 my-2 sm:my-3 text-center text-[10px] sm:text-xs font-black uppercase tracking-wider text-black/50 shrink-0 z-50 flex items-center justify-center gap-1.5 flex-wrap">
        <span>Two Fractor · Diseñado por Alex Rojas Perez</span>
        <a
          href="https://github.com/Alex9902"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 hover:text-black cursor-pointer bg-white border-2 border-black px-2 py-0.5 rounded shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] transition-transform hover:scale-105 active:translate-x-[1px] active:translate-y-[1px]"
          title="GitHub de Alex9902"
        >
          <SvgGithub />
          <span>@Alex9902</span>
        </a>
      </footer>
    );
  };

  return (
    <div className="w-full h-full flex flex-col justify-between items-center">
      <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0">
        {renderContent()}
      </div>
      {renderFooter()}
    </div>
  );
}
