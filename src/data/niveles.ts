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
    color: "bg-[#A3E635]"
  },
  //próxima pr
];
