# Mitra Dashboard

A small standalone app with exactly two screens: a **sign-in page** and the **dashboard** behind it.
Nothing else is included (no marketing site, no navigation from other pages).

- **Sign in**: animated wave background, email and password, show/hide password, *Forgot password?*
  (reset-link flow), and *Continue with SSO*.
- **Dashboard**: ServiceNow-style workspace with an ask box, a workspace rail (ITSM, ITOM, ITAM, HRSD,
  CSM, SecOps) and, for each, recent activity, builds in progress, approvals and items waiting on you.

> **This is a front-end demo.** There is no backend: any email and password are accepted, SSO and
> password reset are simulated, and the session lives in `sessionStorage` for the tab. All dashboard
> data is sample data (see `src/data.ts`).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks, then builds to dist/
```

## Deploy

Works on Vercel as-is: import the repository, keep the detected Vite settings. `vercel.json` rewrites
every path to `index.html`.

## Stack

Vite, React 19, TypeScript, Tailwind CSS 4, motion, lucide-react.
