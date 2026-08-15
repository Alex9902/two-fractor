import { useState } from "react";
import type { LevelProps } from "../../../engine/types";
import Nokia3310 from "./components/Nokia3310";

// Palabras de 6 letras para el teclado T9
const PALABRAS_T9 = [
  "CODIGO", "ACCESO", "SEGURO", "FACTOR",
  "CORREO", "HUELLA", "ROSTRO", "DOBLES",
];

export default function Lvl2({ onComplete, onBack }: LevelProps) {
  const [codigoCorrecto] = useState(
    () => PALABRAS_T9[Math.floor(Math.random() * PALABRAS_T9.length)]
  );

  return (
    <Nokia3310
      codigoCorrecto={codigoCorrecto}
      onValidar={() => onComplete()}
      onVolver={onBack}
      status="idle"
    />
  );
}
