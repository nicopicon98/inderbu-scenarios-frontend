const fs = require("fs");
const path = require("path");

const filePath = process.argv[2];

if (!filePath) {
  console.error("❌ Debes proporcionar el path del archivo a ordenar.");
  process.exit(1);
}

const absolutePath = path.resolve(filePath);
const content = fs.readFileSync(absolutePath, "utf8");

const lines = content.split("\n");

const importBlock = [];
const restOfCode = [];

let isInImport = false;
let currentImportLines = [];

for (const line of lines) {
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

importBlock.sort((a, b) => b.length - a.length);

const finalContent = [...importBlock, "", ...restOfCode].join("\n");

fs.writeFileSync(absolutePath, finalContent, "utf8");

console.log(`✅ Imports ordenados por longitud en: ${filePath}`);
