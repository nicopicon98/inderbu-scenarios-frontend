module.exports = {
  plugins: ["import"],
  rules: {
    "import/order": [
      "error",
      {
        alphabetize: { order: "asc", caseInsensitive: true },
        warnOnUnassignedImports: true,
        // Aquí usamos un truco para permitir orden personalizado
        sortImports: true,
      },
    ],
  },
};
