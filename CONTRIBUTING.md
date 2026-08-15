# Contribuir un Nivel

Cada nivel es un módulo independiente. No modifiques el motor ni archivos principales.

## Pasos

1. **Fork y rama**
   ```bash
   git checkout -b community/nombre-nivel
   ```

2. **Copiar plantilla**
   Copiar `src/levels/_template/` a `src/levels/community/nombre-nivel/`.

3. **Configurar `manifest.ts`**
   ```ts
   import type { LevelManifest } from "../../engine/types";

   const manifest: LevelManifest = {
     id: "nombre-nivel", // Debe coincidir con la carpeta
     type: "community",
     order: 999,

     titulo: "Título de tu Nivel",
     descripcion: "Descripción del objetivo 2FA",

     dificultad: "medio", // "facil" | "medio" | "dificil" | "legendario"
     autor: "TuNombre",
     github: "TuUsuarioGithub",

     color: "bg-[#6366F1]",
   };

   export default manifest;
   ```

4. **Desarrollar `index.tsx`**
   Llamar a `onComplete()` al ganar y a `onBack()` para salir. Usar `<AuthorBadge />` para incluir tu crédito de GitHub.

5. **Validar localmente**
   ```bash
   npm test
   node test/validate-manifests.js
   npx tsc -p ts.config.json --noEmit
   npm run build
   ```

6. **Enviar PR**
   Añadir únicamente tu carpeta en `src/levels/community/nombre-nivel/` y abrir Pull Request a `main`.
