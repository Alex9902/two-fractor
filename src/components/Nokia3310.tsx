import { useState, useEffect, useRef, useCallback } from "react";

interface Nokia3310Props {
  codigoCorrecto: string;
  onValidar: (codigoIngresado: string) => void;
  onVolver: () => void;
  status: "idle" | "success" | "error" | "decoy_trap";
}

const SvgSignal = () => (
  <svg viewBox="0 0 16 12" className="w-3.5 h-3 fill-current">
    <rect x="0" y="9" width="2.5" height="3" />
    <rect x="4" y="6" width="2.5" height="6" />
    <rect x="8" y="3" width="2.5" height="9" />
    <rect x="12" y="0" width="2.5" height="12" />
  </svg>
);

const SvgBattery = () => (
  <svg viewBox="0 0 18 10" className="w-4 h-2.5 fill-current">
    <rect x="0" y="0" width="14" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <rect x="2" y="2" width="2.5" height="6" />
    <rect x="5.5" y="2" width="2.5" height="6" />
    <rect x="9" y="2" width="2.5" height="6" />
    <rect x="15" y="3" width="2" height="4" rx="0.5" />
  </svg>
);

const SvgEnvelope = () => (
  <svg viewBox="0 0 16 12" className="w-3.5 h-3 fill-current inline-block mr-1">
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
  const [teclaActiva, setTeclaActiva] = useState<string | null>(null);
  const [indiceSecuencia, setIndiceSecuencia] = useState<number>(0);
  const [mensajeErrorT9, setMensajeErrorT9] = useState<string | null>(null);

  const [rotY, setRotY] = useState<number>(0);

  const isDragging = useRef<boolean>(false);
  const dragStart = useRef({ x: 0, rotY: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const caracterTemp = teclaActiva && T9_SECUENCIAS[teclaActiva]
    ? T9_SECUENCIAS[teclaActiva][indiceSecuencia]
    : "";

  const palabraObjetivo = codigoCorrecto || "ARBOL";

  const confirmarCaracter = useCallback((char: string) => {
    if (!char) return;
    setCodigoTyped((prev) => (prev + char).slice(0, palabraObjetivo.length));
    setTeclaActiva(null);
    setIndiceSecuencia(0);
  }, [palabraObjetivo.length]);

  const presionarTeclaT9 = useCallback((key: string) => {
    const secuencia = T9_SECUENCIAS[key];
    if (!secuencia) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (teclaActiva === key) {
      const siguienteIndice = (indiceSecuencia + 1) % secuencia.length;
      setIndiceSecuencia(siguienteIndice);

      timeoutRef.current = setTimeout(() => {
        confirmarCaracter(secuencia[siguienteIndice]);
      }, 1100);
    } else {
      if (teclaActiva && T9_SECUENCIAS[teclaActiva]) {
        confirmarCaracter(T9_SECUENCIAS[teclaActiva][indiceSecuencia]);
      }

      setTeclaActiva(key);
      setIndiceSecuencia(0);

      timeoutRef.current = setTimeout(() => {
        confirmarCaracter(secuencia[0]);
      }, 1100);
    }
  }, [teclaActiva, indiceSecuencia, confirmarCaracter]);

  const borrarCaracter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTeclaActiva(null);
    setIndiceSecuencia(0);
    setCodigoTyped((prev) => prev.slice(0, -1));
  }, []);

  const ejecutarVerificacion = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    let codigoFinal = codigoTyped;
    if (teclaActiva && T9_SECUENCIAS[teclaActiva]) {
      const charPendiente = T9_SECUENCIAS[teclaActiva][indiceSecuencia];
      codigoFinal = (codigoTyped + charPendiente).slice(0, palabraObjetivo.length);
    }

    setTeclaActiva(null);

    if (codigoFinal.toUpperCase() === palabraObjetivo.toUpperCase()) {
      onValidar(codigoFinal);
    } else {
      setMensajeErrorT9("CÓDIGO INCORRECTO");
      setTimeout(() => setMensajeErrorT9(null), 2500);
      onValidar("INCORRECTO");
    }
  }, [codigoTyped, teclaActiva, indiceSecuencia, palabraObjetivo, onValidar]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, rotY };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    if (e.touches[0]) {
      isDragging.current = true;
      dragStart.current = { x: e.touches[0].clientX, rotY };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      setRotY(dragStart.current.rotY + dx * 0.7);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || !e.touches[0]) return;
      const dx = e.touches[0].clientX - dragStart.current.x;
      setRotY(dragStart.current.rotY + dx * 0.7);
    };

    const handleRelease = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleRelease);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleRelease);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleRelease);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleRelease);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        presionarTeclaT9(e.key);
      } else if (e.key === "Backspace") {
        borrarCaracter();
      } else if (e.key === "Enter") {
        ejecutarVerificacion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [presionarTeclaT9, borrarCaracter, ejecutarVerificacion]);

  return (
    <div className="flex flex-col items-center w-full select-none">
      <button
        onClick={onVolver}
        className="self-start bg-white text-black text-xs font-black uppercase border-2 border-black px-3 py-1.5 mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer z-50"
      >
        ← Volver al selector
      </button>

      <div className="[perspective:1000px] w-full flex flex-col items-center my-2">
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="relative w-[300px] sm:w-[330px] h-[520px] sm:h-[550px] cursor-default [transform-style:preserve-3d] transition-transform duration-75 ease-out"
          style={{
            transform: `rotateY(${rotY}deg)`,
          }}
        >
          {/* CARA FRONTAL DEL TELÉFONO */}
          <div className="absolute inset-0 w-full h-full bg-[#2B3542] border-4 border-black p-4 sm:p-6 rounded-[44px] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-between [backface-visibility:hidden]">
            <div className="flex flex-col gap-1 items-center mb-1">
              <div className="w-2 h-3.5 bg-black/50 rounded-full" />
            </div>

            <div className="font-black tracking-[0.25em] text-gray-200 text-base uppercase">
              NOKIA
            </div>

            <div className="w-full bg-[#D1D5DB] border-4 border-black p-3.5 rounded-[32px] shadow-[inset_3px_3px_0px_rgba(255,255,255,0.7)] flex flex-col items-center">
              <div className="w-full bg-[#9BBC0F] border-4 border-black p-3 rounded-xl text-[#0F380F] font-mono shadow-[inset_3px_3px_0px_rgba(0,0,0,0.3)]">
                <div className="flex justify-between items-center text-[10px] font-bold border-b border-[#0F380F]/30 pb-1 mb-2">
                  <span className="flex items-center gap-1">
                    <SvgSignal />
                    <span>GSM</span>
                  </span>
                  <span>2FA SMS</span>
                  <span className="flex items-center gap-1">
                    <SvgBattery />
                  </span>
                </div>

                <div className="bg-[#8BAC0F]/40 p-2 border border-[#0F380F]/40 text-xs mb-3 font-semibold">
                  <div className="font-bold flex items-center text-[10px] uppercase mb-0.5">
                    <SvgEnvelope /> Mensaje Entrante:
                  </div>
                  <span>Mensaje 2FA: <strong className="text-sm tracking-widest">{palabraObjetivo}</strong></span>
                </div>

                <div className="text-center py-1">
                  <p className="text-[10px] font-bold uppercase mb-1">Código Ingresado:</p>
                  <div className="text-2xl font-black tracking-[0.2em] h-8 flex items-center justify-center bg-[#8BAC0F]/60 border-2 border-[#0F380F]/60">
                    {codigoTyped}
                    {caracterTemp && (
                      <span className="animate-pulse bg-[#0F380F] text-[#9BBC0F] px-1">
                        {caracterTemp}
                      </span>
                    )}
                  </div>
                </div>

                {mensajeErrorT9 ? (
                  <div className="bg-[#0F380F] text-[#9BBC0F] text-[10px] font-bold p-1 text-center mt-2 animate-bounce">
                    {mensajeErrorT9}
                  </div>
                ) : status === "success" ? (
                  <div className="bg-[#0F380F] text-[#9BBC0F] text-[11px] font-black p-1 text-center mt-2 animate-pulse">
                    ¡CÓDIGO CORRECTO!
                  </div>
                ) : status === "error" ? (
                  <div className="bg-[#0F380F] text-[#9BBC0F] text-[10px] font-bold p-1 text-center mt-2">
                    ERROR: CÓDIGO INCORRECTO
                  </div>
                ) : (
                  <div className="text-[9px] text-center opacity-70 mt-1">
                    Última versión de TikTok disponible
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 w-full px-1">
              {TECLAS_KEYPAD.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.key === "*") {
                      borrarCaracter();
                    } else if (item.key === "#") {
                      ejecutarVerificacion();
                    } else {
                      presionarTeclaT9(item.key);
                    }
                  }}
                  className="bg-[#E5E7EB] text-black border-3 border-black rounded-full py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none cursor-pointer flex flex-col items-center justify-center"
                >
                  <span className="text-lg font-black leading-none">{item.key}</span>
                  {item.sub && (
                    <span className="text-[9px] font-bold uppercase text-gray-600 leading-none mt-0.5">
                      {item.sub}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/*nota*/}
          <div className="absolute inset-0 w-full h-full bg-[#2B3542] border-4 border-black p-6 rounded-[44px] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <div className="w-12 h-3.5 bg-black/40 border-2 border-black rounded-b-lg mb-2" />

            <div className="relative my-auto rotate-[85deg] sm:rotate-[88deg] select-none scale-110 translate-x-8 sm:translate-x-10">
              <div className="absolute -top-3 -left-3 w-12 h-5 bg-white/40 border border-white/60 backdrop-blur-[1px] rotate-[-15deg] shadow-sm z-10 pointer-events-none" />

              <div className="absolute -bottom-3 -right-3 w-12 h-5 bg-white/40 border border-white/60 backdrop-blur-[1px] rotate-[10deg] shadow-sm z-10 pointer-events-none" />

              <div className="bg-[#FEF9C3] border-3 border-black px-6 py-3 rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                <span className="font-mono font-black text-3xl sm:text-4xl text-black tracking-[0.25em] uppercase">
                  {palabraObjetivo}
                </span>
              </div>
            </div>

            <div className="text-[10px] font-black uppercase text-gray-300 tracking-widest bg-black/30 px-3 py-1 rounded-full border border-gray-500">
              NOKIA 3310 · MADE IN OLYMPO
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
