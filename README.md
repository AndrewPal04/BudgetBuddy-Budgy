# Budgy

A full-stack personal budgeting app for tracking accounts, expenses, income, and savings goals, with AI-generated financial tips.

**Live app:** [budget-buddy-budgy.vercel.app](https://budget-buddy-budgy.vercel.app)

## Features

- **Accounts** — track multiple checking and savings accounts, each with an optional interest rate for growth projections
- **Expenses** — log spending by category, search/filter/sort, and export to CSV
- **Income** — record income by account
- **Savings** — per-account balance trend lines, savings-by-category breakdown, and interest-rate-based growth projections
- **Budgets** — set per-category budget limits, visualized with a bar chart and a category breakdown pie chart
- **Bills & subscriptions** — track recurring bills with billing dates and categories
- **AI tips** — personalized financial tips generated from your spending data via the Groq API
- **Auth** — email/password sign-up, password reset, and email confirmation via Supabase
- **Onboarding** — guided first-run checklist for new users

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Data fetching | TanStack Query |
| Forms & validation | React Hook Form, Zod |
| Charts | Recharts |
| Backend | Supabase (Postgres, Auth, Edge Functions) |
| AI | Groq API, called from a Supabase Edge Function (`generate-tips`) |
| Hosting | Vercel |

## Running Locally

```bash
npm install
cp .env.example .env   # fill in your Supabase and Groq credentials
npm run dev
```

Required environment variables (see `.env.example`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GROQ_API_KEY` (used by the Supabase Edge Function, not the frontend directly)

Database schema and migrations live in `supabase/migrations`. Apply them with the Supabase CLI:

```bash
supabase db push
```
