interface SelectorComunidadProps {
  onBack: () => void;
}

export default function SelectorComunidad({ onBack }: SelectorComunidadProps) {
  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      <div className="w-full flex justify-start mb-6">
        <button
          onClick={onBack}
          className="bg-white text-black font-black uppercase border-4 border-black px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer text-sm"
        >
          ← Niveles oficiales
        </button>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight mb-4 inline-block bg-[#A855F7] text-white px-6 py-2 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          Comunidad
        </h1>
        <p className="text-lg font-bold text-gray-700 mt-4">
          Niveles creados por la comunidad · Próximamente
        </p>
      </div>

      <div className="border-4 border-dashed border-black/30 p-12 text-center w-full max-w-lg">
        <p className="text-2xl font-black uppercase text-black/40 mb-4">
          Aún no hay niveles
        </p>
        <p className="text-sm font-bold text-gray-500">
          ¿Quieres crear uno? Abre una PR en GitHub siguiendo la plantilla en{" "}
          <code className="bg-black/10 px-1">src/levels/_template/</code>
        </p>
      </div>
    </div>
  );
}
