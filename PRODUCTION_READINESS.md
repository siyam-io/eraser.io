# Production Readiness & SaaS Roadmap

Audit of `eraser.io` (Next.js 15 + MongoDB/Mongoose + NextAuth) with a prioritized
list of what it takes to run this as a real, paid SaaS product.

Legend: **✅ Done** = fixed in this pass · **🔴 P0** = launch blocker · **🟠 P1** = needed
soon after launch · **🟢 P2** = growth / scale.

---

## 1. Architecture consistency (✅ Done)

The repo was half-migrated: it still contained a dead **Convex** backend and a dead
**Kinde** auth integration on top of the live **MongoDB + NextAuth + REST** stack.

- ✅ Deleted `convex/` (unused, and one function imported a React component so it could
  never deploy) and `app/ConvexClientProvider.tsx`.
- ✅ Removed unused hooks `useFileList`, `useGetTeamList`, `useFileUpdate`.
- ✅ Removed one-off migration script `replace-kinde.ts`.
- ✅ Removed `convex` and `@kinde-oss/kinde-auth-nextjs` dependencies.
- ✅ Removed the broken `postbuild` / `deploy` scripts (`npx convex deploy` ran on every
  build and would fail without a Convex key) — this was breaking production builds.

**Remaining:** document the single source of truth in the README (MongoDB + NextAuth only).

## 2. Security (🔴 P0 — mostly ✅ Done)

- ✅ **Every API route was unauthenticated.** `/api/files`, `/api/files/[id]`,
  `/api/teams` could be read/written by anyone who knew an id (IDOR). Added session
  checks (`getCurrentUser`) to all of them.
- ✅ **Ownership scoping** — added `lib/access.ts` (`requireTeamAccess`, `requireFileAccess`)
  so a user can only touch teams/files they own.
- ✅ **Identity spoofing** — `createdBy`/`email` are now taken from the session, never the
  request body.
- ✅ **Mass assignment** — `/api/files/[id]` PUT now whitelists updatable fields instead of
  passing the raw body into `findByIdAndUpdate` (previously a user could rewrite `teamId`,
  `createdBy`, etc.).
- ✅ **Password-hash leak** — register endpoint no longer returns the created user document.
- ✅ **Register validation** — email format, min 8-char password, bcrypt cost 12, 409 on
  duplicate.
- ✅ **Next 15 bug** — route `params` are now awaited (`Promise<{ id }>`), the old sync
  access silently returned `undefined` on Next 15.
- ✅ Middleware matcher now covers `/dashboard/:path*`, `/workspace/:path*`, `/teams/:path*`.
- ✅ Baseline security headers added in `next.config.ts`.

**Remaining (P0):**
- Add **rate limiting** on `/api/auth/register`, `/api/auth/[...nextauth]` (login) —
  use Upstash Redis or a DB-backed limiter.
- Add **CSRF/origin checks** for state-changing routes (NextAuth covers its own, custom
  routes do not).
- **Google sign-in does not link to an existing credentials account** — an attacker can
  register someone else's email then have the OAuth login attach to it. Verify email
  ownership / implement account linking on `signIn`.
- **Password reset + email verification** flows (transactional email).
- Enforce **email normalization + uniqueness index** on the `User` schema.
- Optional: `Content-Security-Policy` (needs a nonce/hash strategy for Next).

## 3. Configuration & correctness (🔴 P0 — mostly ✅ Done)

- ✅ Fixed 2 TypeScript errors (`Header` strokeLinecap, Editor.js `Header` tool type).
- ✅ Fixed `FileTable` reading Convex fields (`_creationTime`/`edited`) — now reads the
  Mongoose fields `createdAt`/`editedAt`.
- ✅ `reactStrictMode: true`, `poweredByHeader: false`, modern `images.remotePatterns`
  (the old `images.domains` is deprecated).
- ✅ Hero "Start Creating" CTA pointed at `#`; now links to `/register`.
- ✅ Added `.env.example` and un-ignored it in `.gitignore`.

**Remaining:**
- Validate env vars at boot (`lib/env.ts`) so a missing `MONGODB_URI`/`NEXTAUTH_SECRET`
  fails fast with a clear message (today `lib/mongodb.ts` throws on import).
- `lib/mongodb.ts` hard-codes **Cloudflare DNS servers** on import — remove for production,
  it can break DNS on hosts like Vercel/AWS.
- Add `turbopack`-safe build check + a `typecheck` script (added).

## 4. Data layer & API robustness (🟠 P1)

- **No pagination** — `/api/files` returns every file; add cursor pagination.
- **No schema validation library** — hand-rolled checks today; move to **Zod** shared by
  client + server.
- **No DB indexes** — add indexes on `File.teamId`, `File.createdBy`, `Team.createdBy`,
  and a unique index on `User.email`.
- **No transactions** — team create does two writes; make it atomic where supported.
- **File size limits** — documents/whiteboards are stored as unbounded strings in Mongo;
  large boards will hit the 16MB BSON limit. Consider object storage (S3/R2) for big
  payloads and store a reference.
- Add `DELETE`/archive endpoints with proper soft-delete semantics (the UI has an
  "Archive" action that is currently a no-op).

## 5. Sessions, teams & authorization model (🟠 P1)

- Current model is **single-owner**: only `createdBy` can access a team. There is no
  `members`/roles concept, so real team collaboration is impossible.
- Add a `Membership` model (`teamId`, `userId`, `role: owner|editor|viewer`) and switch all
  access checks to it; update `requireTeamAccess` accordingly.
- Add **share links** with scoped, revocable tokens.

## 6. Reliability & observability (🔴 P0 for launch)

- **Error handling**: add `app/error.tsx` / `app/global-error.tsx` and `not-found.tsx`.
- **Logging/monitoring**: Sentry (or similar) for client + server error capture.
- **Health check**: `/api/health` route + uptime monitor.
- **Editing UX**: no unsaved-changes guard, no autosave, no conflict detection. Two users
  editing the same file overwrite each other — needs optimistic concurrency (version
  field) or realtime (Yjs/Liveblocks/Convex-style sync).
- Toast-only error feedback in the editor (`catch {}` swallows parse errors).

## 7. SaaS / monetization (🔴 P0 to be a *SaaS*)

- **Billing**: currently the "Free plan / 5 files" limit is a hard-coded constant in the
  sidebar. Integrate **Stripe** — products/prices, Checkout, Customer Portal, and a
  webhook handler that updates a `subscription` record.
- **Enforce limits server-side** (today the 5-file limit is only enforced by disabling a
  button — a `curl` bypasses it entirely).
- **Plans & entitlements**: store `plan`, `seatLimit`, `storageLimit`, `status` on the
  user/team; gate features server-side.
- **Usage metering** for billing disputes and overage.
- **Settings page** (the sidebar links to `/settings`, which does not exist).
- **Dunning / invoices / tax** (Stripe Tax) and cancellation flow.

## 8. Onboarding & UX (🟠 P1)

- **No onboarding**: a brand-new user has zero teams, so the dashboard is broken until they
  find "Join or Create Team". Auto-provision a personal team on first login.
- Sidebar "Recent / Starred / Team Folders / Search / Notifications / Share" are all
  non-functional placeholders — either implement or remove before launch.
- Loading/empty/error states are inconsistent (`Loader` uses DaisyUI, the rest Tailwind).
- Accessibility pass (labels, focus order, keyboard nav, color contrast).
- Light/dark: dark UI is partially hard-coded (`bg-[#0a0a0a]`); `next-themes` is a dep but
  no `ThemeProvider` is mounted, so `Toaster`'s theme is always "system".

## 9. Testing & CI/CD (🔴 P0)

- **Zero tests** currently. Add:
  - Unit tests for `lib/access.ts` + validation (Vitest).
  - API route tests (auth required, ownership enforced, happy path).
  - A Playwright smoke test for login → create team → create file → edit → save.
- **CI** (GitHub Actions): `lint`, `typecheck`, `test`, `build` on every PR.
- Add `eslint` config file (`next lint` currently has no config committed).
- Add a pre-commit hook (lint-staged + prettier) and a committed `.nvmrc` / Node engine.

## 10. Deployment & operations (🟠 P1)

- Document **required env vars** per environment; `.env.example` added.
- Choose a host (Vercel is the natural fit) + **MongoDB Atlas** with backups and a separate
  staging database.
- Add **migrations strategy** for Mongoose schema changes.
- **Backups & restore drill**, plus a documented incident runbook.
- Add a **privacy policy / terms** page and cookie/consent handling before collecting users.

---

## Suggested execution order

1. **P0 done in this pass**: remove dead stack, auth on all routes, ownership checks,
   validation, build fixes, config hardening.
2. **Next**: env validation, remove hard-coded DNS, error boundaries, rate limiting,
   auto-provision personal team, DB indexes.
3. **Then**: Zod + pagination, membership model, Stripe billing + server-side limits,
   settings page.
4. **Then**: tests + CI, realtime/multiplayer, observability, backups.
