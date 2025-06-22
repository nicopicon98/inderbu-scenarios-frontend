export default {
    "**/*.{ts,tsx}": [
        "pnpm run sort-imports-manual",
    ],
    "**/*.{css,md,json}": "prettier --write"
};
