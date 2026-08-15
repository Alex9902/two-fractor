export default function SvgCandado() {
  return (
    <svg
      className="absolute -top-5 right-0 sm:-top-7 sm:-right-6 w-9 h-9 sm:w-16 sm:h-16 drop-shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] rotate-[15deg] select-none"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 32 50 L 32 33 C 32 20 42 20 47 25"
        stroke="black"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 68 50 L 68 25 C 68 10 58 10 53 17"
        stroke="black"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Cuerpo del candado (dividido con grieta en zig-zag) */}
      {/* Mitad Izquierda */}
      <path
        d="M 20 50 L 47 50 L 40 58 L 50 68 L 43 82 L 20 82 Z"
        fill="#FF6B6B"
        stroke="black"
        strokeWidth="5"
        strokeLinejoin="miter"
      />
      {/* Mitad Derecha (desplazada un poco para mostrar separación) */}
      <path
        d="M 80 50 L 53 50 L 46 58 L 56 68 L 49 82 L 80 82 Z"
        fill="#FF6B6B"
        stroke="black"
        strokeWidth="5"
        strokeLinejoin="miter"
      />

      {/* Ojo de la cerradura (partido por la mitad) */}
      <path
        d="M 45 62 C 43 62 42 63 42 65 C 42 67 43 68 44 69 L 42 75 L 45 75 Z"
        fill="black"
      />
      <path
        d="M 55 62 C 57 62 58 63 58 65 C 58 67 57 68 56 69 L 58 75 L 55 75 Z"
        fill="black"
      />
    </svg>
  );
}
