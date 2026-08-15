import type { LevelProps } from "../../engine/types";
import manifest from "./manifest";
import AuthorBadge from "../../shared/AuthorBadge";

/**
 * Punto de entrada de tu nivel
 *
 * Tienes libertad total para implementar lo que quieras aquí
 * Reglas:
 *  - Llama a `onComplete()` cuando el jugador gane
 *  - Llama a `onBack()` cuando el jugador quiera salir
 *  - Puedes usar `isCompleted` para mostrar UI especial si el nivel ya fue superado
 *
 * Puedes añadir subcarpetas (components/, hooks/, etc.) dentro de tu carpeta de nivel
 * Puedes colocar <AuthorBadge /> para que salga badge de tu github
 */
export default function MiNivel({ onComplete, onBack, isCompleted }: LevelProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8 relative">
      <button
        onClick={onBack}
        className="self-start bg-white border-4 border-black font-black uppercase px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer"
      >
        ← Volver
      </button>

      <h1 className="text-4xl font-black uppercase">{manifest.titulo}</h1>

      {isCompleted && (
        <p className="text-green-600 font-bold">¡Ya completaste este nivel!</p>
      )}

      {/* Tu lógica aquí */}
      <button
        onClick={onComplete}
        className="bg-black text-white font-black uppercase px-8 py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:bg-gray-900 cursor-pointer"
      >
        Completar nivel
      </button>

      {/* Insignia del autor con enlace a su GitHub */}
      <AuthorBadge autor={manifest.autor} github={manifest.github} />
    </div>
  );
}
