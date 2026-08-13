import { useRef, useEffect, useState } from "react";
import { Nivel } from "../data/niveles";
import BombillaPista from "../components/BombillaPista";

interface PantallaJuegoProps {
  nivel: Nivel;
  code: string[];
  codigoCorrecto: string;
  codigoDecoy: string;
  status: "idle" | "success" | "error" | "decoy_trap";

  onChangeCode: (value: string, index: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  onVolver: () => void;
  onValidar: () => void;
}

export default function PantallaJuego({
  nivel,
  code,
  codigoCorrecto,
  codigoDecoy,
  status,
  onChangeCode,
  onKeyDown,
  onVolver,
  onValidar,
}: PantallaJuegoProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isNivel1 = nivel.id === 1;

  const [luzEncendida, setLuzEncendida] = useState(true);
  const logPrintado = useRef(false);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    //si mira consola en lvl 1
    if (nivel.id === 1 && !logPrintado.current) {
      console.log(
        "¿Qué buscas aquí, el any que se me escapó? display:no mucho;"
      );
      logPrintado.current = true;
    }
  }, [nivel.id]);

  const cardBgClass = "bg-white border-4 border-black p-6 sm:p-8 w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative transition-all duration-300";
  const buttonVolverClass = "bg-white text-black text-xs font-black uppercase border-2 border-black px-3 py-1.5 mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer";
  const borderBottomClass = "border-b-4 border-black pb-4 mb-6";
  const textLabelClass = "text-sm font-bold text-gray-700";

  const inputClass = () => {
    return "w-10 h-14 sm:w-11 sm:h-15 text-center text-xl font-black uppercase border-4 border-black rounded-none bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-[#38BDF8] focus:translate-y-[-2px] focus:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all";
  };

  const buttonValidarClass = status === "success"
    ? "w-full bg-[#A3E635] text-black font-black uppercase border-4 border-black py-3 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#92cf2c] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer text-center text-lg"
    : "w-full bg-[#FF6B6B] text-black font-black uppercase border-4 border-black py-3 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ff5252] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer text-center text-lg";

  return (
    <>
      {/*fondo apagar luz*/}
      {isNivel1 && !luzEncendida && (
        <div className="fixed inset-0 bg-black/80 z-40 transition-all duration-300 pointer-events-none" />
      )}

      {/*bombilla*/}
      {isNivel1 && (
        <BombillaPista
          luzEncendida={luzEncendida}
          onToggleLuz={() => setLuzEncendida(!luzEncendida)}
        />
      )}

      <div className={cardBgClass}>

        <button onClick={onVolver} className={buttonVolverClass}>
          ← Volver al selector
        </button>

        <div className={borderBottomClass}>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
            {nivel.titulo}
          </h1>
          <p className={textLabelClass}>
            Introduce el código doble factor de {nivel.digitos} dígitos:
          </p>
        </div>

        {isNivel1 ? (
          <div className="bg-[#A3E635] text-black border-4 border-black p-3 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-center">
            <p className="text-xs font-black uppercase">Código recibido:</p>
            <p className="text-2xl font-black tracking-widest">{codigoDecoy}</p>
          </div>
        ) : (
          //otros niveles código real? TODO:cambiar próxima pr
          <div className={`${nivel.color} border-4 border-black p-3 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-center`}>
            <p className="text-xs font-black uppercase text-black">Código recibido:</p>
            <p className="text-2xl font-black tracking-widest text-black">{codigoCorrecto}</p>
          </div>
        )}

        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}

              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => onChangeCode(e.target.value, index)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={inputClass()}
            />
          ))}
        </div>

        {/*si inspecciona elemento xD*/}
        {isNivel1 && (
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
        )}

        {/*estados*/}
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

        {/*botones*/}
        <button onClick={status === "success" ? onVolver : onValidar} className={buttonValidarClass}>
          {status === "success" ? "Ir al menú de niveles" : "Verificar Código"}
        </button>

      </div>
    </>
  );
}
