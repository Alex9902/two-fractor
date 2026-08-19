import { useState, useRef, useEffect } from "react";

interface PortatilFondoProps {
  codigoMostrado: string[];
  totalNumerosObjetivo: number;
  numerosTachadosCount: number;
  esBingoCompletado: boolean;
}

export default function PortatilFondo({
  codigoMostrado,
  totalNumerosObjetivo,
  numerosTachadosCount,
  esBingoCompletado,
}: PortatilFondoProps) {
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!esBingoCompletado) {
      setDragPos({ x: 0, y: 0 });
    }
  }, [esBingoCompletado]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, a, input")) return;

    setIsDragging(true);

    dragStartRef.current = {
      x: e.clientX - dragPos.x,
      y: e.clientY - dragPos.y,
    };

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch { }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    setDragPos({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);

      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch { }
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        transform: `translate3d(${dragPos.x}px, ${dragPos.y}px, 0px)`,
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
        willChange: isDragging ? "transform" : "auto",
      }}
      className="w-full max-w-3xl mx-auto select-none"
    >
      {/* Marco exterior del portátil */}
      <div className="bg-[#1E293B] border-4 sm:border-6 border-black rounded-t-2xl p-3 sm:p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        {/* Cámara web */}
        <div className="w-3 h-3 bg-black rounded-full mx-auto mb-2 border border-gray-600 flex items-center justify-center">
          <div className="w-1 h-1 bg-blue-400 rounded-full" />
        </div>

        {/* Pantalla del portátil */}
        <div className="bg-[#FAF9F6] border-3 sm:border-4 border-black rounded-lg p-3 sm:p-4 text-black font-sans min-h-[220px] sm:min-h-[260px] flex flex-col justify-between shadow-[inset_2px_2px_0px_rgba(0,0,0,0.15)]">
          {/* Barra superior de la ventana */}
          <div className="bg-[#FFDE4D] border-2 sm:border-3 border-black p-2 rounded flex items-center justify-between mb-2 sm:mb-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex gap-1.5 items-center">
              <div className="w-3 h-3 rounded-full bg-[#FF6B6B] border border-black" />
              <div className="w-3 h-3 rounded-full bg-[#FFDE4D] border border-black" />
              <div className="w-3 h-3 rounded-full bg-[#4ADE80] border border-black" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider ml-1 text-black">
                BingoMail · Verificación 2FA
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-mono font-bold bg-white text-black border border-black px-2 py-0.5 rounded">
              SSL SECURE
            </span>
          </div>

          {/* Cuerpo del correo */}
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="border-b-2 border-black pb-2 flex justify-between items-center">
              <div>
                <p className="font-black text-black text-xs sm:text-sm uppercase">De: seguridad@bingo2fa.internal</p>
                <p className="font-extrabold text-sm sm:text-base uppercase tracking-tight text-black">
                  Código de Verificación 2FA
                </p>
              </div>
              <span className="bg-[#A855F7] text-white font-black text-[10px] sm:text-xs uppercase px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                URGENTE
              </span>
            </div>

            <p className="font-semibold text-gray-800 leading-snug text-xs sm:text-sm">
              Siga el sorteo del bombo y tache los números de su cartón para obtener su token de seguridad de 6 dígitos.
            </p>

            {/* Visualizador de dígitos 2FA */}
            <div className="pt-2">
              <div className="flex justify-end pr-2 sm:pr-6 gap-2 my-1">
                {Array.from({ length: 6 }).map((_, i) => {
                  const val = codigoMostrado[i];
                  return (
                    <div
                      key={i}
                      className={`w-9 h-11 sm:w-11 sm:h-14 border-3 sm:border-4 border-black font-mono font-black text-base sm:text-xl flex items-center justify-center transition-all ${val
                          ? "bg-[#4ADE80] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-105"
                          : "bg-white text-gray-300 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)]"
                        }`}
                    >
                      {val || "_"}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Banner de estado del Bingo */}
          <div className="mt-2 sm:mt-3">
            {esBingoCompletado ? (
              <div className="bg-[#4ADE80] border-3 border-black p-2 rounded text-center font-black uppercase text-xs sm:text-sm tracking-wider animate-bounce shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                ¡BINGO DETECTADO! CÓDIGO VERIFICADO
              </div>
            ) : (
              <div className="bg-white border-2 border-black p-1.5 rounded flex justify-between items-center text-xs font-bold">
                <span>Progreso cartón:</span>
                <span className="font-black text-[#A855F7]">
                  {numerosTachadosCount} / {totalNumerosObjetivo} ACIERTOS
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Base del portátil */}
      <div className="bg-[#334155] border-4 border-t-0 border-black rounded-b-xl h-4 sm:h-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] relative flex items-center justify-center">
        <div className="w-16 h-1.5 bg-[#1E293B] rounded-full border border-black" />
      </div>
    </div>
  );
}
