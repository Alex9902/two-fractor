import type { RegisteredLevel } from "../engine/types";
import NivelCard from "./NivelCard";
import SvgCandado from "./SvgCandado";

interface SelectorOficialProps {
  niveles: RegisteredLevel[];
  maxCompletado: number;
  onSelectNivel: (id: string) => void;
  onAbrirComunidad: () => void;
  onReiniciarProgreso: () => void;
}

export default function SelectorOficial({
  niveles,
  maxCompletado,
  onSelectNivel,
  onAbrirComunidad,
  onReiniciarProgreso,
}: SelectorOficialProps) {
  const nivelesOrdenados = [...niveles].sort(
    (a, b) => (a.manifest.order ?? 0) - (b.manifest.order ?? 0)
  );

  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      {/* Título */}
      <div className="text-center mb-8 sm:mb-10 w-full px-2">
        <h1 className="relative text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight mb-4 inline-block bg-[#FFDE4D] px-4 sm:px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-[90vw] break-words">
          Two Fractor
          <SvgCandado />
        </h1>
        <p className="text-lg font-bold text-gray-700 mt-4">
          No es un bug, es un easter egg que se me fue de las manos :(
        </p>
      </div>

      {/* Grid de niveles oficiales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8 px-1 sm:px-0">
        {nivelesOrdenados.map((nivel) => {
          const order = nivel.manifest.order ?? 0;
          const estaDesbloqueado = order <= maxCompletado + 1;
          const estaCompletado = order <= maxCompletado;

          return (
            <NivelCard
              key={nivel.manifest.id}
              manifest={nivel.manifest}
              estaDesbloqueado={estaDesbloqueado}
              estaCompletado={estaCompletado}
              onSelect={onSelectNivel}
            />
          );
        })}
      </div>

      {/* Acciones */}
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={onAbrirComunidad}
          className="bg-black text-white font-black uppercase border-4 border-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:bg-gray-900 transition-colors cursor-pointer"
        >
          Comunidad →
        </button>

        <button
          onClick={onReiniciarProgreso}
          className="bg-white text-black font-black uppercase border-4 border-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-colors cursor-pointer text-sm"
        >
          Reiniciar progreso
        </button>
      </div>
    </div>
  );
}
