import { useRef, useEffect, useState } from "react";
import type { LevelProps } from "../../../engine/types";
import BombillaPista from "./components/BombillaPista";

const DIGITOS = 6;

function generarCodigo(): string {
  const min = Math.pow(10, DIGITOS - 1);
  const max = Math.pow(10, DIGITOS) - 1;
  return Math.floor(min + Math.random() * (max - min)).toString();
}

export default function Lvl1({ onComplete, onBack }: LevelProps) {
  const [codigoCorrecto] = useState(generarCodigo);
  const [codigoDecoy] = useState(() => {
    let decoy: string;
    do { decoy = generarCodigo(); } while (decoy === codigoCorrecto);
    return decoy;
  });

  const [code, setCode] = useState<string[]>(Array(DIGITOS).fill(""));
  const [status, setStatus] = useState<"idle" | "success" | "error" | "decoy_trap">("idle");
  const [luzEncendida, setLuzEncendida] = useState(true);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const logPrintado = useRef(false);

  useEffect(() => {
    inputRefs.current[0]?.focus();

    if (!logPrintado.current) {
      console.log("¿Qué buscas aquí?");
      logPrintado.current = true;
    }
  }, []);

  const handleChangeCode = (value: string, index: number) => {
    if (value !== "" && !/^[0-9]$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setStatus("idle");

    if (value !== "" && index < DIGITOS - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {

      if (code[index] === "" && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();

      } else {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
      setStatus("idle");
    }
  };

  const handleValidar = () => {
    const ingresado = code.join("");

    if (ingresado === codigoCorrecto) {
      setStatus("success");
      setLuzEncendida(true);
      onComplete();

    } else if (ingresado === codigoDecoy) {
      setStatus("decoy_trap");

    } else {
      setStatus("error");
    }
  };

  const cardBgClass = "bg-white border-4 border-black p-6 sm:p-8 w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative transition-all duration-300";
  const buttonVolverClass = "bg-white text-black text-xs font-black uppercase border-2 border-black px-3 py-1.5 mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer";
  const inputClass = "w-10 h-14 sm:w-11 sm:h-15 text-center text-xl font-black uppercase border-4 border-black rounded-none bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-[#38BDF8] focus:translate-y-[-2px] focus:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all";
  const buttonValidarClass = status === "success"
    ? "w-full bg-[#A3E635] text-black font-black uppercase border-4 border-black py-3 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#92cf2c] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer text-center text-lg"
    : "w-full bg-[#FF6B6B] text-black font-black uppercase border-4 border-black py-3 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ff5252] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer text-center text-lg";

  return (
    <>
      {/* Overlay oscuro cuando la luz está apagada */}
      {!luzEncendida && (
        <div className="fixed inset-0 bg-black/80 z-40 transition-all duration-300 pointer-events-none" />
      )}

      <BombillaPista
        luzEncendida={luzEncendida}
        onToggleLuz={() => setLuzEncendida(!luzEncendida)}
      />

      <div className={cardBgClass}>
        <button onClick={onBack} className={buttonVolverClass}>
          ← Volver al selector
        </button>

        <div className="border-b-4 border-black pb-4 mb-6">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
            Nivel 1: Test de psicomotricidad básica
          </h1>
          <p className="text-sm font-bold text-gray-700">
            Introduce el código doble factor de {DIGITOS} dígitos:
          </p>
        </div>

        <div className="bg-[#A3E635] text-black border-4 border-black p-3 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-center">
          <p className="text-xs font-black uppercase">Código recibido:</p>
          <p className="text-2xl font-black tracking-widest">{codigoDecoy}</p>
        </div>

        {/* Inputs */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChangeCode(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={inputClass}
            />
          ))}
        </div>

        {/* Pista oculta con luz apagada */}
        <div className="mb-6 h-8 flex items-center justify-center">
          {luzEncendida ? (
            <p className="font-black text-xs select-none pointer-events-none text-white">
              https://www.youtube.com/watch?v=Aq5WXmQQooo
            </p>
          ) : (
            <p className="font-black tracking-widest text-center select-none text-[#A3E635] text-xl animate-pulse">
              {codigoCorrecto}
            </p>
          )}
        </div>

        {/* Estados */}
        {status === "success" && (
          <div className="bg-[#4ADE80] text-black border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-center animate-bounce">
            ¡NIVEL COMPLETADO CON ÉXITO!
          </div>
        )}
        {status === "decoy_trap" && (
          <div className="bg-[#FFDE4D] text-black border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-center text-sm animate-bounce">
            Toca aquí para perder el tiempo
          </div>
        )}
        {status === "error" && (
          <div className="bg-[#F87171] text-black border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-center">
            CÓDIGO INCORRECTO. Inténtalo de nuevo.
          </div>
        )}

        <button
          onClick={status === "success" ? onBack : handleValidar}
          className={buttonValidarClass}
        >
          {status === "success" ? "Ir al menú de niveles" : "Verificar Código"}
        </button>
      </div>
    </>
  );
}
