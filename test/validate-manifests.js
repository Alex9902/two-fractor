#!/usr/bin/env node
/**
 * Valida que cada nivel en src/levels/ tiene la estructura correcta:
 * - manifest.ts exporta un objeto con los campos requeridos
 * - index.tsx existe
 * - El id del manifest coincide con el nombre de la carpeta
 *
 * Se ejecuta en GitHub Actions antes de mergear PR
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LEVELS_DIR = path.join(__dirname, "..", "src", "levels");
const REQUIRED_MANIFEST_FIELDS = ["id", "type", "order", "titulo", "descripcion", "dificultad", "autor", "tags", "color"];
const VALID_TYPES = ["official", "community"];
const VALID_DIFICULTADES = ["facil", "medio", "dificil", "legendario"];

let errors = 0;

function error(msg) {
  console.error(`  [ERROR] ${msg}`);
  errors++;
}

function ok(msg) {
  console.log(`  [OK] ${msg}`);
}

function validateLevelDir(levelPath, folderName) {
  console.log(`\n[NIVEL] ${folderName}`);

  if (folderName === "_template") {
    console.log("  [SKIP] Plantilla omitida");
    return;
  }

  const indexPath = path.join(levelPath, "index.tsx");

  if (!fs.existsSync(indexPath)) {
    error(`Falta index.tsx en ${folderName}`);
  } else {
    ok("index.tsx existe");
  }

  const manifestPath = path.join(levelPath, "manifest.ts");
  if (!fs.existsSync(manifestPath)) {
    error(`Falta manifest.ts en ${folderName}`);
    return;
  }

  const manifestContent = fs.readFileSync(manifestPath, "utf-8");

  for (const field of REQUIRED_MANIFEST_FIELDS) {
    if (!manifestContent.includes(`${field}:`)) {
      error(`Campo requerido faltante en manifest.ts: "${field}"`);
    }
  }

  const idMatch = manifestContent.match(/id:\s*["']([^"']+)["']/);

  if (idMatch) {
    const manifestId = idMatch[1];

    if (manifestId !== folderName) {
      error(`El id del manifest ("${manifestId}") no coincide con el nombre de la carpeta ("${folderName}")`);
    } else {
      ok(`id coincide con la carpeta: "${manifestId}"`);
    }
  } else {
    error(`No se encontro el campo id en manifest.ts`);
  }

  const typeMatch = manifestContent.match(/type:\s*["']([^"']+)["']/);
  if (typeMatch && !VALID_TYPES.includes(typeMatch[1])) {
    error(`type invalido: "${typeMatch[1]}". Debe ser: ${VALID_TYPES.join(" | ")}`);
  }

  const difMatch = manifestContent.match(/dificultad:\s*["']([^"']+)["']/);

  if (difMatch && !VALID_DIFICULTADES.includes(difMatch[1])) {
    error(`dificultad invalida: "${difMatch[1]}". Debe ser: ${VALID_DIFICULTADES.join(" | ")}`);
  }

  if (errors === 0) ok("manifest.ts valido");
}

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      validateLevelDir(path.join(dir, entry.name), entry.name);
    }
  }
}

console.log("Validando estructura de niveles...\n");
console.log("-- Niveles Oficiales --");
scanDir(path.join(LEVELS_DIR, "official"));
console.log("\n-- Niveles Comunidad --");
scanDir(path.join(LEVELS_DIR, "community"));

console.log("\n-------------------------------");
if (errors > 0) {
  console.error(`\n[FAIL] ${errors} error(es) encontrado(s). Corrige los problemas antes de mergear.`);
  process.exit(1);
} else {
  console.log("\n[PASS] Todos los niveles son validos.");
  process.exit(0);
}
