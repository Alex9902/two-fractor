export interface Nivel {
  id: number;
  titulo: string;
  descripcion: string;
  digitos: number;
  color: string;
}

export const NIVELES: Nivel[] = [
  {
    id: 1,
    titulo: "Nivel 1: Test de psicomotricidad básica",
    descripcion: "Felicidades, sabes usar el ratón",
    digitos: 6,
    color: "bg-[#A855F7]"
  },
  {
    id: 2,
    titulo: "Nivel 2: ",
    descripcion: "No apto para menores de 35 años",
    digitos: 6,
    color: "bg-[#84CC16]"
  }
];
