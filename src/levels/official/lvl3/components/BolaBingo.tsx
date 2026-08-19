interface BolaBingoProps {
  letra: string;
  numero: number;
  size?: "sm" | "md" | "lg";
  destacada?: boolean;
  onClick?: () => void;
}

const COLOR_LETRAS: Record<string, { bg: string; text: string }> = {
  B: { bg: "bg-[#FF6B6B]", text: "text-black" },
  I: { bg: "bg-[#FFDE4D]", text: "text-black" },
  N: { bg: "bg-[#4ADE80]", text: "text-black" },
  G: { bg: "bg-[#38BDF8]", text: "text-black" },
  O: { bg: "bg-[#C084FC]", text: "text-black" },
};

export default function BolaBingo({
  letra,
  numero,
  size = "md",
  destacada = false,
  onClick,
}: BolaBingoProps) {
  const color = COLOR_LETRAS[letra.toUpperCase()] || { bg: "bg-[#FFDE4D]", text: "text-black" };

  const sizeClasses = {
    sm: "w-10 h-10 text-xs border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
    md: "w-14 h-14 text-sm border-3 sm:border-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
    lg: "w-20 h-20 sm:w-24 sm:h-24 text-base sm:text-lg border-4 sm:border-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]",
  };

  const innerCircleSize = {
    sm: "w-6 h-6 border",
    md: "w-9 h-9 border-2",
    lg: "w-12 h-12 sm:w-14 sm:h-14 border-3",
  };

  return (
    <div
      onClick={onClick}
      className={`relative rounded-full flex flex-col items-center justify-center border-black select-none transition-transform ${
        color.bg
      } ${sizeClasses[size]} ${destacada ? "animate-bounce scale-110 z-10" : ""} ${
        onClick ? "cursor-pointer hover:scale-105 active:scale-95" : ""
      }`}
    >
      <div
        className={`rounded-full bg-white border-black flex flex-col items-center justify-center leading-none ${innerCircleSize[size]}`}
      >
        <span className="font-black uppercase text-[0.6em] text-gray-500">{letra}</span>
        <span className="font-black text-[0.9em] text-black leading-none">{numero}</span>
      </div>
    </div>
  );
}
