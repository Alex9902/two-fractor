/**
 * @description Two Fractor - Un juego sobre el doble factor de autenticación (2FA), o no :?
 * @author Alex Rojas Perez
 * @license MIT
 * @copyright 2026 Alex Rojas Perez
 */

import GameEngine from "./engine/GameEngine";

export default function App() {
  return (
    <div className="w-full min-h-screen bg-[#FAF9F6] text-black font-sans flex flex-col justify-between items-center p-2 sm:p-3 overflow-x-hidden">
      <GameEngine />
    </div>
  );
}