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

const SvgRotate = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
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
  const [girado, setGirado] = useState<boolean>(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const caracterTemp = teclaActiva && T9_SECUENCIAS[teclaActiva]
    ? T9_SECUENCIAS[teclaActiva][indiceSecuencia]
    : "";

  const confirmarCaracter = useCallback((char: string) => {
    if (!char) return;

    setCodigoTyped((prev) => (prev + char).slice(0, 6));
    setTeclaActiva(null);
    setIndiceSecuencia(0);
  }, []);

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

    if (teclaActiva) {
      setTeclaActiva(null);
      setIndiceSecuencia(0);
    } else {
      setCodigoTyped((prev) => prev.slice(0, -1));
    }
  }, [teclaActiva]);

  const ejecutarVerificacion = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    let codigoFinal = codigoTyped;
    if (teclaActiva && T9_SECUENCIAS[teclaActiva]) {
      const charPendiente = T9_SECUENCIAS[teclaActiva][indiceSecuencia];
      codigoFinal = (codigoTyped + charPendiente).slice(0, 6);
    }

    setTeclaActiva(null);

    if (/[^0-9]/.test(codigoFinal)) {
      setMensajeErrorT9("¿Letras en un 2FA? ¡Pulsa más veces!");
      setTimeout(() => setMensajeErrorT9(null), 3000);
      return;
    }

    onValidar(codigoFinal);
  }, [codigoTyped, teclaActiva, indiceSecuencia, onValidar]);

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
    <div className="flex flex-col items-center w-full">
      <button
        onClick={onVolver}
        className="self-start bg-white text-black text-xs font-black uppercase border-2 border-black px-3 py-1.5 mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer"
      >
        ← Volver al selector
      </button>

      <div className="[perspective:1000px] w-full flex flex-col items-center">
        <div
          className={`relative w-full max-w-[310px] sm:max-w-[360px] transition-transform duration-700 [transform-style:preserve-3d] ${
            girado ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <div className="w-full bg-[#2B3542] border-4 border-black p-4 sm:p-7 rounded-[38px] sm:rounded-[48px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[14px_14px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center relative [backface-visibility:hidden]">
            <button
              onClick={() => setGirado(true)}
              className="absolute -top-3 -right-3 bg-[#FFDE4D] text-black border-2 border-black rounded-full p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-110 active:scale-95 cursor-pointer z-30"
              title="Girar teléfono para ver la parte trasera"
            >
              <SvgRotate />
            </button>

            <div className="flex flex-col gap-1 items-center mb-2">
              <div className="w-2 h-3.5 bg-black/50 rounded-full" />
            </div>

            <div className="font-black tracking-[0.25em] text-gray-200 text-base mb-3 uppercase">
              NOKIA
            </div>

            <div className="w-full bg-[#D1D5DB] border-4 border-black p-4 sm:p-5 rounded-[36px] shadow-[inset_3px_3px_0px_rgba(255,255,255,0.7)] flex flex-col items-center mb-5">
              <div className="w-full bg-[#9BBC0F] border-4 border-black p-3.5 rounded-xl text-[#0F380F] font-mono shadow-[inset_3px_3px_0px_rgba(0,0,0,0.3)]">
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
                  <span>Código 2FA: <strong className="text-sm tracking-widest">{codigoCorrecto}</strong></span>
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

            <div className="grid grid-cols-3 gap-3 w-full px-1">
              {TECLAS_KEYPAD.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    if (item.key === "*") {
                      borrarCaracter();
                    } else if (item.key === "#") {
                      ejecutarVerificacion();
                    } else {
                      presionarTeclaT9(item.key);
                    }
                  }}
                  className="bg-[#E5E7EB] text-black border-3 border-black rounded-full py-2.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none cursor-pointer flex flex-col items-center justify-center transition-all hover:bg-white"
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

          <div className="absolute inset-0 w-full h-full bg-[#2B3542] border-4 border-black p-6 sm:p-7 rounded-[38px] sm:rounded-[48px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[14px_14px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-between [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="w-12 h-3 bg-black/40 border-2 border-black rounded-b-lg mb-2" />

            <div className="w-full bg-[#FEF9C3] border-3 border-black p-4 rounded-lg rotate-[-2deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center my-auto select-none">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-700 mb-1">
                📌 CÓDIGO 2FA APUNTADO:
              </p>
              <p className="text-3xl font-black tracking-[0.2em] text-black font-mono border-y-2 border-dashed border-black py-2 my-1">
                {codigoCorrecto}
              </p>
              <p className="text-[9px] font-bold text-gray-600 mt-1 italic">
                (Por si se me olvida el código 🤫)
              </p>
            </div>

            <button
              onClick={() => setGirado(false)}
              className="bg-white text-black font-black text-xs uppercase border-3 border-black px-4 py-2 rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none cursor-pointer flex items-center gap-1.5 hover:bg-gray-100"
            >
              <SvgRotate />
              <span>Volver a la Pantalla</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
