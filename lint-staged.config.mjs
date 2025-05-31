export default {
    "**/*.{ts,tsx,js,jsx}": [
        "pnpm run sort-imports-manual",
    ],
    "**/*.{css,md,json}": "prettier --write"
};
