/**
 * @description Two Fractor - Un juego sobre el doble factor de autenticación (2FA), o no
 * @author Alex Rojas Perez
 * @license MIT
 * @copyright 2026 Alex Rojas Perez
 */

import GameEngine from "./engine/GameEngine";

export default function App() {
  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] text-black font-sans flex flex-col items-center justify-center p-4 overflow-x-hidden">
      <GameEngine />

      {/* Footer */}
      <div className="mt-12 text-center text-xs font-black uppercase tracking-wider text-black/60">
        Two Fractor · Diseñado y Desarrollado por Alex Rojas Perez
      </div>
    </div>
  );
}