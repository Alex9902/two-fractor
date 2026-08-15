/**
 * @description Two Fractor - Un juego sobre el doble factor de autenticación (2FA)
 * @author Alex Rojas Perez
 * @license MIT
 * @copyright 2026 Alex Rojas Perez
 */

import { useState } from "react";
import { NIVELES } from "./data/niveles";
import SelectorNiveles from "./views/SelectorNiveles";
import PantallaJuego from "./views/PantallaJuego";

export default function App() {
  //se guarda en localstorage el progreso
  const [maxNivelDesbloqueado, setMaxNivelDesbloqueado] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("two-fractor-progress");
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  const [nivelActivo, setNivelActivo] = useState<number | null>(null);
  const [codigoCorrecto, setCodigoCorrecto] = useState<string>("");
  const [codigoDecoy, setCodigoDecoy] = useState<string>("");
  const [code, setCode] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "decoy_trap">("idle");

  const iniciarNivel = (nivelId: number) => {
    const nivel = NIVELES.find((n) => n.id === nivelId);
    if (!nivel) return;

    //código random
    const min = Math.pow(10, nivel.digitos - 1);
    const max = Math.pow(10, nivel.digitos) - 1;
    const randomCode = Math.floor(min + Math.random() * (max - min)).toString();

    let decoyCode = "";

    if (nivelId === 1) {
      do {
        decoyCode = Math.floor(min + Math.random() * (max - min)).toString();
      } while (decoyCode === randomCode);
    }

    if (nivelId === 2) {
      const palabrasNivel2 = [
        "CODIGO", "ACCESO", "SEGURO", "FACTOR",
        "CORREO", "HUELLA", "ROSTRO", "DOBLES"
      ];

      const palabraRandom = palabrasNivel2[Math.floor(Math.random() * palabrasNivel2.length)];
      setCodigoCorrecto(palabraRandom);
    } else {
      setCodigoCorrecto(randomCode);
    }
    setCodigoDecoy(decoyCode);
    setCode(Array(nivel.digitos).fill(""));
    setStatus("idle");
    setNivelActivo(nivelId);
  };

  const handleChangeCode = (value: string, index: number) => {
    const nivel = NIVELES.find((n) => n.id === nivelActivo);

    if (!nivel) return;
    if (value !== "" && !/^[0-9]$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setStatus("idle");

    if (value !== "" && index < nivel.digitos - 1) {
      const nextInput = document.querySelectorAll<HTMLInputElement>('input[type="text"]')[index + 1];
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const inputs = document.querySelectorAll<HTMLInputElement>('input[type="text"]');

      if (code[index] === "" && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        inputs[index - 1]?.focus();

      } else {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
      setStatus("idle");
    }
  };

  const validarCodigo = (codigoIngresadoManual?: string) => {
    const nivel = NIVELES.find((n) => n.id === nivelActivo);
    if (!nivel) return;

    const codigoIngresado = codigoIngresadoManual !== undefined ? codigoIngresadoManual : code.join("");

    if (codigoIngresado === codigoCorrecto) {
      setStatus("success");

      //desbloquea siguiente lvl
      if (nivel.id === maxNivelDesbloqueado && nivel.id < NIVELES.length) {
        const nuevoMax = nivel.id + 1;
        setMaxNivelDesbloqueado(nuevoMax);
        try {
          localStorage.setItem("two-fractor-progress", nuevoMax.toString());
        } catch (e) {
          console.error("Error guardando progreso:", e);
        }
      }

    } else if (nivel.id === 1 && codigoIngresado === codigoDecoy) {
      setStatus("decoy_trap");
    } else {
      setStatus("error");
    }
  };

  const volverAlInicio = () => {
    setNivelActivo(null);
    setCode([]);
    setStatus("idle");
  };



  const nivelActualObjeto = NIVELES.find((n) => n.id === nivelActivo);

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] text-black font-sans flex flex-col items-center justify-center p-4 overflow-x-hidden">
      {nivelActivo === null || !nivelActualObjeto ? (
        <SelectorNiveles
          maxNivelDesbloqueado={maxNivelDesbloqueado}
          onSelectNivel={iniciarNivel}
        />
      ) : (
        <PantallaJuego
          nivel={nivelActualObjeto}
          code={code}
          codigoCorrecto={codigoCorrecto}
          codigoDecoy={codigoDecoy}
          status={status}
          onChangeCode={handleChangeCode}
          onKeyDown={handleKeyDown}
          onVolver={volverAlInicio}
          onValidar={validarCodigo}
        />
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-xs font-black uppercase tracking-wider text-black/60">
        Two Fractor · Diseñado y Desarrollado por Alex Rojas Perez
      </div>
    </div>
  );
}