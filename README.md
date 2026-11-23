# Mitra Dashboard

A small standalone app: a **sign-in page** and the workspace behind it.

- **Sign in**: wave background, one-click **Continue as demo user**, email and password, *Forgot password?* and SSO.
- **Home**: greeting, an ask bar that really answers (try "What is waiting on my approval in HRSD?", "Show apps in progress",
  "Build a vendor intake app", "Summarise this week"), key numbers, an *Up next* card you can approve from, a delivery
  pipeline, apps in motion and a live activity timeline.
- **Apps**: gallery of what has been built (ITSM, ITOM, ITAM, HRSD, CSM, SecOps), filters, and a detail panel with build progress and artifacts.
- **Approvals**: approve, request changes or undo. One list drives every count, so badges, Home and apps stay in step.
- **Everywhere**: collapsible sidebar with the notification bell next to the logo, a header app switcher, a command palette
  (`Ctrl/Cmd + K`), and a light/dark theme toggle (the sun/moon button; remembered per browser).

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
