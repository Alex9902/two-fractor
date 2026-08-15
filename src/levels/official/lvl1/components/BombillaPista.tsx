import { useRef, useEffect, useState } from "react";

interface BombillaPistaProps {
  luzEncendida: boolean;
  onToggleLuz: () => void;
}

/**
 * Código de físicas sacado de la IA
 * No entiendo de física ;)
 */
interface CuerdaFisicaProps {
  x0: number;
  y0: number;
  onPull: () => void;
  luzEncendida: boolean;
}

function CuerdaFisica({ x0, y0, onPull, luzEncendida }: CuerdaFisicaProps) {
  const [state, setState] = useState({ theta: 0, omega: 0, length: 80, lengthVelocity: 0, x: x0, y: y0 + 80 });
  const [isDragging, setIsDragging] = useState(false);
  const pullActive = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const physicsRef = useRef({ theta: 0, omega: 0, length: 80, lengthVelocity: 0 });
  physicsRef.current.theta = state.theta;
  physicsRef.current.omega = state.omega;
  physicsRef.current.length = state.length;
  physicsRef.current.lengthVelocity = state.lengthVelocity;

  useEffect(() => {
    if (isDragging) return;

    let animFrameId: number;
    const g = 0.5;
    const L = 80;
    const damping = 0.988;
    const springK = 0.08;
    const springDamping = 0.92;

    const updatePhysics = () => {
      const { theta, omega, length, lengthVelocity } = physicsRef.current;

      const alpha = - (g / length) * Math.sin(theta);
      const nextOmega = (omega + alpha) * damping;
      const nextTheta = theta + nextOmega;

      const springForce = - springK * (length - L);
      const nextLengthVelocity = (lengthVelocity + springForce) * springDamping;
      const nextLength = length + nextLengthVelocity;

      physicsRef.current.theta = nextTheta;
      physicsRef.current.omega = nextOmega;
      physicsRef.current.length = nextLength;
      physicsRef.current.lengthVelocity = nextLengthVelocity;

      setState({
        theta: nextTheta,
        omega: nextOmega,
        length: nextLength,
        lengthVelocity: nextLengthVelocity,
        x: x0 + nextLength * Math.sin(nextTheta),
        y: y0 + nextLength * Math.cos(nextTheta),
      });

      animFrameId = requestAnimationFrame(updatePhysics);
    };

    animFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animFrameId);
  }, [isDragging, x0, y0]);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragOffsetRef.current = { x: e.clientX - state.x, y: e.clientY - state.y };
    setIsDragging(true);
    pullActive.current = false;
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      dragOffsetRef.current = { x: e.touches[0].clientX - state.x, y: e.touches[0].clientY - state.y };
    }
    setIsDragging(true);
    pullActive.current = false;
  };

  useEffect(() => {
    if (!isDragging) return;

    const L = 80;

    const handleMove = (clientX: number, clientY: number) => {
      const targetX = clientX - dragOffsetRef.current.x;
      const targetY = clientY - dragOffsetRef.current.y;
      
      const dx = targetX - x0;
      const dy = targetY - y0;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const angle = Math.atan2(dx, dy);

      if (dy > L + 20) {
        pullActive.current = true;
      }

      const currentLength = Math.min(dist, L + 50);
      const nextX = x0 + currentLength * Math.sin(angle);
      const nextY = y0 + currentLength * Math.cos(angle);

      setState(prev => ({
        ...prev,
        theta: angle,
        omega: 0,
        length: currentLength,
        lengthVelocity: 0,
        x: nextX,
        y: nextY,
      }));
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleRelease = () => {
      setIsDragging(false);
      
      if (pullActive.current) {
        onPull();
        setState(prev => ({
          ...prev,
          omega: prev.theta > 0 ? -0.04 : 0.04,
        }));
      } else {
        setState(prev => ({
          ...prev,
          omega: 0,
        }));
      }
      pullActive.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleRelease);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleRelease);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleRelease);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleRelease);
    };
  }, [isDragging, x0, y0, onPull]);

  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none z-50">
      <line
        x1={x0}
        y1={y0}
        x2={state.x}
        y2={state.y}
        stroke="black"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <g
        transform={`translate(${state.x}, ${state.y})`}
        className="pointer-events-auto cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <circle cx="2" cy="2" r="8" fill="black" />
        <circle
          cx="0"
          cy="0"
          r="8"
          fill={luzEncendida ? "#FF6B6B" : "#A3E635"}
          stroke="black"
          strokeWidth="3"
        />
      </g>
    </svg>
  );
}

export default function BombillaPista({ luzEncendida, onToggleLuz }: BombillaPistaProps) {
  const bulbRef = useRef<HTMLButtonElement | null>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const updateOrigin = () => {
      if (bulbRef.current) {
        const rect = bulbRef.current.getBoundingClientRect();
        setOrigin({
          x: rect.left + rect.width / 2,
          y: rect.bottom - 12,
        });
      }
    };

    updateOrigin();
    window.addEventListener("resize", updateOrigin);
    const timer = setTimeout(updateOrigin, 100);

    return () => {
      window.removeEventListener("resize", updateOrigin);
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {origin && (
        <CuerdaFisica
          x0={origin.x}
          y0={origin.y}
          onPull={onToggleLuz}
          luzEncendida={luzEncendida}
        />
      )}

      <button
        ref={bulbRef}
        onClick={onToggleLuz}
        className="fixed top-4 right-8 sm:top-6 sm:right-12 w-16 h-16 sm:w-24 sm:h-24 select-none cursor-pointer focus:outline-none transition-all hover:scale-105 active:scale-95 z-50"
        title="Pista"
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]"
        >
          <rect x="42" y="70" width="16" height="8" rx="2" fill="#9CA3AF" stroke="black" strokeWidth="4" />
          <rect x="44" y="78" width="12" height="6" rx="2" fill="#6B7280" stroke="black" strokeWidth="4" />
          
          <path
            d="M 32 45 C 32 28 68 28 68 45 C 68 55 58 60 58 70 L 42 70 C 42 60 32 55 32 45 Z"
            fill={luzEncendida ? "#FDE047" : "#4B5563"}
            stroke="black"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          <path
            d="M 46 70 L 46 55 L 50 50 L 54 55 L 54 70"
            stroke="black"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {luzEncendida && (
            <>
              <line x1="50" y1="12" x2="50" y2="22" stroke="black" strokeWidth="4" strokeLinecap="round" />
              <line x1="22" y1="25" x2="30" y2="31" stroke="black" strokeWidth="4" strokeLinecap="round" />
              <line x1="15" y1="50" x2="25" y2="50" stroke="black" strokeWidth="4" strokeLinecap="round" />
              <line x1="78" y1="25" x2="70" y2="31" stroke="black" strokeWidth="4" strokeLinecap="round" />
              <line x1="85" y1="50" x2="75" y2="50" stroke="black" strokeWidth="4" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>
    </>
  );
}
