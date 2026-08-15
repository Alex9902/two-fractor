import { Nivel } from "../data/niveles";

interface NivelCardProps {
  nivel: Nivel;
  estaDesbloqueado: boolean;
  estaCompletado: boolean;
  onSelect: (nivelId: number) => void;
}

export default function NivelCard({
  nivel,
  estaDesbloqueado,
  estaCompletado,
  onSelect,
}: NivelCardProps) {
  return (
    <div
      className={`h-full border-4 border-black p-6 sm:p-8 flex flex-col justify-between transition-all relative ${
        estaDesbloqueado
          ? `${nivel.color} cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`
          : "bg-[#E5E5E0] text-black/40 border-black/40 shadow-none cursor-not-allowed"
      }`}
      onClick={() => estaDesbloqueado && onSelect(nivel.id)}
    >
      {/* Candado / Checkmark indicador */}
      <div className="flex justify-end items-center mb-4 min-h-[28px]">
        {estaCompletado ? (
          <span className="text-xs font-black uppercase border-2 border-black bg-white text-black px-2 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            Listo
          </span>
        ) : !estaDesbloqueado ? (
          <span className="text-xs font-black uppercase text-black/40 border-2 border-dashed border-black/20 px-2 py-0.5">
            Bloqueado
          </span>
        ) : (
          <span className="text-xs font-black uppercase border-2 border-black bg-white text-black px-2 py-0.5">
            Disponible
          </span>
        )}
      </div>

      <div>
        <h2 className="text-lg md:text-base lg:text-xl font-black uppercase mb-2 leading-tight">{nivel.titulo}</h2>
        <p className={`text-sm font-semibold mb-8 ${estaDesbloqueado ? "text-gray-800" : "text-black/30"}`}>
          {nivel.descripcion}
        </p>
      </div>

      {estaDesbloqueado ? (
        <button className="w-full text-center bg-white text-black font-black uppercase border-2 border-black py-3 text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {estaCompletado ? "Repetir Nivel" : "Jugar Nivel"}
        </button>
      ) : (
        <div className="w-full text-center bg-gray-300/50 text-black/30 font-black uppercase border-2 border-dashed border-black/20 py-3 text-base">
          Bloqueado
        </div>
      )}
    </div>
  );
}
