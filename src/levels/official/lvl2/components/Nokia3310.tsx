import { useState, useEffect, useRef, useCallback } from "react";

//código ganador
const _SC = [57, 56, 50, 48, 48, 52].map(c => String.fromCharCode(c ^ 42 ^ 42)).join("");
const _checkSecret = (input: string) => input === _SC;

interface Nokia3310Props {
  codigoCorrecto: string;
  onValidar: (codigoIngresado: string) => void;
  onVolver: () => void;
  status: "idle" | "success" | "error" | "decoy_trap";
}

const SvgSignal = () => (
  <svg viewBox="0 0 16 12" className="w-4 h-3.5 fill-current">
    <rect x="0" y="9" width="2.5" height="3" />
    <rect x="4" y="6" width="2.5" height="6" />
    <rect x="8" y="3" width="2.5" height="9" />
    <rect x="12" y="0" width="2.5" height="12" />
  </svg>
);

const SvgBattery = () => (
  <svg viewBox="0 0 18 10" className="w-5 h-3 fill-current">
    <rect x="0" y="0" width="14" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <rect x="2" y="2" width="2.5" height="6" />
    <rect x="5.5" y="2" width="2.5" height="6" />
    <rect x="9" y="2" width="2.5" height="6" />
    <rect x="15" y="3" width="2" height="4" rx="0.5" />
  </svg>
);

const SvgEnvelope = () => (
  <svg viewBox="0 0 16 12" className="w-4 h-3.5 fill-current inline-block mr-1">
    <path d="M0 1v10h16V1H0zm14 2L8 7 2 3v-1h12v1zM2 10V4.5l6 4 6-4V10H2z" />
  </svg>
);

const T9_SECUENCIAS: Record<string, string[]> = {
  "1": [".", ",", "?", "!", "1"],
  "2": ["A", "B", "C", "2"],
  "3": ["D", "E", "F", "3"],
  "4": ["G", "H", "I", "4"],
  "5": ["J", "K", "L", "5"],
  "6": ["M", "N", "O", "6"],
  "7": ["P", "Q", "R", "S", "7"],
  "8": ["T", "U", "V", "8"],
  "9": ["W", "X", "Y", "Z", "9"],
  "0": [" ", "0"],
};

const TECLAS_KEYPAD = [
  { key: "1", sub: ". , ?" },
  { key: "2", sub: "abc" },
  { key: "3", sub: "def" },
  { key: "4", sub: "ghi" },
  { key: "5", sub: "jkl" },
  { key: "6", sub: "mno" },
  { key: "7", sub: "pqrs" },
  { key: "8", sub: "tuv" },
  { key: "9", sub: "wxyz" },
  { key: "*", sub: "" },
  { key: "0", sub: "␣" },
  { key: "#", sub: "" },
];

export default function Nokia3310({
  codigoCorrecto,
  onValidar,
  onVolver,
  status,
}: Nokia3310Props) {
  const [codigoTyped, setCodigoTyped] = useState<string>("");
  const [pendingChar, setPendingChar] = useState<string>("");
  const [mensajeErrorT9, setMensajeErrorT9] = useState<string | null>(null);
  const [celebrando, setCelebrando] = useState<boolean>(false);
  const [nivelCompletado, setNivelCompletado] = useState<boolean>(false);

  const [cargando, setCargando] = useState<boolean>(true);
  const [progreso, setProgreso] = useState<number>(0);
  const [codigoDespiste] = useState<string>(() =>
    Math.floor(100000 + Math.random() * 900000).toString()
  );

  const [rotY, setRotY] = useState<number>(0);

  const isDragging = useRef<boolean>(false);
  const dragStart = useRef({ x: 0, rotY: 0 });
  const lastKeyRef = useRef<{ key: string; index: number; time: number } | null>(null);
  const celebrationFiredRef = useRef<boolean>(false);

  const palabraObjetivo = codigoCorrecto || "ARBOL";

  const normalizedRot = ((rotY % 360) + 360) % 360;
  const isShowingBack = normalizedRot > 90 && normalizedRot < 270;

  useEffect(() => {
    const etapas = [
      { t: 0, p: 0 },
      { t: 300, p: 20 },
      { t: 900, p: 23 },
      { t: 1400, p: 70 },
      { t: 1900, p: 100 },
    ];

    const timeouts = etapas.map(({ t, p }) =>
      setTimeout(() => {
        setProgreso(p);
        if (p === 100) {
          setTimeout(() => setCargando(false), 150);
        }
      }, t)
    );

    return () => timeouts.forEach((id) => clearTimeout(id));
  }, []);

  const presionarTeclaT9 = useCallback((key: string) => {
    const secuencia = T9_SECUENCIAS[key];
    if (!secuencia) return;
    if (isShowingBack) return;

    if (mensajeErrorT9) setMensajeErrorT9(null);

    const now = Date.now();
    const isSameKey =
      lastKeyRef.current &&
      lastKeyRef.current.key === key &&
      now - lastKeyRef.current.time < 900;

    if (isSameKey) {
      const nextIndex = (lastKeyRef.current!.index + 1) % secuencia.length;
      const nextChar = secuencia[nextIndex];
      lastKeyRef.current = { key, index: nextIndex, time: now };
      setPendingChar(nextChar);
    } else {
      const firstChar = secuencia[0];
      lastKeyRef.current = { key, index: 0, time: now };
      setPendingChar(firstChar);
    }
  }, [mensajeErrorT9, isShowingBack]);

  const borrarCaracter = useCallback(() => {
    if (isShowingBack) return;
    setMensajeErrorT9(null);
    lastKeyRef.current = null;
    setPendingChar("");
    setCodigoTyped((prev) => prev.slice(0, -1));
  }, [isShowingBack]);

  // Confirmación automática del carácter pendiente tras 900ms
  useEffect(() => {
    if (!pendingChar) return;
    const timer = setTimeout(() => {
      const confirmed = pendingChar;
      setPendingChar("");
      lastKeyRef.current = null;
      setCodigoTyped((prev) => (prev + confirmed).slice(0, palabraObjetivo.length));
    }, 900);
    return () => clearTimeout(timer);
  }, [pendingChar, palabraObjetivo.length]);

  // Verificación automática al completar la longitud
  useEffect(() => {
    if (pendingChar) return;
    if (codigoTyped.length === palabraObjetivo.length) {
      const timer = setTimeout(() => {
        const esCorrecta = codigoTyped.toUpperCase() === palabraObjetivo.toUpperCase();
        const esSecreta = _checkSecret(codigoTyped);

        if (esCorrecta || esSecreta) {
          if (celebrationFiredRef.current) return;
          celebrationFiredRef.current = true;

          setCelebrando(true);
          setRotY((prev) => prev + 1440);

          setTimeout(() => {
            setCelebrando(false);
            setNivelCompletado(true);
            onValidar(codigoTyped);
          }, 1200);
        } else {
          setMensajeErrorT9("CÓDIGO ERRÓNEO");
          setTimeout(() => {
            setMensajeErrorT9(null);
            setCodigoTyped("");
            setPendingChar("");
            lastKeyRef.current = null;
          }, 2000);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [codigoTyped, pendingChar, palabraObjetivo, onValidar]);

  const handleChassisPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, rotY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleChassisPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    setRotY(dragStart.current.rotY + dx * 0.7);
  };

  const handleChassisPointerUp = () => { isDragging.current = false; };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        presionarTeclaT9(e.key);
      } else if (e.key === "Backspace") {
        borrarCaracter();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [presionarTeclaT9, borrarCaracter]);

  return (
    <div className="flex flex-col items-center w-full select-none">
      <div className="w-full max-w-[420px] flex justify-start mb-2 px-1">
        <button
          onClick={onVolver}
          className="bg-white text-black text-xs sm:text-sm font-black uppercase border-2 sm:border-3 border-black px-3.5 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer z-50"
        >
          ← Volver al selector
        </button>
      </div>

      <div className="[perspective:1200px] w-full flex flex-col items-center my-2">
        <div
          onPointerDown={handleChassisPointerDown}
          onPointerMove={handleChassisPointerMove}
          onPointerUp={handleChassisPointerUp}
          onPointerCancel={handleChassisPointerUp}
          className="relative w-[320px] sm:w-[380px] md:w-[420px] h-[640px] sm:h-[720px] md:h-[760px] cursor-default [transform-style:preserve-3d] touch-none"
          style={{
            transform: `rotateY(${rotY}deg)`,
            transition: celebrando ? "transform 1.2s linear" : "transform 75ms ease-out",
          }}
        >
          {/* CARA FRONTAL */}
          <div className="absolute inset-0 w-full h-full bg-[#2B3542] border-4 sm:border-6 border-black p-4 sm:p-6 pb-7 sm:pb-10 rounded-[48px] sm:rounded-[56px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-between [backface-visibility:hidden]">
            <div className="flex flex-col gap-1 items-center mb-1">
              <div className="w-2.5 h-4 bg-black/50 rounded-full" />
            </div>

            <div className="font-black tracking-[0.25em] text-gray-200 text-lg sm:text-xl uppercase my-1">
              NOKIA
            </div>

            <div className="w-full bg-[#D1D5DB] border-4 border-black p-3 sm:p-4 rounded-[36px] shadow-[inset_3px_3px_0px_rgba(255,255,255,0.7)] flex flex-col items-center mb-2 sm:mb-4">
              <div className="w-full bg-[#9BBC0F] border-4 border-black p-3 sm:p-3.5 rounded-xl text-[#0F380F] font-mono shadow-[inset_3px_3px_0px_rgba(0,0,0,0.3)] h-[215px] sm:h-[240px] flex flex-col justify-between overflow-hidden">
                {cargando ? (
                  <div className="h-full text-center flex flex-col items-center justify-center space-y-3 py-2">
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-tight animate-pulse leading-snug">
                      Inicializando Nokia 3310...
                    </p>
                    <div className="w-full bg-[#0F380F]/20 border-2 border-[#0F380F] h-4.5 p-0.5 rounded-xs overflow-hidden relative">
                      <div
                        className="bg-[#0F380F] h-full transition-all duration-300 ease-linear"
                        style={{ width: `${progreso}%` }}
                      />
                    </div>
                    <div className="flex justify-between w-full text-xs font-bold text-[#0F380F]">
                      <span>{progreso}%</span>
                      <span>{progreso === 100 ? "¡LISTO!" : "CARGANDO..."}</span>
                    </div>
                    <p className="text-xs font-semibold leading-tight text-[#0F380F]/90 mt-1">
                      Batería restante: 98%<br />
                      <span className="text-[10px] opacity-80">(Cargado en 2004)</span>
                    </p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-xs sm:text-sm font-bold border-b border-[#0F380F]/30 pb-1 mb-2">
                        <span className="flex items-center gap-1.5"><SvgSignal /><span>GSM</span></span>
                        <span>2FA SMS</span>
                        <span className="flex items-center gap-1.5"><SvgBattery /></span>
                      </div>

                      <div className="bg-[#8BAC0F]/40 p-2 sm:p-2.5 border border-[#0F380F]/40 text-xs sm:text-sm font-semibold mb-2">
                        <div className="font-bold flex items-center text-xs uppercase mb-0.5">
                          <SvgEnvelope /> Mensaje Entrante:
                        </div>
                        <span>Mensaje 2FA: <strong className="text-base sm:text-lg tracking-widest">{codigoDespiste}</strong></span>
                      </div>

                      <div className="text-center py-0.5">
                        <p className="text-[11px] sm:text-xs font-bold uppercase mb-0.5">Código Ingresado:</p>
                        <div className="text-2xl sm:text-3xl font-black tracking-[0.2em] h-9 sm:h-10 flex items-center justify-center bg-[#8BAC0F]/60 border-2 border-[#0F380F]/60">
                          {codigoTyped}
                          {pendingChar && (
                            <span className="animate-pulse bg-[#0F380F] text-[#9BBC0F] px-1">
                              {pendingChar}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      {nivelCompletado ? (
                        <div className="bg-[#0F380F] text-[#9BBC0F] text-xs sm:text-sm font-black p-1 text-center animate-pulse">
                          ¡NIVEL COMPLETADO CON ÉXITO!
                        </div>
                      ) : mensajeErrorT9 ? (
                        <div className="bg-[#0F380F] text-[#9BBC0F] text-xs font-bold p-1 text-center animate-bounce">
                          {mensajeErrorT9}
                        </div>
                      ) : status === "success" ? (
                        <div className="bg-[#0F380F] text-[#9BBC0F] text-xs sm:text-sm font-black p-1 text-center animate-pulse">
                          ¡NIVEL COMPLETADO CON ÉXITO!
                        </div>
                      ) : (
                        <div className="text-[10px] sm:text-xs text-center opacity-80 py-0.5">
                          Última versión de TikTok disponible
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full px-2 sm:px-3 mb-2 sm:mb-4">
              {TECLAS_KEYPAD.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    if (item.key === "*") {
                      borrarCaracter();
                    } else if (item.key !== "#") {
                      presionarTeclaT9(item.key);
                    }
                  }}
                  className="bg-[#E5E7EB] text-black border-3 sm:border-4 border-black rounded-full py-2.5 sm:py-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none cursor-pointer flex flex-col items-center justify-center z-20 relative select-none touch-auto"
                >
                  <span className="text-xl sm:text-2xl font-black leading-none">{item.key}</span>
                  {item.sub && (
                    <span className="text-[10px] sm:text-xs font-bold uppercase text-gray-600 leading-none mt-1">
                      {item.sub}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* CARA TRASERA */}
          <div className="absolute inset-0 w-full h-full bg-[#2B3542] border-4 sm:border-6 border-black p-6 rounded-[48px] sm:rounded-[56px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <div className="w-14 h-4 bg-black/40 border-2 border-black rounded-b-lg mb-2" />

            <div className="relative my-auto rotate-[85deg] sm:rotate-[88deg] select-none scale-125 translate-x-8 sm:translate-x-12">
              <div className="absolute -top-3 -left-3 w-14 h-5 bg-white/40 border border-white/60 backdrop-blur-[1px] rotate-[-15deg] shadow-sm z-10 pointer-events-none" />
              <div className="absolute -bottom-3 -right-3 w-14 h-5 bg-white/40 border border-white/60 backdrop-blur-[1px] rotate-[10deg] shadow-sm z-10 pointer-events-none" />

              <div className="bg-[#FEF9C3] border-3 border-black px-7 py-3.5 rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                <span className="font-mono font-black text-3xl sm:text-4xl md:text-5xl text-black tracking-[0.25em] uppercase">
                  {palabraObjetivo}
                </span>
              </div>
            </div>

            <div className="text-xs font-black uppercase text-gray-300 tracking-widest bg-black/30 px-3.5 py-1.5 rounded-full border border-gray-500">
              NOKIA 3310 · MADE IN FINLAND
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
