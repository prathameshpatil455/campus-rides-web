# Campus Rides — student ride sharing

Frontend: **Vite + React** (`apps/web`). See [`plan.md`](./plan.md) for migration history.

## Prerequisites

- **Node.js** ≥ 20.19 ([`.nvmrc`](./.nvmrc))
- **pnpm** — pinned as **`pnpm@9.15.0`** in root `package.json` (`packageManager` field)

### `pnpm: command not found`

| Method | Command |
|--------|---------|
| **Homebrew (macOS)** | `brew install pnpm` |
| **Corepack** | `sudo corepack enable && corepack prepare pnpm@9.15.0 --activate` |
| **Standalone** | [pnpm.io/installation](https://pnpm.io/installation) |
| **One-off** | `npx pnpm@9.15.0 install` / `npx pnpm@9.15.0 run dev` |

## Install

From the repository root:

```bash
pnpm install
```

## Scripts

All commands run from the **repository root** and target `apps/web`:

| Command | Description |
|---------|-------------|
| `pnpm dev` | Vite dev server (default **5173**) |
| `pnpm build` | Production build → `apps/web/dist` |
| `pnpm preview` | Preview production build |
| `pnpm typecheck` | TypeScript check for `apps/web` |
| `pnpm lint` | ESLint for `apps/web` |

## Configuration

Copy `apps/web/.env.example` to `apps/web/.env` and set **`VITE_API_BASE_URL`** (e.g. `http://localhost:3000/api`).

## Layout

```
apps/web/     # Vite + React + TypeScript + Tailwind + TanStack Router/Query
docs/         # e.g. manual test checklist
```

## Docs

- [`plan.md`](./plan.md) — phases and progress log
- [`docs/MANUAL_TEST_CHECKLIST.md`](./docs/MANUAL_TEST_CHECKLIST.md) — release / regression checks
- [`docs/PROJECT_SCORE_AND_FEATURE_BACKLOG.md`](./docs/PROJECT_SCORE_AND_FEATURE_BACKLOG.md) — project scorecard and suggested feature backlog
