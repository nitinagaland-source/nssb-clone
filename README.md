# NSSB Clone — Recruitment & Merit Allocation

A functional clone of the NSSB (Nagaland Staff Selection Board) Recruitment & Merit Allocation platform, built with a modern 3D gradient aesthetic. Every button, upload, filter, export and the allocation engine are wired end-to-end.

## Stack

Next.js 15 App Router · TypeScript strict · Tailwind v4 · shadcn/ui · Zustand (persist) · react-hook-form + zod · @tanstack/react-table v8 · @tanstack/react-virtual · xlsx · jspdf · recharts · framer-motion · sonner · lucide-react.

## Screens

Dashboard · Examinations · Vacancies · Candidates (xlsx upload) · Merit List · Allocation (animated run) · Results · Reports (PDF/Excel) · Settings.

## Dev

```bash
npm install
npm run dev
```

Open http://localhost:3000 — all state is persisted to localStorage and reseeds on first visit (4 exams, 4 vacancies, 500 candidates).

## Live

Production: https://nssb-clone-qv0xlrlzq-niti6.vercel.app

> First-time note: if you see a Vercel login page, disable **Vercel Authentication** in the project's Deployment Protection settings to make the clone publicly viewable.
