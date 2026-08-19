import { useState, useEffect, useRef } from "react";
import BolaBingo from "./BolaBingo";

interface BallData {
  letra: string;
  numero: number;
}

interface BomboBingoProps {
  bolaActual: BallData | null;
  bolasAnteriores: BallData[];
  girando: boolean;
  onGirarBombo: () => void;
  quedanBolas: boolean;
}

export default function BomboBingo({
  bolaActual,
  bolasAnteriores,
  girando,
  onGirarBombo,
  quedanBolas,
}: BomboBingoProps) {
  const [paloAbajo, setPaloAbajo] = useState(false);
  const [bolaVisible, setBolaVisible] = useState(false);
  const [bolaKey, setBolaKey] = useState(0);
  const prevBola = useRef<BallData | null>(null);

  //llega una bola nueva = disparar animación de escala
  useEffect(() => {
    if (bolaActual && bolaActual !== prevBola.current && !girando) {
      prevBola.current = bolaActual;
      setBolaVisible(false);

      const t = setTimeout(() => {
        setBolaKey((k) => k + 1);
        setBolaVisible(true);
      }, 50);

      return () => clearTimeout(t);
    }
  }, [bolaActual, girando]);

  const handlePalanca = () => {
    if (girando || !quedanBolas) return;

    setPaloAbajo(true);
    setBolaVisible(false);
    setTimeout(() => setPaloAbajo(false), 600); ç

    onGirarBombo();
  };

  return (
    <div className="w-full flex flex-col items-center select-none shrink-0 my-1">
      {/* Contenedor bombo + palanca */}
      <div className="relative flex items-center justify-center" style={{ width: 280, height: 200 }}>

        {/* ── SVG Bombo vista frontal ── */}
        <svg
          width="280"
          height="200"
          viewBox="0 0 280 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="143" cy="103" r="82" fill="black" opacity="0.18" />

          <circle cx="140" cy="100" r="82" fill="#FFDE4D" stroke="black" strokeWidth="5" />

          <circle cx="140" cy="100" r="82" fill="url(#radialShading)" />

          <g
            style={{
              transformOrigin: "140px 100px",
              animation: girando ? "spinRejilla 0.7s linear infinite" : "none",
            }}
          >
            <ellipse cx="140" cy="100" rx="2" ry="80" fill="none" stroke="black" strokeWidth="2.5" opacity="0.2" />
            <ellipse cx="140" cy="100" rx="38" ry="80" fill="none" stroke="black" strokeWidth="2" strokeDasharray="4 3" opacity="0.18" />
            <ellipse cx="140" cy="100" rx="65" ry="80" fill="none" stroke="black" strokeWidth="2" strokeDasharray="4 3" opacity="0.15" />
            <ellipse cx="140" cy="100" rx="80" ry="10" fill="none" stroke="black" strokeWidth="2" strokeDasharray="5 3" opacity="0.18" />
            <ellipse cx="140" cy="60" rx="60" ry="7" fill="none" stroke="black" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.14" />
            <ellipse cx="140" cy="140" rx="60" ry="7" fill="none" stroke="black" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.14" />
          </g>

          {/* --- Brillo superior (efecto esférico) --- */}
          <ellipse cx="112" cy="62" rx="28" ry="16" fill="white" opacity="0.30" />
          <ellipse cx="108" cy="58" rx="12" ry="7" fill="white" opacity="0.20" />

          {/* --- Anillo metálico exterior del orificio central --- */}
          <circle cx="140" cy="100" r="38" fill="#374151" stroke="black" strokeWidth="4" />
          <circle cx="140" cy="100" r="34" fill="#1E293B" />
          {/* Brillo interior del orificio */}
          <circle cx="128" cy="89" r="7" fill="white" opacity="0.08" />

          {/* --- Borde cromado externo --- */}
          <circle cx="140" cy="100" r="82" fill="none" stroke="#D4A017" strokeWidth="2" opacity="0.5" />

          {/* --- Eje izquierdo --- */}
          <rect x="45" y="95" width="18" height="10" rx="5" fill="#6B7280" stroke="black" strokeWidth="2" />
          {/* --- Eje derecho --- */}
          <rect x="217" y="95" width="18" height="10" rx="5" fill="#6B7280" stroke="black" strokeWidth="2" />

          {/* --- Soporte/pie izquierdo --- */}
          <rect x="70" y="175" width="14" height="22" rx="4" fill="#4B5563" stroke="black" strokeWidth="2" />
          {/* --- Soporte/pie derecho --- */}
          <rect x="196" y="175" width="14" height="22" rx="4" fill="#4B5563" stroke="black" strokeWidth="2" />
          {/* Travesaño base */}
          <rect x="68" y="190" width="144" height="8" rx="4" fill="#374151" stroke="black" strokeWidth="2" />

          {/* --- Palanca lateral (derecha) --- */}
          {/* Soporte de la palanca */}
          <rect x="228" y="82" width="10" height="36" rx="5" fill="#9CA3AF" stroke="black" strokeWidth="2" />
          {/* Brazo de la palanca - rota desde el pivote cuando se pulsa */}
          <g
            style={{
              transformOrigin: "233px 100px",
              transform: paloAbajo ? "rotate(40deg)" : "rotate(-15deg)",
              transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {/* Barra */}
            <rect x="230" y="68" width="6" height="36" rx="3" fill="#FF6B6B" stroke="black" strokeWidth="2" />
            {/* Pomo superior */}
            <circle cx="233" cy="65" r="8" fill="#CC0000" stroke="black" strokeWidth="2.5" />
            <circle cx="230" cy="62" r="3" fill="white" opacity="0.3" />
          </g>

          {/* Definición gradiente radial para profundidad */}
          <defs>
            <radialGradient id="radialShading" cx="45%" cy="40%" r="70%">
              <stop offset="0%" stopColor="white" stopOpacity="0.0" />
              <stop offset="70%" stopColor="black" stopOpacity="0.0" />
              <stop offset="100%" stopColor="black" stopOpacity="0.35" />
            </radialGradient>
          </defs>

          {/* --- Texto en el orificio (estado, solo cuando no gira) --- */}
          {!girando && !bolaVisible && (
            <text x="140" y="106" textAnchor="middle" fontSize="9" fontWeight="900" fill="#64748B">
              {quedanBolas ? "LISTO" : "FIN"}
            </text>
          )}
        </svg>

        {/* ── Bola emergiendo del orificio: escala 0→grande (efecto "sale hacia ti") ── */}
        {bolaActual && bolaVisible && (
          <div
            key={bolaKey}
            className="absolute pointer-events-none"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              animation: "bolaEmerge 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}
          >
            <BolaBingo letra={bolaActual.letra} numero={bolaActual.numero} size="lg" destacada />
          </div>
        )}
      </div>

      {/* Botón de acción */}
      <div className="mt-2">
        <button
          onClick={handlePalanca}
          disabled={girando || !quedanBolas}
          className={`font-black uppercase border-3 sm:border-4 border-black px-6 py-2 text-xs sm:text-sm tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer ${girando || !quedanBolas
            ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
            : "bg-[#4ADE80] text-black hover:bg-[#3ec972] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            }`}
        >
          {girando ? "SACANDO BOLA..." : quedanBolas ? "SACAR BOLA" : "FIN DEL BOMBO"}
        </button>
      </div>

      {/* Historial de últimas bolas */}
      {bolasAnteriores.length > 0 && (
        <div className="mt-1.5 bg-white border-2 border-black p-1 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 overflow-x-auto max-w-xs">
          <span className="text-[9px] font-black uppercase text-gray-500 mr-0.5">ULTIMAS:</span>
          {bolasAnteriores.slice(-5).reverse().map((b, idx) => (
            <BolaBingo key={idx} letra={b.letra} numero={b.numero} size="sm" />
          ))}
        </div>
      )}

      <style>{`
        @keyframes bolaEmerge {
          0%   { transform: translate(-50%, -50%) scale(0);    opacity: 0; }
          60%  { transform: translate(-50%, -50%) scale(1.3);  opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.0);  opacity: 1; }
        }
        @keyframes spinRejilla {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
