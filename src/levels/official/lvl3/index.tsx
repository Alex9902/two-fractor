import { useState, useMemo, useCallback, useEffect } from "react";
import type { LevelProps } from "../../../engine/types";
import PortatilFondo from "./components/PortatilFondo";
import BomboBingo from "./components/BomboBingo";
import CartonBingo, { CasillaBingo } from "./components/CartonBingo";
import AuthorBadge from "../../../shared/AuthorBadge";
import manifest from "./manifest";
import { useBomboPhysicsStore } from "./components/bomboPhysicsStore";

interface BallData {
  letra: string;
  numero: number;
}

function getLetraForNumero(num: number): string {
  if (num <= 18) return "B";
  if (num <= 36) return "I";
  if (num <= 54) return "N";
  if (num <= 72) return "G";
  return "O";
}

export default function Lvl3({ onComplete, onBack }: LevelProps) {
  //cartón
  const initialCasillas = useMemo<CasillaBingo[]>(() => {
    const rB = Array.from({ length: 18 }, (_, i) => i + 1).sort(() => Math.random() - 0.5).slice(0, 3);
    const rI = Array.from({ length: 18 }, (_, i) => i + 19).sort(() => Math.random() - 0.5).slice(0, 3);
    const rN = Array.from({ length: 18 }, (_, i) => i + 37).sort(() => Math.random() - 0.5).slice(0, 3);
    const rG = Array.from({ length: 18 }, (_, i) => i + 55).sort(() => Math.random() - 0.5).slice(0, 3);
    const rO = Array.from({ length: 18 }, (_, i) => i + 73).sort(() => Math.random() - 0.5).slice(0, 3);

    const casillasList: CasillaBingo[] = [];
    let id = 1;

    for (let fila = 0; fila < 3; fila++) {

      [rB[fila], rI[fila], rN[fila], rG[fila], rO[fila]].forEach((num) => {
        casillasList.push({
          id: id++,
          numero: num,
          letra: getLetraForNumero(num),
          tachada: false,
        });
      });
    }

    return casillasList;
  }, []);

  const bolsaBolas = useMemo<BallData[]>(() => {
    const todos = Array.from({ length: 90 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);

    return todos.map((num) => ({
      numero: num,
      letra: getLetraForNumero(num),
    }));
  }, []);

  const [casillas, setCasillas] = useState<CasillaBingo[]>(initialCasillas);
  const [bolasExtraidas, setBolasExtraidas] = useState<BallData[]>([]);
  const [girando, setGirando] = useState(false);
  const [esBingoCompletado, setEsBingoCompletado] = useState(false);
  const [tiemblando, setTiemblando] = useState(false);

  useEffect(() => {
    useBomboPhysicsStore.getState().initPhysics();
  }, []);

  const isExploded = useBomboPhysicsStore((s) => s.isExploded);
  const explosionBalls = useBomboPhysicsStore((s) => s.explosionBalls);
  const triggerExplosion = useBomboPhysicsStore((s) => s.triggerExplosion);
  const stepPhysicsStore = useBomboPhysicsStore((s) => s.stepPhysics);

  useEffect(() => {
    if (!isExploded) return;

    let animId: number;

    const loop = () => {
      stepPhysicsStore(window.innerWidth, window.innerHeight);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [isExploded, stepPhysicsStore]);

  const handleGirarBombo = useCallback(() => {
    if (girando || esBingoCompletado || bolasExtraidas.length >= bolsaBolas.length) return;

    setGirando(true);

    setTimeout(() => {
      const siguienteBola = bolsaBolas[bolasExtraidas.length];
      setBolasExtraidas((prev) => [...prev, siguienteBola]);
      setGirando(false);
    }, 220);

  }, [girando, esBingoCompletado, bolasExtraidas.length, bolsaBolas]);

  const handleBack = useCallback(() => {
    setBolasExtraidas([]);
    setCasillas(initialCasillas.map((c) => ({ ...c, tachada: false })));
    setEsBingoCompletado(false);
    setTiemblando(false);
    useBomboPhysicsStore.getState().initPhysics();
    onBack();
  }, [initialCasillas, onBack]);

  const handleTacharNumero = useCallback(

    (numero: number) => {
      const bolaHaSalido = bolasExtraidas.some((b) => b.numero === numero);
      if (!bolaHaSalido) return;

      setCasillas((prev) => {
        const next = prev.map((c) => (c.numero === numero ? { ...c, tachada: true } : c));
        //MARK:GANA
        const totalTachados = next.filter((c) => c.tachada).length;
        if (totalTachados >= 6 && !esBingoCompletado) {
          setEsBingoCompletado(true);

          setTiemblando(true);

          setTimeout(() => {
            setTiemblando(false);
            const originX = window.innerWidth / 2;
            const originY = window.innerHeight * 0.35;
            triggerExplosion(originX, originY, window.innerWidth, window.innerHeight);

            onComplete();
          }, 500);
        }

        return next;
      });
    },
    [bolasExtraidas, esBingoCompletado, triggerExplosion, onComplete]
  );

  const bolaActual = bolasExtraidas.length > 0 ? bolasExtraidas[bolasExtraidas.length - 1] : null;

  const casillasTachadas = casillas.filter((c) => c.tachada);
  const tachadosCount = casillasTachadas.length;
  const codigoMostrado = casillasTachadas.map((c) => c.numero.toString().padStart(2, "0"));

  return (
    <div className="w-full h-screen max-h-screen overflow-hidden p-2 sm:p-3 flex flex-col justify-between items-center select-none relative">
      <div className="w-full max-w-4xl flex justify-start z-40 shrink-0">
        <button
          onClick={handleBack}
          className="bg-white text-black text-xs font-black uppercase border-3 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer"
        >
          ← Volver al selector
        </button>
      </div>

      {/* Bombo de Bingo */}
      <div className="z-20 w-full shrink-0">
        <BomboBingo
          bolaActual={bolaActual}
          bolasAnteriores={bolasExtraidas}
          girando={girando}
          onGirarBombo={handleGirarBombo}
          quedanBolas={bolasExtraidas.length < bolsaBolas.length && !esBingoCompletado}
          esBingoCompletado={esBingoCompletado}
          tiemblando={tiemblando}
        />
      </div>

      {/* Contenedor central: Portátil (más grande) + Cartón superpuesto a la izquierda */}
      <div className="relative w-full max-w-4xl mx-auto flex-1 min-h-0 flex items-center justify-center my-1">
        {/* Portátil de Fondo */}
        <div className="w-full z-10">
          <PortatilFondo
            codigoMostrado={codigoMostrado}
            totalNumerosObjetivo={6}
            numerosTachadosCount={tachadosCount}
            esBingoCompletado={esBingoCompletado}
          />
        </div>

        {/* Cartón de Bingo (superpuesto a la izquierda) */}
        <div className="absolute left-0 sm:left-2 md:left-4 top-2 sm:top-4 z-30 w-[240px] sm:w-[320px] md:w-[360px]">
          <CartonBingo
            casillas={casillas}
            onTacharNumero={handleTacharNumero}
            esBingoCompletado={esBingoCompletado}
          />
        </div>
      </div>

      {/* OVERLAY DE EXPLOSIÓN Y FÍSICAS A PANTALLA COMPLETA CON GL-MATRIX */}
      {isExploded && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {/* Destello inicial de la explosión del bombo */}
          <div className="absolute inset-0 bg-white opacity-40 animate-[flashBurst_0.35s_ease-out_forwards]" />

          {/* Renderizado vectorial GPU de 80+ bolas rebotando por toda la vista */}
          <svg className="w-full h-full">
            {explosionBalls.map((b) => (
              <g key={b.id} transform={`translate(${b.pos[0]}, ${b.pos[1]})`}>
                <circle r={b.radius} fill={b.color} stroke="black" strokeWidth="2" />
                <circle r={b.radius * 0.35} cx={-b.radius * 0.35} cy={-b.radius * 0.35} fill="white" opacity="0.65" />
                {b.number && (
                  <text
                    textAnchor="middle"
                    dy="0.35em"
                    fontSize={b.radius * 0.75}
                    fontWeight="900"
                    fill="white"
                    stroke="black"
                    strokeWidth="0.5"
                  >
                    {b.number}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>
      )}

      <style>{`
        @keyframes flashBurst {
          0%   { opacity: 0.8; }
          100% { opacity: 0; }
        }
      `}</style>

      <AuthorBadge autor={manifest.autor} github={manifest.github} />
    </div>
  );
}
