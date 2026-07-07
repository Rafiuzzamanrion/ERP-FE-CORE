# ERP Frontend

React + Vite + TypeScript. Uses shadcn/ui for components, Redux Toolkit Query for server state, Tailwind for styling, Framer Motion for animations, and Highcharts for dashboard charts.

## Architecture

The app follows a feature-based folder structure — each domain (dashboard, products, sales, categories, users, roles, auth) has its own `components/`, `pages/`, and an API slice file. Shared components (StatCard, Pagination, Sparkline, DataTable) live under `components/shared/`. The RTK Query API is defined once in `lib/baseQuery.ts` and domain slices inject their endpoints into it, so there's a single Redux store and cache.

## Performance

Every page is code-split with `React.lazy` and wrapped in a `Suspense` boundary. The initial login page bundle doesn't include the dashboard, product tables, forms, or Highcharts — those load on demand when the user navigates.

Heavy components (charts, tables, forms, sidebar, topbar) are wrapped in `React.memo`. The sidebar's navigation sections are static module-level constants, not recreated on render. The topbar uses `useCallback` for event handlers and `useMemo` for computed values like user initials.

RTK Query is configured with `keepUnusedDataFor: 300` seconds and `refetchOnMountOrArgChange: true` so navigating back to a page always shows fresh data. Tag invalidation is granular — deleting or updating a resource invalidates both the list and the individual detail cache. The Sparkline chart component generates stable gradient IDs via React's `useId()` hook instead of random strings.

Images in product tables and selectors use `loading="lazy"`, `decoding="async"`, and fixed `width`/`height` to prevent layout shifts. Page transitions use Framer Motion with `mode: "sync"` so the exit and enter animations overlap, avoiding the 250ms dead time that `mode: "wait"` introduces.

## State Management

Redux Toolkit for global state (auth token, theme, sidebar collapse state) and RTK Query for server state. Every list endpoint supports server-side search, filtering, and pagination via URL search params — the page reads from the URL, passes params to the RTKQ hook, and the API forwards them to the backend. No client-side filtering on list pages.

## Setup

```bash
yarn install
echo VITE_API_URL=http://localhost:5000/api/v1 > .env
yarn dev
```

Runs on port 5173. Make sure the backend is running.

**Scripts:** `yarn dev` (Vite dev server), `yarn build` (production build to `dist/`), `yarn preview` (serve production build), `yarn typecheck`.
