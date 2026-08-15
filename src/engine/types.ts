export type LevelType = "official" | "community";

export type Dificultad = "facil" | "medio" | "dificil" | "legendario";

/**
 * Metadatos que declara cada nivel en su manifest.ts
 * El id debe coincidir exactamente con el nombre de la carpeta
 */
export interface LevelManifest {
  id: string;
  type: LevelType;

  order: number;

  titulo: string;
  descripcion: string;
  dificultad: Dificultad;

  autor: string;
  github?: string;
  color: string;
}

/**
 * Props que el engine pasa a cada nivel
 */
export interface LevelProps {
  onComplete: () => void;

  onBack: () => void;

  isCompleted: boolean;
}

export interface RegisteredLevel {
  manifest: LevelManifest;
  Component: React.ComponentType<LevelProps>;
}
