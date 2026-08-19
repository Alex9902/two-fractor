import { create } from "zustand";
import { vec2 } from "gl-matrix";

export interface PhysicsBall {
  id: number;
  pos: vec2;
  vel: vec2;
  radius: number;
  color: string;
  number?: number;
}

interface BomboPhysicsState {
  mainBalls: PhysicsBall[];
  glassBalls: PhysicsBall[];
  explosionBalls: PhysicsBall[];
  isSpinning: boolean;
  isExploded: boolean;
  setIsSpinning: (spinning: boolean) => void;
  initPhysics: () => void;
  triggerExplosion: (originX: number, originY: number, screenW: number, screenH: number) => void;
  stepPhysics: (screenW?: number, screenH?: number) => void;
}

const BALL_COLORS = [
  "#EF4444", // Rojo
  "#3B82F6", // Azul
  "#22C55E", // Verde
  "#F59E0B", // Amarillo/Naranja
  "#A855F7", // Morado
  "#EC4899", // Rosa
  "#06B6D4", // Cian
  "#10B981", // Esmeralda
  "#F97316", // Naranja
  "#6366F1", // Indigo
  "#EAB308", // Amarillo oro
  "#14B8A6", // Turquesa
];

const MAIN_CENTER = vec2.fromValues(150, 90);
const MAIN_BOUND_R = 64;

const GLASS_CENTER = vec2.fromValues(150, 90);
const GLASS_BOUND_R = 21;

const RESTITUTION = 0.85;
const GRAVITY = 0.35;
const DAMPING = 0.985;

export const useBomboPhysicsStore = create<BomboPhysicsState>((set, get) => ({
  mainBalls: [],
  glassBalls: [],
  explosionBalls: [],
  isSpinning: false,
  isExploded: false,

  setIsSpinning: (spinning: boolean) => set({ isSpinning: spinning }),

  initPhysics: () => {
    const mainBalls: PhysicsBall[] = [];
    const numBolas = 45;

    for (let i = 0; i < numBolas; i++) {
      const angle = (i / 45) * Math.PI * 2 + (Math.random() - 0.5);
      const dist = Math.random() * 48 + 5;
      const x = 150 + Math.cos(angle) * dist;
      const y = 90 + Math.sin(angle) * dist;

      mainBalls.push({
        id: i,
        pos: vec2.fromValues(x, y),
        vel: vec2.fromValues((Math.random() - 0.5) * 2.5, (Math.random() - 0.5) * 2.5),
        radius: 6.2,
        color: BALL_COLORS[i % BALL_COLORS.length],
      });
    }

    const glassBalls: PhysicsBall[] = [];

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const dist = Math.random() * 8 + 3;
      const x = 150 + Math.cos(angle) * dist;
      const y = 90 + Math.sin(angle) * dist;

      glassBalls.push({
        id: i + 100,
        pos: vec2.fromValues(x, y),
        vel: vec2.fromValues((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5),
        radius: 5.5,
        color: BALL_COLORS[(i + 3) % BALL_COLORS.length],
      });
    }

    set({
      mainBalls,
      glassBalls,
      explosionBalls: [],
      isExploded: false,
    });
  },

  triggerExplosion: (originX: number, originY: number) => {
    const { mainBalls, glassBalls } = get();
    const explosionBalls: PhysicsBall[] = [];

    // Transferir bolas existentes con impulso de explosión radial
    const existing = [...mainBalls, ...glassBalls];
    existing.forEach((b, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 18 + 10;
      explosionBalls.push({
        id: i,
        pos: vec2.fromValues(originX + (Math.random() - 0.5) * 20, originY + (Math.random() - 0.5) * 20),
        vel: vec2.fromValues(Math.cos(angle) * speed, Math.sin(angle) * speed - 6),
        radius: Math.random() * 6 + 10,
        color: b.color,
        number: Math.floor(Math.random() * 90) + 1,
      });
    });

    // Generar 35 bolas adicionales para un estallido masivo de 80+ bolas
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 22 + 8;
      explosionBalls.push({
        id: i + 300,
        pos: vec2.fromValues(originX + (Math.random() - 0.5) * 30, originY + (Math.random() - 0.5) * 30),
        vel: vec2.fromValues(Math.cos(angle) * speed, Math.sin(angle) * speed - 8),
        radius: Math.random() * 6 + 10,
        color: BALL_COLORS[i % BALL_COLORS.length],
        number: Math.floor(Math.random() * 90) + 1,
      });
    }

    set({
      isExploded: true,
      explosionBalls,
      mainBalls: [],
      glassBalls: [],
    });
  },

  stepPhysics: (screenW = 1920, screenH = 1080) => {
    const { mainBalls, glassBalls, explosionBalls, isSpinning, isExploded } = get();

    const d = vec2.create();
    const n = vec2.create();
    const vRel = vec2.create();
    const impulseVec = vec2.create();

    // ─────────────────────────────────────────────────────────────
    // FÍSICA DE EXPLOSIÓN PANTALLA COMPLETA
    // ─────────────────────────────────────────────────────────────
    if (isExploded) {
      for (let i = 0; i < explosionBalls.length; i++) {
        const b = explosionBalls[i];

        // Gravedad y velocidad
        b.vel[1] += 0.45;
        vec2.scale(b.vel, b.vel, 0.99);
        vec2.add(b.pos, b.pos, b.vel);

        // Rebotes elásticos en las 4 fronteras de la pantalla
        if (b.pos[0] - b.radius < 0) {
          b.pos[0] = b.radius;
          b.vel[0] = Math.abs(b.vel[0]) * 0.85;
        } else if (b.pos[0] + b.radius > screenW) {
          b.pos[0] = screenW - b.radius;
          b.vel[0] = -Math.abs(b.vel[0]) * 0.85;
        }

        if (b.pos[1] - b.radius < 0) {
          b.pos[1] = b.radius;
          b.vel[1] = Math.abs(b.vel[1]) * 0.85;
        } else if (b.pos[1] + b.radius > screenH) {
          b.pos[1] = screenH - b.radius;
          b.vel[1] = -Math.abs(b.vel[1]) * 0.85;
        }
      }

      // Colisiones esfera-esfera entre bolas de explosión
      for (let i = 0; i < explosionBalls.length; i++) {
        for (let j = i + 1; j < explosionBalls.length; j++) {
          const bi = explosionBalls[i];
          const bj = explosionBalls[j];

          vec2.subtract(d, bj.pos, bi.pos);
          const dist = vec2.length(d);
          const minDist = bi.radius + bj.radius;

          if (dist < minDist && dist > 0) {
            vec2.scale(n, d, 1 / dist);
            const overlap = (minDist - dist) * 0.5;
            bi.pos[0] -= n[0] * overlap;
            bi.pos[1] -= n[1] * overlap;
            bj.pos[0] += n[0] * overlap;
            bj.pos[1] += n[1] * overlap;

            vec2.subtract(vRel, bj.vel, bi.vel);
            const velAlongNormal = vec2.dot(vRel, n);

            if (velAlongNormal < 0) {
              const impulseMag = -(1 + RESTITUTION) * velAlongNormal * 0.5;
              vec2.scale(impulseVec, n, impulseMag);
              vec2.subtract(bi.vel, bi.vel, impulseVec);
              vec2.add(bj.vel, bj.vel, impulseVec);
            }
          }
        }
      }

      set({ explosionBalls: [...explosionBalls] });
      return;
    }

    for (let i = 0; i < mainBalls.length; i++) {
      const b = mainBalls[i];

      if (isSpinning) {
        const toCenter = vec2.create();
        vec2.subtract(toCenter, b.pos, MAIN_CENTER);
        const distCenter = vec2.length(toCenter) || 1;

        const tangX = -toCenter[1] / distCenter;
        const tangY = toCenter[0] / distCenter;

        b.vel[0] += tangX * 1.8 + (Math.random() - 0.5) * 2.2;
        b.vel[1] += tangY * 1.8 + (Math.random() - 0.5) * 2.2 - 0.5;

      } else {
        b.vel[1] += GRAVITY;
      }

      vec2.scale(b.vel, b.vel, DAMPING);
      vec2.add(b.pos, b.pos, b.vel);
      vec2.subtract(d, b.pos, MAIN_CENTER);

      const distFromCenter = vec2.length(d);
      const maxR = MAIN_BOUND_R - b.radius;

      if (distFromCenter > maxR && distFromCenter > 0) {
        vec2.scale(n, d, 1 / distFromCenter);

        b.pos[0] = MAIN_CENTER[0] + n[0] * maxR;
        b.pos[1] = MAIN_CENTER[1] + n[1] * maxR;

        const dot = vec2.dot(b.vel, n);
        if (dot > 0) {
          b.vel[0] -= (1 + RESTITUTION) * dot * n[0];
          b.vel[1] -= (1 + RESTITUTION) * dot * n[1];
        }
      }
    }

    for (let i = 0; i < mainBalls.length; i++) {
      for (let j = i + 1; j < mainBalls.length; j++) {
        const bi = mainBalls[i];
        const bj = mainBalls[j];

        vec2.subtract(d, bj.pos, bi.pos);
        const dist = vec2.length(d);
        const minDist = bi.radius + bj.radius;

        if (dist < minDist && dist > 0) {
          vec2.scale(n, d, 1 / dist);
          const overlap = (minDist - dist) * 0.5;
          bi.pos[0] -= n[0] * overlap;
          bi.pos[1] -= n[1] * overlap;
          bj.pos[0] += n[0] * overlap;
          bj.pos[1] += n[1] * overlap;

          vec2.subtract(vRel, bj.vel, bi.vel);
          const velAlongNormal = vec2.dot(vRel, n);

          if (velAlongNormal < 0) {
            const impulseMag = -(1 + RESTITUTION) * velAlongNormal * 0.5;
            vec2.scale(impulseVec, n, impulseMag);
            vec2.subtract(bi.vel, bi.vel, impulseVec);
            vec2.add(bj.vel, bj.vel, impulseVec);
          }
        }
      }
    }

    for (let i = 0; i < glassBalls.length; i++) {
      const b = glassBalls[i];

      if (isSpinning) {
        b.vel[0] += (Math.random() - 0.5) * 3.5;
        b.vel[1] += (Math.random() - 0.5) * 3.5;
      } else {
        b.vel[1] += GRAVITY * 0.6;
      }

      vec2.scale(b.vel, b.vel, DAMPING);
      vec2.add(b.pos, b.pos, b.vel);
      vec2.subtract(d, b.pos, GLASS_CENTER);

      const distFromCenter = vec2.length(d);
      const maxR = GLASS_BOUND_R - b.radius;

      if (distFromCenter > maxR && distFromCenter > 0) {
        vec2.scale(n, d, 1 / distFromCenter);
        b.pos[0] = GLASS_CENTER[0] + n[0] * maxR;
        b.pos[1] = GLASS_CENTER[1] + n[1] * maxR;

        const dot = vec2.dot(b.vel, n);
        if (dot > 0) {
          b.vel[0] -= (1 + RESTITUTION) * dot * n[0];
          b.vel[1] -= (1 + RESTITUTION) * dot * n[1];
        }
      }
    }

    for (let i = 0; i < glassBalls.length; i++) {
      for (let j = i + 1; j < glassBalls.length; j++) {
        const bi = glassBalls[i];
        const bj = glassBalls[j];

        vec2.subtract(d, bj.pos, bi.pos);
        const dist = vec2.length(d);
        const minDist = bi.radius + bj.radius;

        if (dist < minDist && dist > 0) {
          vec2.scale(n, d, 1 / dist);
          const overlap = (minDist - dist) * 0.5;
          bi.pos[0] -= n[0] * overlap;
          bi.pos[1] -= n[1] * overlap;
          bj.pos[0] += n[0] * overlap;
          bj.pos[1] += n[1] * overlap;

          vec2.subtract(vRel, bj.vel, bi.vel);
          const velAlongNormal = vec2.dot(vRel, n);

          if (velAlongNormal < 0) {
            const impulseMag = -(1 + RESTITUTION) * velAlongNormal * 0.5;
            vec2.scale(impulseVec, n, impulseMag);
            vec2.subtract(bi.vel, bi.vel, impulseVec);
            vec2.add(bj.vel, bj.vel, impulseVec);
          }
        }
      }
    }

    set({
      mainBalls: [...mainBalls],
      glassBalls: [...glassBalls],
    });
  },
}));
