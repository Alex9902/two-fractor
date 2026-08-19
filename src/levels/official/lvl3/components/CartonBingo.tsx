export interface CasillaBingo {
  id: number;
  numero: number;
  letra: string;
  tachada: boolean;
}

interface CartonBingoProps {
  casillas: CasillaBingo[];
  onTacharNumero: (numero: number) => void;
  esBingoCompletado: boolean;
}

export default function CartonBingo({
  casillas,
  onTacharNumero,
  esBingoCompletado,
}: CartonBingoProps) {
  const columnas = ["B", "I", "N", "G", "O"];

  return (
    <div className="relative w-full select-none">
      <div className="relative z-20 transition-transform duration-300">
        {/* Cartón de Bingo Neobrutalista */}
        <div
          className={`bg-[#FFFBEB] border-3 sm:border-5 border-black rounded-xl p-2.5 sm:p-3.5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all ${
            esBingoCompletado ? "ring-6 ring-[#4ADE80] animate-bounce" : ""
          }`}
        >
          {/* Cabecera del Cartón */}
          <div className="grid grid-cols-5 gap-1 mb-2">
            {columnas.map((letra, idx) => (
              <div
                key={idx}
                className="bg-[#FFDE4D] border-2 sm:border-3 border-black text-black font-black text-sm sm:text-lg text-center py-0.5 rounded shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
              >
                {letra}
              </div>
            ))}
          </div>

          {/* Grid de Casillas */}
          <div className="grid grid-cols-5 gap-1">
            {casillas.map((casilla) => (
              <button
                key={casilla.id}
                type="button"
                onClick={() => onTacharNumero(casilla.numero)}
                className={`relative aspect-square border-2 sm:border-3 border-black rounded font-black text-sm sm:text-xl flex items-center justify-center transition-all cursor-pointer ${
                  casilla.tachada
                    ? "bg-[#FF6B6B]/20 text-black/40 shadow-none scale-95"
                    : "bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FEF08A] hover:scale-105 active:translate-x-[1px] active:translate-y-[1px]"
                }`}
              >
                <span>{casilla.numero}</span>

                {/* Sello de tinta roja */}
                {casilla.tachada && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 border-3 border-[#EF4444] rounded-full flex items-center justify-center transform rotate-[-12deg] bg-[#EF4444]/30 shadow-inner">
                      <span className="font-mono font-black text-sm sm:text-lg text-[#DC2626] transform rotate-[15deg]">
                        X
                      </span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Pie del cartón */}
          <div className="mt-2 flex justify-between items-center text-[9px] font-black uppercase text-gray-600 border-t border-black/20 pt-1">
            <span>SERIE: 2FA-2026</span>
            <span>CARTÓN #042</span>
          </div>
        </div>
      </div>
    </div>
  );
}
