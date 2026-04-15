# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Estado del proyecto

El proyecto está en **fase de planificación**. No hay código de aplicación todavía. Los documentos de referencia son:

- `DESIGN.md` — Sistema de diseño completo (colores, tipografía, componentes, reglas)
- `FUNCTIONALITIES.md` — Definición de módulos, pantallas, conexiones y modelo de datos
- `ROADMAP.md` — Fases de construcción (Fase 0 → 4) con checklist y dependencias
- `stitch_control_financiero/` — Prototipo HTML exportado desde Stitch (referencia visual)

---

## Stack (según ROADMAP.md)

- **Framework:** Next.js 14+ con App Router y TypeScript
- **Estilos:** Tailwind CSS con tokens del sistema de diseño
- **Componentes:** shadcn/ui como base
- **Auth + DB:** Supabase (PostgreSQL + Auth)
- **Deploy:** Vercel (CI/CD automático desde `main`)
- **Gráficas:** Recharts (Fase 4)
- **Export:** xlsx / SheetJS (Fase 3)
- **Testing:** Vitest (Fase 4)
- **Tema:** next-themes (dark/light/system)

---

## Comandos (una vez inicializado el proyecto)

```bash
npm run dev          # servidor de desarrollo en localhost:3000
npm run build        # build de producción
npm run lint         # ESLint
npx vitest           # todos los tests unitarios
npx vitest run [archivo]  # un test concreto, ej: npx vitest run lib/calculations/gastos.test.ts
```

---

## Arquitectura

### Grupos de rutas (App Router)

```
app/
├── (auth)/          # Rutas públicas: /login, /registro
├── (dashboard)/     # Rutas privadas con layout compartido (Sidebar + TopNavBar)
│   ├── layout.tsx   # Layout raíz de las rutas privadas
│   ├── dashboard/
│   ├── ingresos/
│   ├── gastos/
│   ├── presupuesto/
│   ├── seguimiento/
│   ├── objetivos/   # Contiene tanto Objetivos de Ahorro como Regla 50/30/20
│   └── configuracion/
└── auth/callback/   # Handler OAuth de Google (Supabase)
```

`/ingresos` y `/gastos` son la misma vista (`MovementsTable`) filtrada por `type`.

### Capas de la aplicación

```
Páginas (app/)
    ↓
Componentes (components/)
    ↓
Hooks (hooks/)          ← queries/mutations a Supabase
    ↓
Lib (lib/)
  ├── supabase/         ← cliente browser + server + middleware
  ├── calculations/     ← motor de cálculos automáticos (ver abajo)
  ├── export/           ← generador de .xlsx
  └── utils/            ← formatCurrency, formatDate, cn()
```

### Motor de cálculos (`lib/calculations/`)

Es el núcleo de la app. El usuario solo introduce datos crudos; todo lo demás se calcula aquí. Archivos por módulo:

- `ingresos.ts` — totales, % por categoría, variación mensual
- `gastos.ts` — totales, % por categoría/subcategoría
- `seguimiento.ts` — desviaciones previsto vs real, semáforo de colores, insights automáticos
- `rule503020.ts` — clasificación de gastos en bloques (Necesidades/Deseos/Ahorro), desviaciones
- `objetivos.ts` — progreso %, meses restantes, fecha estimada, aportación necesaria
- `dashboard.ts` — KPIs mensuales y variación vs mes anterior

Estas funciones deben ser **puras** (sin side effects) para que sean testeables con Vitest.

### Componentes compartidos críticos

- `MovementModal.tsx` — modal de añadir/editar ingreso o gasto; se abre desde el CTA del sidebar y desde cada pantalla de datos
- `formatCurrency(amount, preferences)` — **usar en absolutamente todos los importes**; respeta moneda, símbolo y formato del usuario
- `MonthSelector.tsx` — selector de mes navegable; reutilizado en dashboard, ingresos, gastos, seguimiento
- `ProgressBar.tsx` — barra de progreso con props de color y %; usada en objetivos, seguimiento y 50/30/20

---

## Sistema de diseño — Reglas críticas

Ver `DESIGN.md` para la especificación completa. Las reglas que afectan directamente al código:

**Sin bordes `1px solid`:** separar secciones únicamente mediante cambios de `background-color` entre tokens de superficie (`surface` → `surface-container-low` → `surface-container-lowest`).

**Jerarquía de superficies:**
```
surface (#f7f9fb)                 ← fondo de página
  surface-container-low (#f2f4f6) ← secciones grandes
    surface-container-lowest (#fff) ← cards y tablas (el "pop" blanco)
```

**Gradiente signature** (CTAs primarios y cards oscuras):
```css
background: linear-gradient(135deg, #041627 0%, #1a2b3c 100%);
```

**Tipografía:** `font-headline` (Manrope) para cifras >24px y títulos; `font-body` / `font-label` (Inter) para tablas y datos.

**Semáforo de seguimiento:**
```
0–79%   → secondary (verde #006c4a)   → bien
80–99%  → primary (navy #041627)      → atención
≥100%   → error (rojo #ba1a1a)        → sobre presupuesto
```

---

## Base de datos (Supabase)

Tablas principales (ver `FUNCTIONALITIES.md` §15 para el schema completo):

```
auth.users              ← gestionado por Supabase Auth
user_preferences        ← moneda, formato, tema
categories              ← árbol de categorías (income/expense, padre/hijo, bloque 50/30/20)
income_entries          ← ingresos registrados
expense_entries         ← gastos registrados
budget_templates        ← plantilla base de presupuesto reutilizable
monthly_budgets         ← presupuesto de un mes concreto (sobrescribe la plantilla)
saving_goals            ← objetivos de ahorro (máx. 5 por usuario)
goal_contributions      ← aportaciones mensuales a objetivos
```

Todas las tablas tienen RLS activado con política `user_id = auth.uid()`.

Al crear un usuario, un trigger de Supabase crea automáticamente su `user_preferences` con valores por defecto y clona las categorías predefinidas (`is_default = true`) para ese usuario.

---

## Convenciones del proyecto

- Idioma de la UI: **español**
- Idioma del código: **inglés** (nombres de variables, funciones, componentes, rutas)
- Comentarios en código: inglés
- Formato de fechas por defecto: `DD/MM/AAAA`
- Moneda por defecto: `EUR (€)`
- Máximo de objetivos de ahorro por usuario: **5**
- Las categorías predefinidas tienen `is_default = true` y no se pueden eliminar (solo desactivar)
