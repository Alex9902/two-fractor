import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import type { LevelManifest, LevelProps } from "../src/engine/types";
import React from "react";

const manifests = import.meta.glob<true, string, { default: LevelManifest }>(
  "../src/levels/*/*/manifest.ts",
  { eager: true }
);

const components = import.meta.glob<true, string, { default: React.ComponentType<LevelProps> }>(
  "../src/levels/*/*/index.tsx",
  { eager: true }
);

describe("Suite de Pruebas de Niveles (Oficiales y Comunidad)", () => {
  const levelEntries = Object.keys(manifests)
    .filter((path) => !path.includes("/_template/"))
    .map((path) => {
      const match = path.match(/\/levels\/(official|community)\/([^/]+)\/manifest\.ts$/);
      const category = match ? match[1] : "";
      const folderName = match ? match[2] : "";

      const manifestModule = manifests[path];
      const manifest = manifestModule?.default;

      const componentPath = path.replace("manifest.ts", "index.tsx");
      const componentModule = components[componentPath];
      const Component = componentModule ? componentModule.default : null;

      return {
        category,
        folderName,
        manifest,
        Component,
      };
    });

  it("Debe haber al menos un nivel registrado", () => {
    expect(levelEntries.length).toBeGreaterThan(0);
  });

  levelEntries.forEach(({ category, folderName, manifest, Component }) => {
    describe(`Nivel: [${category.toUpperCase()}] ${folderName}`, () => {

      it("Debe tener un manifest.ts válido y con campos obligatorios", () => {
        expect(manifest).toBeDefined();
        expect(manifest.id).toBe(folderName);
        expect(["official", "community"]).includes(manifest.type);
        expect(typeof manifest.order).toBe("number");
        expect(typeof manifest.titulo).toBe("string");
        expect(typeof manifest.descripcion).toBe("string");
        expect(["facil", "medio", "dificil", "legendario"]).includes(manifest.dificultad);
        expect(typeof manifest.autor).toBe("string");
        expect(typeof manifest.color).toBe("string");
      });

      it("Debe exportar un componente de React en index.tsx", () => {
        expect(Component).toBeDefined();
        expect(typeof Component).toBe("function");
      });

      it("Debes renderizar correctamente sin lanzar excepciones (estado inicial)", () => {
        if (!Component) return;

        const onComplete = vi.fn();
        const onBack = vi.fn();

        const { container } = render(
          <Component onComplete={onComplete} onBack={onBack} isCompleted={false} />
        );

        expect(container).toBeDefined();
        expect(container.firstChild).not.toBeNull();
      });

      it("Debe renderizar correctamente cuando el nivel ya está completado (isCompleted: true)", () => {
        if (!Component) return;

        const onComplete = vi.fn();
        const onBack = vi.fn();

        const { container } = render(
          <Component onComplete={onComplete} onBack={onBack} isCompleted={true} />
        );

        expect(container).toBeDefined();
        expect(container.firstChild).not.toBeNull();
      });
    });
  });
});
