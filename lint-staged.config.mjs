export default {
    "**/*.{ts,tsx,js,jsx}": [
        "pnpm run sort-imports-manual",
        "prettier --write",
        "eslint --fix"
    ],
    "**/*.{css,md,json}": "prettier --write"
};
