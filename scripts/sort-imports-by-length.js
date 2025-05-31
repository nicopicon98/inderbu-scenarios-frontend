const fs = require("fs");
const path = require("path");

const filePath = process.argv[2];
if (!filePath) {
  console.error("❌ Debes proporcionar la ruta del archivo.");
  process.exit(1);
}

const absolutePath = path.resolve(filePath);
const content = fs.readFileSync(absolutePath, "utf8");
const lines = content.split("\n");

const directiveLines = [];   // "use client"; "use server"; etc.
const importBlock = [];   // líneas completas de import
const restOfCode = [];

let isInImport = false;
let currentImportLines = [];
let index = 0;

/* -------------------------------------------------- */
/*  1. Separa directivas iniciales                    */
/* -------------------------------------------------- */
while (index < lines.length) {
  const trimmed = lines[index].trim();
  if (/^(['"])use\s+\w+\1;?$/.test(trimmed)) {
    directiveLines.push(lines[index]);
    index++;
  } else {
    break;
  }
}

/* -------------------------------------------------- */
/*  2. Recorre el resto buscando bloques de import    */
/* -------------------------------------------------- */
for (; index < lines.length; index++) {
  const line = lines[index];

  if (line.trim().startsWith("import")) {
    isInImport = true;
    currentImportLines.push(line);

    if (line.trim().endsWith(";")) {
      importBlock.push(currentImportLines.join("\n"));
      currentImportLines = [];
      isInImport = false;
    }
  } else if (isInImport) {
    currentImportLines.push(line);

    if (line.trim().endsWith(";")) {
      importBlock.push(currentImportLines.join("\n"));
      currentImportLines = [];
      isInImport = false;
    }
  } else {
    restOfCode.push(line);
  }
}

/* -------------------------------------------------- */
/*  3. Ordena de más larga a más corta                */
/* -------------------------------------------------- */
importBlock.sort((a, b) => b.length - a.length);

/* -------------------------------------------------- */
/*  4. Reconstruye el archivo                         */
/*     • Directivas                                   */
/*     • (línea en blanco)                            */
/*     • Imports ordenados                            */
/*     • (línea en blanco)                            */
/*     • Resto del código                             */
/* -------------------------------------------------- */
const finalContent = [
  ...directiveLines,
  directiveLines.length ? "" : null,
  ...importBlock,
  importBlock.length ? "" : null,
  ...restOfCode,
]
  .filter(Boolean)          // elimina posibles null
  .join("\n");

fs.writeFileSync(absolutePath, finalContent, "utf8");
console.log(`✅ Imports ordenados (y directivas preservadas) en: ${filePath}`);
