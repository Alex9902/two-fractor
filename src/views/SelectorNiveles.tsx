import { NIVELES } from "../data/niveles";
import NivelCard from "../components/NivelCard";
import SvgCandado from "../components/SvgCandado";

interface SelectorNivelesProps {
  maxNivelDesbloqueado: number;
  onSelectNivel: (nivelId: number) => void;
  onReiniciarProgreso: () => void;
}

export default function SelectorNiveles({
  maxNivelDesbloqueado,
  onSelectNivel,
  onReiniciarProgreso,
}: SelectorNivelesProps) {
  return (
    <div className="w-full max-w-4xl flex flex-col items-center">

      {/*título*/}
      <div className="text-center mb-10">
        <h1 className="relative text-6xl sm:text-7xl font-black uppercase tracking-tight mb-4 inline-block bg-[#FFDE4D] px-6 py-2 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          Two Fractor
          <SvgCandado />
        </h1>
        <p className="text-lg font-bold text-gray-700 mt-4">
          No es un bug, es un easter egg que se me fue de las manos :(
        </p>
      </div>

      {/*niveles*/}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
        {NIVELES.map((nivel) => {
          const estaDesbloqueado = nivel.id <= maxNivelDesbloqueado;
          const estaCompletado = nivel.id < maxNivelDesbloqueado;

          return (
            <NivelCard
              key={nivel.id}
              nivel={nivel}
              estaDesbloqueado={estaDesbloqueado}
              estaCompletado={estaCompletado}
              onSelect={onSelectNivel}
            />
          );
        })}
      </div>
    </div>
  );
}
