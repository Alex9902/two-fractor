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

const SNAKE_PATH =
  "M 150 90 C 150 140, 240 35, 320 35 C 400 35, 430 90, 360 115 C 290 140, 100 80, 50 140 C 0 200, 60 260, 150 240 C 240 220, 260 150, 330 150 C 410 150, 420 210, 395 285";

const N_SEG = 120;   // Alta densidad de vértices para los múltiplos bucles del tubo largo
const TUBE_R = 19;    // Semiancho del tubo en reposo (radio = 19px → ancho base 38px, un poco más ancho)
const SPHERE_R = 32;    // Radio de la esfera rígida (32px → ¡64px de bulto!)
const STRUCT_K = 0.35;  // Tensión a lo largo de las paredes
const CROSS_K = 0.04;  // Resistencia a expansión cruzada (baja para permitir gran bulto)
const DIAG_K = 0.10;  // Resistencia a cizallamiento
const REST_K = 0.04;  // Fuerza de restauración elástica a la posición original
const DAMPING = 0.90;  // Amortiguación por sub-paso
const SUBSTEPS = 6;     // Sub-pasos de física por frame
const ANIM_MS = 5500;  // Tiempo de viaje de la bola (más lento)
const SETTLE_MS = 1500; // Tiempo de rebote elástico tras salir la bola

interface Vertex {
  x: number; y: number;
  px: number; py: number;
  ox: number; oy: number;
}

interface Spring {
  a: number; b: number;
  rest: number;
  k: number;
  isCross?: boolean;
}

function sampleSVGPath(pathD: string, n: number) {
  const ns = "http://www.w3.org/2000/svg";
  const svgEl = document.createElementNS(ns, "svg");

  Object.assign(svgEl.style, {
    position: "absolute",
    top: "-9999px",
    left: "-9999px",
    width: "1px",
    height: "1px",
  });

  const pathEl = document.createElementNS(ns, "path");
  pathEl.setAttribute("d", pathD);
  svgEl.appendChild(pathEl);

  (document.body || document.documentElement).appendChild(svgEl);

  let totalLen = 0;

  try {
    totalLen = pathEl.getTotalLength() || 500;
  } catch {
    totalLen = 500;
  }

  const pts: { x: number; y: number }[] = [];
  const tgts: { x: number; y: number }[] = [];

  for (let i = 0; i <= n; i++) {
    const t = (i / n) * totalLen;
    let p = { x: 0, y: 0 };
    let p2 = { x: 1, y: 0 };

    try {
      const pt = pathEl.getPointAtLength(t);
      const pt2 = pathEl.getPointAtLength(Math.min(t + 0.5, totalLen));

      if (pt) p = { x: pt.x || 0, y: pt.y || 0 };
      if (pt2) p2 = { x: pt2.x || 0, y: pt2.y || 0 };
    } catch { }

    const dx = p2.x - p.x;
    const dy = p2.y - p.y;
    const len = Math.hypot(dx, dy) || 1;

    pts.push({ x: p.x, y: p.y });
    tgts.push({ x: dx / len, y: dy / len });
  }

  if (svgEl.parentNode) {
    svgEl.parentNode.removeChild(svgEl);
  }
  return { pts, tgts };
}

//malla
function initPhysics(pathD: string) {
  const { pts, tgts } = sampleSVGPath(pathD, N_SEG);
  const count = N_SEG + 1;

  const left: Vertex[] = [];
  const right: Vertex[] = [];

  for (let i = 0; i < count; i++) {
    const nx = -tgts[i].y;
    const ny = tgts[i].x;

    const lx = pts[i].x + nx * TUBE_R;
    const ly = pts[i].y + ny * TUBE_R;
    const rx = pts[i].x - nx * TUBE_R;
    const ry = pts[i].y - ny * TUBE_R;

    left.push({ x: lx, y: ly, px: lx, py: ly, ox: lx, oy: ly });
    right.push({ x: rx, y: ry, px: rx, py: ry, ox: rx, oy: ry });
  }

  const verts: Vertex[] = [...left, ...right];
  const li = (i: number) => i;
  const ri = (i: number) => count + i;

  const vdist = (a: Vertex, b: Vertex) => Math.hypot(a.x - b.x, a.y - b.y);
  const springs: Spring[] = [];

  for (let i = 0; i < N_SEG; i++) {
    springs.push({ a: li(i), b: li(i + 1), rest: vdist(left[i], left[i + 1]), k: STRUCT_K });
    springs.push({ a: ri(i), b: ri(i + 1), rest: vdist(right[i], right[i + 1]), k: STRUCT_K });
    springs.push({ a: li(i), b: ri(i), rest: vdist(left[i], right[i]), k: CROSS_K, isCross: true });
    springs.push({ a: li(i), b: ri(i + 1), rest: vdist(left[i], right[i + 1]), k: DIAG_K, isCross: true });
    springs.push({ a: li(i + 1), b: ri(i), rest: vdist(left[i + 1], right[i]), k: DIAG_K, isCross: true });
  }
  springs.push({ a: li(N_SEG), b: ri(N_SEG), rest: vdist(left[N_SEG], right[N_SEG]), k: CROSS_K, isCross: true });

  return { verts, springs, pathPts: pts, leftCount: count };
}

function stepPhysics(
  verts: Vertex[],
  springs: Spring[],
  sx: number,
  sy: number,
) {
  const n = verts.length;
  const ax = new Float32Array(n);
  const ay = new Float32Array(n);

  //ley de hooke en los resortes
  for (const sp of springs) {
    const a = verts[sp.a];
    const b = verts[sp.b];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const d = Math.hypot(dx, dy) || 0.001;
    const stretch = d - sp.rest;

    let k = sp.k;

    if (sp.isCross) {
      k = stretch > 0 ? 0.001 : 0.8;
    }

    const f = (k * stretch) / d;

    ax[sp.a] += f * dx; ay[sp.a] += f * dy;
    ax[sp.b] -= f * dx; ay[sp.b] -= f * dy;
  }

  //restaura posición
  for (let i = 0; i < n; i++) {
    const v = verts[i];
    ax[i] += REST_K * (v.ox - v.x);
    ay[i] += REST_K * (v.oy - v.y);
  }

  //verlet con damping
  for (let i = 0; i < n; i++) {
    const v = verts[i];
    const vx = (v.x - v.px) * DAMPING;
    const vy = (v.y - v.py) * DAMPING;

    v.px = v.x;
    v.py = v.y;
    v.x += vx + ax[i];
    v.y += vy + ay[i];
  }

  //colisión simétrica rígida
  const r2 = SPHERE_R * SPHERE_R;

  for (let i = 0; i < n; i++) {
    const v = verts[i];
    const dx = v.x - sx;
    const dy = v.y - sy;
    const d2 = dx * dx + dy * dy;

    if (d2 < r2 && d2 > 0) {
      const d = Math.sqrt(d2);
      const pushX = (dx / d) * SPHERE_R;
      const pushY = (dy / d) * SPHERE_R;

      v.x = sx + pushX;
      v.y = sy + pushY;
    }
  }
}

//render
function drawTube(
  ctx: CanvasRenderingContext2D,
  verts: Vertex[],
  leftCount: number,
  _spherePos: { x: number; y: number } | null
) {
  const L = verts.slice(0, leftCount);
  const R = verts.slice(leftCount);

  ctx.save();
  ctx.clearRect(0, 0, 440, 300);

  // 1. Trazado del contorno exterior suavizado con curvas cuadráticas
  ctx.beginPath();
  ctx.moveTo(L[0].x, L[0].y);

  for (let i = 1; i < L.length - 1; i++) {
    const xc = (L[i].x + L[i + 1].x) / 2;
    const yc = (L[i].y + L[i + 1].y) / 2;
    ctx.quadraticCurveTo(L[i].x, L[i].y, xc, yc);
  }

  ctx.lineTo(L[L.length - 1].x, L[L.length - 1].y);

  ctx.lineTo(R[R.length - 1].x, R[R.length - 1].y);

  for (let i = R.length - 2; i > 0; i--) {
    const xc = (R[i].x + R[i - 1].x) / 2;
    const yc = (R[i].y + R[i - 1].y) / 2;
    ctx.quadraticCurveTo(R[i].x, R[i].y, xc, yc);
  }

  ctx.lineTo(R[0].x, R[0].y);
  ctx.closePath();

  //body del tubo
  ctx.fillStyle = "#94A3B8";
  ctx.fill();

  ctx.strokeStyle = "black";
  ctx.lineWidth = 6;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.restore();
}

export default function BomboBingo({
  bolaActual,
  bolasAnteriores,
  girando,
  onGirarBombo,
  quedanBolas,
}: BomboBingoProps) {
  const [paloAbajo, setPaloAbajo] = useState(false);
  const [faseBola, setFaseBola] = useState<"idle" | "deslizando" | "reposo">("idle");
  const prevBola = useRef<BallData | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const physRef = useRef<ReturnType<typeof initPhysics> | null>(null);

  useEffect(() => {
    if (bolaActual && bolaActual !== prevBola.current && !girando) {
      prevBola.current = bolaActual;
      setFaseBola("deslizando");
      const t = setTimeout(() => setFaseBola("reposo"), ANIM_MS);

      return () => clearTimeout(t);
    }
  }, [bolaActual, girando]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    physRef.current = initPhysics(SNAKE_PATH);
    const phys = physRef.current;

    if (faseBola !== "deslizando") {
      ctx.clearRect(0, 0, 440, 300);
      drawTube(ctx, phys.verts, phys.leftCount, null);

      return;
    }

    const startTime = performance.now();
    const totalDuration = ANIM_MS + SETTLE_MS;

    function loop(now: number) {
      if (!ctx) return;
      const elapsed = now - startTime;
      const t = Math.min(elapsed / ANIM_MS, 1);

      let sphereX = -1000;
      let sphereY = -1000;
      let isInside = false;

      if (t < 1) {
        isInside = true;
        const eased = t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const pLen = phys.pathPts ? phys.pathPts.length : 0;

        if (pLen >= 2) {
          const raw = Math.max(0, Math.min(eased * (pLen - 1), pLen - 1));
          const idx = Math.min(Math.floor(raw), pLen - 2);
          const frac = raw - idx;
          const pa = phys.pathPts[idx];
          const pb = phys.pathPts[idx + 1] || pa;

          if (pa && pb) {
            sphereX = pa.x + (pb.x - pa.x) * frac;
            sphereY = pa.y + (pb.y - pa.y) * frac;
          }
        }
      }

      for (let sub = 0; sub < SUBSTEPS; sub++) {
        stepPhysics(phys.verts, phys.springs, sphereX, sphereY);
      }

      drawTube(
        ctx,
        phys.verts,
        phys.leftCount,
        isInside ? { x: sphereX, y: sphereY } : null
      );

      if (elapsed < totalDuration) {
        rafRef.current = requestAnimationFrame(loop);
      }
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [faseBola]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const phys = initPhysics(SNAKE_PATH);
    physRef.current = phys;
    drawTube(ctx, phys.verts, phys.leftCount, null);
  }, []);

  const handlePalanca = () => {
    if (girando || !quedanBolas) return;
    setPaloAbajo(true);
    setFaseBola("idle");
    setTimeout(() => setPaloAbajo(false), 550);
    onGirarBombo();
  };

  const bolasVisibles =
    faseBola !== "reposo" && faseBola !== "idle"
      ? bolasAnteriores.slice(0, -1)
      : bolasAnteriores;
  const ultimasBolas = bolasVisibles.slice(-6);

  return (
    <div className="w-full flex flex-col items-center select-none shrink-0 my-1">
      <div className="relative w-full max-w-md flex flex-col items-center">

        <div
          className="relative -mb-24 z-10"
          style={{ width: 440, height: 300 }}
        >
          {/* ── CAPA 1: SVG Fondo (soportes y sombra) ── */}
          <svg
            width="440" height="300" viewBox="0 0 440 300" fill="none"
            style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
          >
            <ellipse cx="150" cy="188" rx="85" ry="12" fill="black" opacity="0.25" />
            <rect x="85" y="152" width="14" height="34" rx="4" fill="#94A3B8" stroke="black" strokeWidth="2" />
            <rect x="201" y="152" width="14" height="34" rx="4" fill="#94A3B8" stroke="black" strokeWidth="2" />
            <rect x="75" y="180" width="150" height="9" rx="4" fill="#334155" stroke="black" strokeWidth="2.5" />
          </svg>

          {/* ── CAPA 2: Canvas 2D (Tubo elástico deformable con física Verlet) ── */}
          <canvas
            ref={canvasRef}
            width={440}
            height={300}
            style={{ position: "absolute", top: 0, left: 0, zIndex: 2 }}
          />

          {/* ── CAPA 3: SVG Primer plano (bombo, palanca y abrazaderas) ── */}
          <svg
            width="440" height="300" viewBox="0 0 440 300" fill="none"
            style={{ position: "absolute", top: 0, left: 0, zIndex: 3 }}
            className="overflow-visible"
          >
            <defs>
              <radialGradient id="goldShadingB" cx="45%" cy="38%" r="72%">
                <stop offset="0%" stopColor="#FDE047" stopOpacity="0.5" />
                <stop offset="65%" stopColor="#CA8A04" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#713F12" stopOpacity="0.45" />
              </radialGradient>
              <linearGradient id="metalGradientB" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="50%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
            </defs>

            {/* Abrazaderas */}
            <rect x="295" y="70" width="9" height="19" rx="2" fill="white" stroke="black" strokeWidth="2" />
            <rect x="380" y="60" width="9" height="19" rx="2" fill="white" stroke="black" strokeWidth="2" />
            <rect x="260" y="155" width="9" height="19" rx="2" fill="white" stroke="black" strokeWidth="2" />
            <rect x="352" y="235" width="9" height="19" rx="2" fill="white" stroke="black" strokeWidth="2" />

            {/* Esfera del bombo */}
            <circle cx="150" cy="90" r="74" fill="#EAB308" stroke="#0F172A" strokeWidth="5" />
            <circle cx="150" cy="90" r="74" fill="url(#goldShadingB)" />

            {/* Rejilla giratoria */}
            <g style={{ transformOrigin: "150px 90px", animation: girando ? "spinRejilla 0.5s linear infinite" : "none" }}>
              <ellipse cx="150" cy="90" rx="3" ry="72" fill="none" stroke="#78350F" strokeWidth="2.5" opacity="0.35" />
              <ellipse cx="150" cy="90" rx="35" ry="72" fill="none" stroke="#78350F" strokeWidth="2" strokeDasharray="5 3" opacity="0.3" />
              <ellipse cx="150" cy="90" rx="60" ry="72" fill="none" stroke="#78350F" strokeWidth="2" strokeDasharray="5 3" opacity="0.25" />
              <ellipse cx="150" cy="90" rx="72" ry="11" fill="none" stroke="#78350F" strokeWidth="2" strokeDasharray="6 3" opacity="0.3" />
              <ellipse cx="150" cy="52" rx="52" ry="7" fill="none" stroke="#78350F" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.25" />
              <ellipse cx="150" cy="128" rx="52" ry="7" fill="none" stroke="#78350F" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.25" />
            </g>

            {/* Destellos 3D */}
            <ellipse cx="122" cy="54" rx="26" ry="13" fill="white" opacity="0.35" />
            <ellipse cx="117" cy="50" rx="10" ry="5" fill="white" opacity="0.25" />

            {/* Boca de salida */}
            <circle cx="150" cy="90" r="34" fill="url(#metalGradientB)" stroke="#0F172A" strokeWidth="4" />
            <circle cx="150" cy="90" r="29" fill="#090D16" />
            <circle cx="140" cy="80" r="6" fill="white" opacity="0.12" />

            {/* Ejes */}
            <rect x="68" y="85" width="14" height="10" rx="4" fill="url(#metalGradientB)" stroke="#0F172A" strokeWidth="2" />
            <rect x="218" y="85" width="14" height="10" rx="4" fill="url(#metalGradientB)" stroke="#0F172A" strokeWidth="2" />

            {/* Palanca */}
            <rect x="226" y="72" width="11" height="34" rx="4" fill="url(#metalGradientB)" stroke="#0F172A" strokeWidth="2" />
            <g style={{
              transformOrigin: "231px 89px",
              transform: paloAbajo ? "rotate(42deg)" : "rotate(-16deg)",
              transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)",
            }}>
              <rect x="228" y="56" width="7" height="34" rx="3.5" fill="#EF4444" stroke="#0F172A" strokeWidth="2" />
              <circle cx="231" cy="53" r="8" fill="#B91C1C" stroke="#0F172A" strokeWidth="2" />
              <circle cx="228" cy="50" r="3" fill="white" opacity="0.4" />
            </g>

            {!girando && faseBola === "idle" && (
              <text x="150" y="94" textAnchor="middle" fontSize="9" fontWeight="900" fill="#94A3B8">
                {quedanBolas ? "LISTO" : "FIN"}
              </text>
            )}
          </svg>
        </div>

        {/* ── Botón ── */}
        <div className="z-40 my-1">
          <button
            onClick={handlePalanca}
            disabled={girando || !quedanBolas}
            className={`font-black uppercase border-3 sm:border-4 border-black px-6 py-2 text-xs sm:text-sm tracking-wider shadow-[3.5px_3.5px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer ${girando || !quedanBolas
              ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
              : "bg-[#4ADE80] text-black hover:bg-[#3ec972] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              }`}
          >
            {girando ? "SACANDO BOLA..." : quedanBolas ? "SACAR BOLA" : "FIN DEL BOMBO"}
          </button>
        </div>

        {/* ── Canaleta de extracción ── */}
        <div className="w-full px-2 relative z-20">
          <div className="absolute -top-3 right-12 z-30 w-9 h-5 bg-[#94A3B8] border-3 border-black rounded-t-md flex items-center justify-center">
            <div className="w-5 h-1.5 bg-[#334155] rounded-full" />
          </div>
          <div className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] border-3 sm:border-4 border-black rounded-xl p-2.5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="flex justify-between items-center px-1 mb-2 border-b-2 border-slate-700/80 pb-1.5">
              <span className="text-[10px] font-black uppercase text-[#FFDE4D] tracking-wider flex items-center gap-1.5">
                <span className="text-xs">🎱</span> CANALETA DE EXTRACCIÓN
              </span>
              <span className="text-[9px] font-black text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-600">
                {bolasVisibles.length} / 90 BOLAS
              </span>
            </div>
            <div className="bg-[#090D16] border-2 border-black rounded-lg p-2 flex items-center justify-between gap-1.5 shadow-[inset_2px_3px_6px_rgba(0,0,0,0.9)] min-h-[60px] relative">
              <div className="absolute inset-x-3 top-[38%] -translate-y-1/2 h-1.5 bg-gradient-to-r from-slate-600 via-slate-300 to-slate-600 border-y border-black rounded-full opacity-60" />
              <div className="absolute inset-x-3 top-[62%] -translate-y-1/2 h-1.5 bg-gradient-to-r from-slate-600 via-slate-300 to-slate-600 border-y border-black rounded-full opacity-60" />
              {Array.from({ length: 6 }).map((_, index) => {
                const bolaEnSlot = ultimasBolas[index];
                const esUltimaSacada =
                  bolaEnSlot && bolaEnSlot === bolaActual && faseBola === "reposo";
                return (
                  <div
                    key={index}
                    className="relative z-10 w-11 h-11 rounded-full border-2 border-slate-700/80 bg-gradient-to-b from-[#1E293B] to-[#0F172A] flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.95)]"
                  >
                    {bolaEnSlot ? (
                      <div className={esUltimaSacada ? "animate-[slotLand_0.25s_ease-out]" : ""}>
                        <BolaBingo
                          letra={bolaEnSlot.letra}
                          numero={bolaEnSlot.numero}
                          size="sm"
                          destacada={esUltimaSacada}
                        />
                      </div>
                    ) : (
                      <span className="text-[9px] font-black text-slate-600/80">{index + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spinRejilla {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes slotLand {
          0%   { transform: scale(1.3); }
          50%  { transform: scale(0.88); }
          100% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
}
