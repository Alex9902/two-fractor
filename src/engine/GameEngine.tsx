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

export default function GameEngine() {
  const [maxCompletado, setMaxCompletado] = useState<number>(() => {

    try {
      const saved = localStorage.getItem(PROGRESS_KEY);
      if (saved !== null) return parseInt(saved, 10);

      //migrado de la v1
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
      } catch { }
    }
  }, [nivelActivo, maxCompletado]);

  const handleBack = () => setNivelActivoId(null);

  const handleReiniciarProgreso = () => {
    //TODO: cambiar a modal
    if (confirm("¿Seguro que quieres reiniciar todo tu progreso?")) {
      setMaxCompletado(0);
      setNivelActivoId(null);
      try {
        localStorage.setItem(PROGRESS_KEY, "0");
      } catch { }
    }
  };

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
}
