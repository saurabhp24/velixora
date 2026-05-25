# Velixora — Local Setup

## Requirements
- Node.js 20+ (https://nodejs.org)
- pnpm 9+ — install with: npm install -g pnpm

## Run locally
```bash
pnpm install
cd artifacts/velixora
PORT=5173 BASE_PATH=/ pnpm dev
```

Then open: http://localhost:5173

## Production build
```bash
PORT=5173 BASE_PATH=/ pnpm build
# Output in: artifacts/velixora/dist/
```

## OpenAI API Key
Open the app → Settings → Paste your sk-... key → Save.
The key is stored in your browser's localStorage only — never sent anywhere.

## Test Report
Open `test-report.html` in your browser to view the full QA test report.
