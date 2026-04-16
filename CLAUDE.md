# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Estado del proyecto

El proyecto está en **desarrollo activo**. Los módulos principales (auth, ingresos, gastos, presupuesto, seguimiento, objetivos, regla 50/30/20, configuración) están implementados.

Documentos de referencia:
- `DESIGN.md` — Sistema de diseño completo (colores, tipografía, componentes, reglas)
- `FUNCTIONALITIES.md` — Definición de módulos, pantallas y modelo de datos
- `ROADMAP.md` — Fases de construcción con checklist y dependencias

---

## Stack real

- **Framework:** Next.js 16 + App Router + TypeScript + React 19
- **Estilos:** Tailwind CSS v4 con tokens del sistema de diseño
- **Componentes:** shadcn/ui (`src/components/ui/`)
- **Auth + DB:** Firebase (Auth + Firestore) — **NO Supabase**
- **Deploy:** Vercel (CI/CD automático desde `main`)
- **Formularios:** react-hook-form + zod
- **Gráficas:** Recharts
- **Notificaciones:** Sonner (toasts)
- **Export:** xlsx / SheetJS (`src/lib/export/`)
- **Testing:** Vitest + jsdom

---

## Comandos

```bash
npm run dev          # servidor de desarrollo en localhost:3000
npm run build        # build de producción
npm run lint         # ESLint
npx vitest           # todos los tests unitarios
npx vitest run src/lib/calculations/gastos.test.ts  # un test concreto
```

---

## Arquitectura

### Grupos de rutas (App Router)

```
src/app/
├── (auth)/          # /login, /registro
├── (dashboard)/     # rutas privadas con layout compartido
│   ├── layout.tsx   # "use client" — gestiona sidebar + alertas
│   ├── dashboard/
│   ├── ingresos/
│   ├── gastos/
│   ├── presupuesto/
│   ├── seguimiento/
│   ├── objetivos/   # Objetivos de Ahorro + Regla 50/30/20
│   └── configuracion/
├── api/auth/session/route.ts  # crea la cookie __session para SSR
└── auth/callback/             # handler OAuth de Google
```

`/ingresos` y `/gastos` comparten `MovementsTable` filtrado por `type`.

### Capas de la aplicación

```
Páginas (app/)
    ↓
Componentes (components/)
    ↓
Hooks (hooks/)          ← CRUD contra Firestore, paginación, caché de categorías
    ↓
Lib (lib/)
  ├── firebase/         ← client.ts (browser), server.ts (Admin SDK), session.ts, initUserData.ts, recurring.ts
  ├── calculations/     ← funciones puras testeables (ver abajo)
  ├── export/           ← exportToXlsx.ts
  └── utils/            ← formatCurrency.ts, formatDate.ts, recurring.ts
```

### Firebase / Firestore

Estructura de colecciones (modelo por usuario):

```
users/{userId}/
  preferences/main          ← UserPreferences
  categories/{categoryId}   ← Category (income/expense, padre/hijo, rule_block)
  income_entries/{id}       ← IncomeEntry
  expense_entries/{id}      ← ExpenseEntry
  monthly_budgets/{YYYY-MM} ← BudgetDoc { entries: Record<categoryId, amount> }
  saving_goals/{id}         ← SavingGoal
  alerts/{id}               ← Alert
```

La autenticación usa Firebase Auth (email + Google OAuth). Al primer login, `initUserData()` crea las `preferences` y clona las categorías por defecto con `writeBatch`.

Sesión SSR: el `route.ts` de `/api/auth/session` crea una cookie `__session` verificada con Firebase Admin; `getServerUser()` en `lib/firebase/session.ts` la lee desde Server Components.

### Motor de cálculos (`lib/calculations/`)

Funciones **puras** (sin side effects), testeables con Vitest. Un test file por módulo:

| Archivo | Responsabilidad |
|---------|----------------|
| `ingresos.ts` | totales, % por categoría, variación mensual |
| `gastos.ts` | totales, % por categoría/subcategoría |
| `seguimiento.ts` | desviaciones previsto vs real, semáforo, insights |
| `rule503020.ts` | clasificación needs/wants/savings, desviaciones |
| `objetivos.ts` | progreso %, meses restantes, fecha estimada |
| `dashboard.ts` | KPIs mensuales, variación vs mes anterior |

### Hooks (Firestore)

Los hooks siguen el patrón: escuchan `onAuthStateChanged` internamente, paginan con `startAfter` (PAGE_SIZE=25), y cachean categorías en `useRef` para evitar reads repetidos. Exponen `{ entries, loading, loadingMore, hasMore, loadMore, create*, update*, delete* }`.

- `useIngresos(year, month)` / `useGastos(year, month)`
- `usePresupuesto(year, month)` — lee/escribe `monthly_budgets/{YYYY-MM}`
- `useObjetivos()` — CRUD de `saving_goals` + `goal_contributions`
- `useCategories(type?)` — árbol de categorías del usuario
- `useUserPreferences()` — lee y actualiza `preferences/main`
- `useAlerts()` — lista y marca como leídas las alertas
- `useMonthlyHistory(months)` — historial para gráficas

### Componentes compartidos críticos

- `MovementModal.tsx` — modal add/edit para ingresos y gastos; se abre desde el sidebar y desde las páginas de datos
- `MonthSelector.tsx` — selector de mes navegable; reutilizado en dashboard, ingresos, gastos, seguimiento
- `ProgressBar.tsx` — barra de progreso con color y %; usada en objetivos, seguimiento y 50/30/20
- `KPICard.tsx` — tarjeta de KPI con trend; usada en dashboard
- `formatCurrency(amount, preferences)` — **usar en todos los importes**; respeta moneda y formato del usuario

---

## Sistema de diseño — Reglas críticas

Ver `DESIGN.md` para la especificación completa.

**Sin bordes `1px solid`:** separar secciones solo con cambios de `background-color`.

**Jerarquía de superficies:**
```
surface (#f7f9fb)                  ← fondo de página
  surface-container-low (#f2f4f6)  ← secciones grandes
    surface-container-lowest (#fff) ← cards y tablas
```

**Gradiente signature** (CTAs primarios y cards oscuras):
```css
background: linear-gradient(135deg, #041627 0%, #1a2b3c 100%);
```

**Tipografía:** `font-headline` (Manrope) para cifras >24px y títulos; `font-body`/`font-label` (Inter) para tablas y datos.

**Semáforo de seguimiento:**
```
0–79%   → secondary (verde #006c4a)  → bien
80–99%  → primary (navy #041627)     → atención
≥100%   → error (rojo #ba1a1a)       → sobre presupuesto
```

---

## Variables de entorno

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_ADMIN_PROJECT_ID          # solo servidor (Admin SDK)
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
```

---

## Convenciones del proyecto

- UI en **español**, código en **inglés** (variables, funciones, componentes, rutas, comentarios)
- Fecha por defecto: `DD/MM/AAAA` | Moneda por defecto: `EUR (€)`
- Máx. 5 objetivos de ahorro por usuario
- Categorías por defecto: `is_default = true`, no eliminables (solo `is_active = false`)
- Paginación en todas las listas: PAGE_SIZE = 25, cursor-based con `startAfter`
