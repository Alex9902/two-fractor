import type { LevelManifest } from "../../engine/types";

/**
 * IMPORTANTE: Cambia todos los valores. El id DEBE coincidir con el nombre de la carpeta
 * Los niveles de la comunidad siempre "community"
 * order: se asignara en el merge de la PR, pon un número de ejemplo
 */
const manifest: LevelManifest = {
  id: "XXX-nombre-de-tu-nivel",
  type: "community",
  order: 999,

  titulo: "Nombre de tu nivel",
  descripcion: "Descripción breve de qué hay que hacer",

  dificultad: "medio",
  autor: "tu-nombre",
  github: "tu-usuario-github",
  tags: ["etiqueta1", "etiqueta2"],
  color: "bg-[#6366F1]",
};

export default manifest;
