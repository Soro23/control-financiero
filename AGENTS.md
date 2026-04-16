# AGENTS.md

## Commands

```bash
npm run dev      # localhost:3000
npm run build    # production build
npm run lint     # ESLint
npx vitest       # run all tests
npx vitest run src/lib/calculations/gastos.test.ts  # single test
```

**Note:** No `npm test` script - use `npx vitest` directly.

## Key Architecture Facts

- **Auth + DB:** Firebase (not Supabase - CLAUDE.md is outdated)
- **Session:** Cookie-based via `src/proxy.ts` (Next 16 naming, not `middleware.ts`)
- **Firestore path:** `/users/{userId}/{collection}` (income_entries, expense_entries, categories, preferences/main)
- **Auth flow:** Firebase Auth client → `getIdToken()` → POST `/api/auth/session` → session cookie → proxy verifies

## Env Setup

Copy `.env.local.example` to `.env.local`. The private key requires literal `\n` escapes:

```
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

## Testing

Tests are in `src/lib/calculations/*.test.ts` - these are pure functions, no Firestore access. Run individual test files.

## UI Language

- Interface: Spanish
- Code: English (variables, functions, file names)