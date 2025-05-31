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

const directiveLines = [];  // "use client"; etc.
const importBlock = [];  // líneas completas de import
const restOfCode = [];

let isInImport = false;
let currentImportLines = [];
let idx = 0;

/* 1. Captura directivas iniciales ------------------------------- */
while (idx < lines.length) {
  const trimmed = lines[idx].trim();
  if (/^(['"])use\s+\w+\1;?$/.test(trimmed)) {
    directiveLines.push(lines[idx]);
    idx++;
  } else {
    break;
  }
}

/* 2. Detecta imports (soporta multilínea) ----------------------- */
for (; idx < lines.length; idx++) {
  const line = lines[idx];

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

/* 3. Ordena de más larga a más corta ---------------------------- */
importBlock.sort((a, b) => b.length - a.length);

/* 4. Reconstruye archivo ---------------------------------------- */
const finalContent = [
  ...directiveLines,
  directiveLines.length ? "" : null,   // línea en blanco preservada
  ...importBlock,
  ...restOfCode,
]
  // quitamos solo null/undefined, NO strings vacíos
  .filter((v) => v !== null && v !== undefined)
  .join("\n");

fs.writeFileSync(absolutePath, finalContent, "utf8");
console.log(`✅ Imports ordenados (+ línea en blanco) en: ${filePath}`);
