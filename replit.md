# Velixora

An AI-native document intelligence platform — convert, analyze, summarize, and automate documents at lightning speed. Fully browser-based, privacy-first.

## Run & Operate

- `pnpm --filter @workspace/velixora run dev` — run the Velixora frontend (port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui
- Animations: Framer Motion + Canvas 2D (particle background)
- AI: OpenAI API (browser-side fetch, user's own API key)
- PDF: pdfjs-dist (text extraction), jspdf (generation)
- OCR: Tesseract.js (client-side, multi-language)
- Data export: xlsx (CSV/Excel)
- Routing: wouter
- DB: None (all localStorage)

## Where things live

- `artifacts/velixora/src/pages/` — all page components (home, dashboard, settings, tools/*)
- `artifacts/velixora/src/components/` — shared components (Layout, FileDropZone, AIProcessing, etc.)
- `artifacts/velixora/src/hooks/` — useApiKey, useRecentFiles
- `artifacts/velixora/src/lib/` — openai.ts, pdfUtils.ts, fileUtils.ts

## Architecture decisions

- Fully browser-native: all file processing runs client-side (privacy-first, no server uploads)
- OpenAI API key stored only in localStorage under `velixora_openai_key`
- Recent files metadata stored in localStorage (max 20 entries)
- pdfjs-dist worker loaded from CDN to avoid bundling issues
- Tesseract.js v7 API: `createWorker(lang, 1, { logger })` — no separate loadLanguage/initialize calls
- CSS-based particle background (canvas 2D) since WebGL is unavailable in Replit preview

## Product

- AI PDF Summarizer: upload PDF → extract text → stream GPT summary
- Chat with PDF: conversational AI interface over uploaded document
- Smart OCR: Tesseract.js, supports English/Hindi/Marathi/Tamil/Kannada
- AI Table Extractor: parse tables from PDFs, export CSV/Excel
- AI Resume Analyzer: ATS score ring + improvement suggestions
- AI Contract Analyzer: risk flagging + clause extraction
- Smart Compressor: canvas-based image compression with quality slider
- Convert & Merge: PDF merge, image-to-PDF via jsPDF
- AI PPT Generator: AI-structured slide previews from PDF content
- AI Translation: multi-language document translation
- India Tools: Aadhaar, PAN, Passport, WhatsApp PDF, Invoice presets
- Settings: API key management (masked, save/remove/test)
- Dashboard: recent files + quick-access tool grid + workflow suggestions

## User preferences

- Always-dark UI (dark class applied in main.tsx)
- Glassmorphism panels, violet (#7C3AED) + cyan (#06B6D4) accent palette
- Space Grotesk as primary typeface

## Gotchas

- Tesseract.js v7: use `createWorker(lang, oem, {logger})` — no loadLanguage/initialize
- WebGL unavailable in Replit sandbox — use Canvas 2D for particle effects
- Google Fonts `@import url(...)` MUST be first line in index.css (before tailwindcss import)
- `@apply dark` causes Tailwind v4 error — add `.dark` class via JS instead

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- GitHub repo: https://github.com/saurabhp24/velixora
