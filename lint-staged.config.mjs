export default {
    "**/*.{ts,tsx,js,jsx}": [
        "pnpm run sort-imports-manual",
        "prettier --write"],
    "**/*.{css,md,json}": "prettier --write"
};
