# ROADMAP.md — Control Financiero

Hoja de ruta para la construcción completa de la app.  
Stack: **Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Firebase · Vercel**

> **Nota:** El stack original planificaba Supabase. La implementación usó Firebase (Auth + Firestore) en su lugar. Las referencias a Supabase en las tareas completadas son equivalentes con Firebase.

---

## Resumen de Fases

| Fase | Nombre | Objetivo | Estado |
|---|---|---|---|
| 0 | Fundaciones | Setup del proyecto, diseño y base de datos | ✅ Completa |
| 1 | MVP | Auth + Layout + Ingresos + Gastos + Dashboard básico | ✅ Completa |
| 2 | Core V2 | Presupuesto + Seguimiento + Regla 50/30/20 | ✅ Completa |
| 3 | Core V3 | Objetivos de ahorro + Exportación + Configuración completa | ✅ Completa |
| 4 | Polish | Gráficas reales + Dark mode + Testing + Optimización | ⬜ Pendiente |

---

## Fase 0 — Fundaciones

> **Objetivo:** Tener el proyecto configurado, desplegado en Vercel y con la base de datos lista. Sin este paso, nada se puede construir.

---

### ✅ 0.1 Inicialización del Proyecto

**Qué hacer:**
- Crear proyecto Next.js 14 con App Router y TypeScript
- Instalar y configurar Tailwind CSS
- Instalar shadcn/ui y configurar el tema base

**Comandos:**
```bash
npx create-next-app@latest control-financiero --typescript --tailwind --app --src-dir
npx shadcn@latest init
```

**Archivos clave a crear/modificar:**
- `tailwind.config.ts` → añadir todos los tokens de color, borderRadius y fontFamily del `DESIGN.md` §2.1–2.2
- `src/app/globals.css` → variables CSS base, importar fuentes
- `next.config.ts` → configuración básica

**Tokens de diseño a registrar en `tailwind.config.ts`:**
```ts
// Todos los colores del sistema de diseño (DESIGN.md §2.1)
// primary, secondary, error, surface-*, on-*, tertiary-*, etc.
// borderRadius: DEFAULT, lg, xl, full
// fontFamily: headline (Manrope), body (Inter), label (Inter)
```

**Fuentes (en `layout.tsx`):**
```ts
import { Inter, Manrope } from 'next/font/google'
// Inter: weights 400, 500, 600, 700
// Manrope: weights 400, 600, 700, 800
```

**Iconos:**
```ts
// Material Symbols Outlined vía next/font o CDN en layout
// font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24
```

**Desbloquea:** Todo lo demás.

---

### ✅ 0.2 Conexión con Base de Datos

**Qué hacer:**
- Crear proyecto en Supabase
- Instalar cliente Supabase para Next.js
- Configurar variables de entorno

**Instalación:**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Variables de entorno (`.env.local`):**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # solo server-side
```

**Archivos a crear:**
- `src/lib/supabase/client.ts` → cliente browser
- `src/lib/supabase/server.ts` → cliente server (SSR)
- `src/lib/supabase/middleware.ts` → refresh de sesión

**Desbloquea:** Fase 1 (Auth y datos).

---

### ✅ 0.3 Esquema de Base de Datos

**Qué hacer:**
- Crear todas las tablas en Supabase según el modelo de datos de `FUNCTIONALITIES.md` §15
- Configurar Row Level Security (RLS) en todas las tablas

**Tablas a crear (en orden, por dependencias):**
```sql
1. user_preferences       -- depende de auth.users
2. categories             -- depende de user_preferences
3. income_entries         -- depende de categories
4. expense_entries        -- depende de categories
5. budget_templates       -- depende de categories
6. monthly_budgets        -- depende de categories
7. saving_goals           -- depende de auth.users
8. goal_contributions     -- depende de saving_goals
```

**Políticas RLS por tabla:**
```sql
-- Patrón estándar para todas las tablas:
CREATE POLICY "Users can only see their own data"
ON [tabla] FOR ALL
USING (user_id = auth.uid());
```

**Seed de datos iniciales:**
- Insertar las 9 categorías de gastos con sus subcategorías (FUNCTIONALITIES.md §6.5)
- Insertar las 9 categorías de ingresos (FUNCTIONALITIES.md §5.4)
- Marcarlas como `is_default = true`

**Desbloquea:** Lectura y escritura de datos reales.

---

### ✅ 0.4 Deploy Inicial en Vercel

**Qué hacer:**
- Conectar el repositorio GitHub con Vercel
- Configurar variables de entorno en Vercel
- Verificar que el deploy funciona con la app vacía

**Pasos:**
1. `git init` + primer commit + push a GitHub
2. Importar proyecto en vercel.com
3. Añadir env vars de Supabase en Vercel Dashboard
4. Verificar deploy automático al hacer push a `main`

**Configuración de ramas:**
- `main` → producción (auto-deploy)
- `develop` → preview deployments

**Desbloquea:** CI/CD desde el primer día. Cada push genera una preview.

---

### ✅ 0.5 Estructura de Carpetas

```
src/
├── app/
│   ├── (auth)/              # Grupo: rutas públicas
│   │   ├── login/
│   │   └── registro/
│   ├── (dashboard)/         # Grupo: rutas privadas (layout compartido)
│   │   ├── layout.tsx       # Sidebar + TopNavBar
│   │   ├── dashboard/
│   │   ├── ingresos/
│   │   ├── gastos/
│   │   ├── presupuesto/
│   │   ├── seguimiento/
│   │   ├── objetivos/
│   │   └── configuracion/
│   ├── auth/
│   │   └── callback/        # OAuth callback
│   ├── layout.tsx           # Root layout (fuentes, providers)
│   └── page.tsx             # Redirect a /dashboard o /login
├── components/
│   ├── layout/              # Sidebar, TopNavBar
│   ├── ui/                  # shadcn components
│   ├── dashboard/           # KPICard, BarChart, DonutChart, GoalPreview
│   ├── movements/           # TransactionTable, TransactionRow, MovementModal
│   ├── budget/              # BudgetTable, BudgetRow
│   ├── goals/               # GoalCard, GoalForm
│   ├── rule-50-30-20/       # RuleBar, RuleInsight
│   └── shared/              # CategoryBadge, ProgressBar, InsightCard, MonthSelector
├── lib/
│   ├── supabase/            # client, server, middleware
│   ├── calculations/        # Motor de cálculos (FUNCTIONALITIES.md §13)
│   ├── export/              # xlsx generator
│   └── utils/               # formatCurrency, formatDate, cn()
├── hooks/
│   ├── useIngresos.ts
│   ├── useGastos.ts
│   ├── usePresupuesto.ts
│   ├── useObjetivos.ts
│   └── useUserPreferences.ts
├── types/
│   └── index.ts             # Tipos TypeScript de todas las entidades
└── middleware.ts             # Protección de rutas privadas
```

**Desbloquea:** Desarrollo ordenado y escalable desde el primer componente.

---

## Fase 1 — MVP

> **Objetivo:** App funcional con autenticación, registro de ingresos y gastos, y un dashboard básico. El usuario ya puede usarla como herramienta real.

---

### ✅ 1.1 Autenticación

**Qué hacer:**
- Pantalla de Login con email + contraseña y botón Google
- Pantalla de Registro
- Middleware de protección de rutas privadas
- Callback OAuth de Google

**Componentes a crear:**
- `app/(auth)/login/page.tsx` — formulario login + OAuth
- `app/(auth)/registro/page.tsx` — formulario registro
- `app/auth/callback/route.ts` — handler OAuth
- `middleware.ts` — redirige a `/login` si no hay sesión

**Flujo:**
```
/login → Supabase Auth → cookie de sesión → redirect /dashboard
/registro → Supabase Auth → crear user_preferences (trigger) → redirect /dashboard
Google OAuth → /auth/callback → upsert user_preferences → redirect /dashboard
```

**Trigger en Supabase (SQL):**
```sql
-- Al crear un usuario, crear sus preferencias por defecto
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id, currency, ...)
  VALUES (NEW.id, 'EUR', ...);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

**Dependencias:** Fase 0 completa.  
**Desbloquea:** Todas las pantallas privadas.

---

### ✅ 1.2 Layout Principal (Sidebar + TopNavBar)

**Qué hacer:**
- Sidebar glassmorphism con navegación y CTA "Nuevo Movimiento"
- TopNavBar con search, acciones y avatar
- Layout responsive para el grupo `(dashboard)`

**Componentes a crear:**
- `components/layout/Sidebar.tsx`
- `components/layout/TopNavBar.tsx`
- `components/layout/NavItem.tsx` — item de nav con estado activo/inactivo
- `app/(dashboard)/layout.tsx` — combina Sidebar + TopNavBar

**Especificaciones clave (DESIGN.md §3.2 y §3.3):**
- Sidebar: `w-72 fixed`, glassmorphism `bg-white/85 backdrop-blur-xl`
- Nav activo: `border-r-2 border-slate-900 bg-slate-100/50`
- CTA: gradient signature `from-primary to-primary-container`
- Header: `h-20 sticky top-0 z-40 bg-transparent`

**Dependencias:** 1.1  
**Desbloquea:** Todas las pantallas privadas con layout correcto.

---

### ✅ 1.3 Gestión de Ingresos

**Qué hacer:**
- Pantalla `/ingresos` con tabla de movimientos, filtros y modal de añadir/editar
- CRUD completo (crear, leer, actualizar, eliminar)
- Cálculos automáticos: total del mes, % por categoría

**Componentes a crear:**
- `app/(dashboard)/ingresos/page.tsx`
- `components/movements/MovementsTable.tsx` — tabla reutilizable (ingresos y gastos)
- `components/movements/MovementRow.tsx` — fila con hover
- `components/movements/MovementModal.tsx` — modal añadir/editar (DESIGN.md §4.2.4)
- `components/movements/FilterBar.tsx` — filtros de mes y categoría
- `components/movements/SummaryCards.tsx` — 3 KPI cards de cabecera
- `components/shared/CategoryBadge.tsx` — pill de categoría
- `components/shared/MonthSelector.tsx` — selector de mes navegable

**Hooks a crear:**
- `hooks/useIngresos.ts` — queries y mutations para `income_entries`

**Cálculos (en `lib/calculations/ingresos.ts`):**
```ts
calcularTotalMes(ingresos: IncomeEntry[]): number
calcularPorcentajePorCategoria(ingresos: IncomeEntry[]): Record<string, number>
calcularVariacionMensual(mesActual: number, mesAnterior: number): number
```

**Dependencias:** 1.2  
**Desbloquea:** Dashboard básico (necesita datos de ingresos).

---

### ✅ 1.4 Gestión de Gastos

**Qué hacer:**
- Pantalla `/gastos` — reutiliza `MovementsTable` con tipo `expense`
- CRUD completo
- Soporte para categoría + subcategoría
- Cálculos automáticos: total del mes, % por categoría

**Componentes a crear:**
- `app/(dashboard)/gastos/page.tsx`
- Reutiliza todos los componentes de 1.3, filtrado por `type = 'expense'`

**Diferencias con Ingresos:**
- El modal de gastos añade campo de **subcategoría** (select dependiente de la categoría)
- Las categorías son el árbol de 9 + subcategorías (FUNCTIONALITIES.md §6.5)
- El importe se muestra en rojo

**Hooks a crear:**
- `hooks/useGastos.ts` — queries y mutations para `expense_entries`

**Cálculos (en `lib/calculations/gastos.ts`):**
```ts
calcularTotalMes(gastos: ExpenseEntry[]): number
calcularPorcentajePorCategoria(gastos: ExpenseEntry[]): Record<string, number>
calcularPorcentajePorSubcategoria(gastos: ExpenseEntry[]): Record<string, number>
```

**Dependencias:** 1.3 (reutiliza sus componentes)  
**Desbloquea:** Dashboard (necesita datos de gastos), Seguimiento, Regla 50/30/20.

---

### ✅ 1.5 Dashboard Básico (MVP)

**Qué hacer:**
- Pantalla `/dashboard` con los KPIs reales calculados desde los datos
- Versión MVP: 4 KPI cards + tabla de últimas transacciones
- Sin gráficas reales todavía (se añaden en Fase 4)

**Componentes a crear:**
- `app/(dashboard)/dashboard/page.tsx`
- `components/dashboard/KPICard.tsx` — card con icono, label, valor e indicador
- `components/dashboard/RecentTransactions.tsx` — últimas 5 transacciones
- `components/shared/MonthSelector.tsx` — reutilizado

**KPIs del MVP:**
| KPI | Cálculo |
|---|---|
| Ingresos del mes | `SUM(income_entries WHERE mes = mes_activo)` |
| Gastos del mes | `SUM(expense_entries WHERE mes = mes_activo)` |
| Ahorro generado | `ingresos - gastos` |
| % de Ahorro | `(ahorro / ingresos) × 100` |

**Cálculos (en `lib/calculations/dashboard.ts`):**
```ts
calcularKPIsMensuales(mes: number, año: number, userId: string): KPIs
calcularVariacionMensual(actual: KPIs, anterior: KPIs): Variaciones
```

**Dependencias:** 1.3 + 1.4  
**Desbloquea:** **El MVP está completo y usable.**

---

### ✅ 1.6 Configuración Básica (MVP)

**Qué hacer:**
- Pantalla `/configuracion` con las pestañas de Perfil y Moneda
- El usuario puede cambiar su nombre, avatar y moneda
- Los cambios de moneda se propagan a toda la app

**Componentes a crear:**
- `app/(dashboard)/configuracion/page.tsx`
- `components/configuracion/ProfileTab.tsx`
- `components/configuracion/CurrencyTab.tsx`
- `hooks/useUserPreferences.ts`
- `lib/utils/formatCurrency.ts` — formatea importes según las preferencias del usuario

**`formatCurrency` — función crítica:**
```ts
// Se usa en TODOS los componentes que muestran dinero
formatCurrency(amount: number, preferences: UserPreferences): string
// Ejemplo: 1234.56 → "1.234,56 €" o "$1,234.56"
```

**Dependencias:** 1.1  
**Desbloquea:** Visualización correcta de moneda en toda la app.

> ✅ **MVP COMPLETO** — Al final de la Fase 1 la app permite:
> - Registrarse e iniciar sesión (email + Google)
> - Registrar ingresos con categorías
> - Registrar gastos con categorías y subcategorías
> - Ver un dashboard con KPIs reales
> - Configurar moneda y perfil

---

## Fase 2 — Core V2

> **Objetivo:** Añadir el sistema de presupuesto, seguimiento mes a mes y la regla 50/30/20. La app se convierte en una herramienta completa de control financiero.

---

### ✅ 2.1 Presupuesto Mensual

**Qué hacer:**
- Pantalla `/presupuesto` con tabla editable de categorías
- Sistema de plantilla base reutilizable
- Posibilidad de sobrescribir por mes

**Componentes a crear:**
- `app/(dashboard)/presupuesto/page.tsx`
- `components/budget/BudgetTable.tsx` — tabla editable (inline editing)
- `components/budget/BudgetRow.tsx` — fila con input de importe editable
- `components/budget/BudgetSummary.tsx` — totales calculados al pie
- `components/budget/BudgetTemplateToggle.tsx` — "Guardar como plantilla" / "Solo este mes"

**Lógica de plantilla:**
```ts
// Al cargar el presupuesto de un mes:
// 1. Buscar en monthly_budgets para ese mes/año
// 2. Si no existe → usar budget_templates (plantilla base)
// 3. Si no hay plantilla → mostrar tabla vacía para configurar
getBudgetForMonth(userId: string, year: number, month: number): BudgetEntry[]
```

**Hooks a crear:**
- `hooks/usePresupuesto.ts`

**Dependencias:** 1.4 (categorías ya existen)  
**Desbloquea:** Seguimiento (necesita presupuestos para comparar).

---

### ✅ 2.2 Seguimiento Real vs Presupuesto

**Qué hacer:**
- Pantalla `/seguimiento` con tabla comparativa previsto vs real
- Indicadores de color (verde/amarillo/rojo) según % utilizado
- Sección de insights automáticos

**Componentes a crear:**
- `app/(dashboard)/seguimiento/page.tsx`
- `components/budget/TrackingTable.tsx` — tabla comparativa
- `components/budget/TrackingRow.tsx` — fila con barra de progreso y semáforo
- `components/budget/TrackingKPIs.tsx` — 3 cards (previsto, real, diferencia)
- `components/budget/InsightsList.tsx` — alertas y éxitos automáticos
- `components/budget/AnnualSummaryTable.tsx` — los 12 meses del año
- `components/shared/ProgressBar.tsx` — barra reutilizable con props de color y %

**Lógica de semáforo (en `lib/calculations/seguimiento.ts`):**
```ts
getTrackingStatus(realPercent: number): 'good' | 'warning' | 'over'
// good:    0–79%   → secondary (verde)
// warning: 80–99%  → primary (navy)
// over:    ≥100%   → error (rojo)

generateInsights(tracking: TrackingData[]): Insight[]
// Detecta categorías sobre presupuesto y categorías con ahorro
```

**Dependencias:** 2.1 + 1.3 + 1.4  
**Desbloquea:** El módulo más valioso para el control financiero real.

---

### ✅ 2.3 Regla 50/30/20

**Qué hacer:**
- Sección inferior de `/objetivos` (se integra en la misma página)
- Barras visuales de Necesidades / Deseos / Ahorro con % real vs ideal
- Panel lateral con proyección y comparativa mensual

**Componentes a crear:**
- `components/rule-50-30-20/RuleSection.tsx` — contenedor de la sección
- `components/rule-50-30-20/RuleBar.tsx` — barra horizontal animada con marcador
- `components/rule-50-30-20/RuleInsightBox.tsx` — análisis textual automático
- `components/rule-50-30-20/ProjectionCard.tsx` — card oscura con saldo proyectado
- `components/rule-50-30-20/MonthlyComparisonCard.tsx` — comparativa mensual

**Lógica (en `lib/calculations/rule503020.ts`):**
```ts
calcularBloques(ingresos: number, gastos: ExpenseEntry[], aportaciones: number): RuleBlocks
// Clasifica cada gasto en Necesidades/Deseos/Ahorro según category.rule_block

calcularDesviacion(real: number, ideal: number): { valor: number, status: 'ok' | 'warning' | 'over' }

generarInsightTexto(bloques: RuleBlocks): string
// Genera texto personalizado según las desviaciones detectadas
```

**Dependencias:** 1.3 + 1.4 + (parcialmente 2.1)  
**Desbloquea:** Vista de `/objetivos` completa.

---

### ✅ 2.4 Completar el Dashboard (V2)

**Qué hacer:**
- Añadir al dashboard el mini-panel de la Regla 50/30/20
- Añadir el resumen anual (12 meses)
- Ampliar los KPIs con comparativa vs mes anterior (calculada)

**Componentes a añadir:**
- `components/dashboard/Rule503020Mini.tsx` — versión compacta de los 3 bloques
- `components/dashboard/AnnualSummary.tsx` — cards con totales del año

**Dependencias:** 2.2 + 2.3  
**Desbloquea:** Dashboard completo y cohesionado.

---

## Fase 3 — Core V3

> **Objetivo:** Añadir objetivos de ahorro, exportación a Excel y configuración avanzada de categorías.

---

### ✅ 3.1 Objetivos de Ahorro

**Qué hacer:**
- Sección superior de `/objetivos` con hasta 5 metas
- Creación, edición y eliminación de objetivos
- Registro de aportaciones mensuales

**Componentes a crear:**
- `app/(dashboard)/objetivos/page.tsx` — combina GoalsSection + Rule503020Section
- `components/goals/GoalCard.tsx` — card con progreso, meses restantes y aportación
- `components/goals/GoalForm.tsx` — modal crear/editar objetivo
- `components/goals/GoalContributionModal.tsx` — registrar aportación del mes
- `components/goals/GoalTemplateSelector.tsx` — plantillas predefinidas al crear

**Cálculos (en `lib/calculations/objetivos.ts`):**
```ts
calcularProgreso(acumulado: number, meta: number): number
calcularMesesRestantes(restante: number, aportacionMensual: number): number
calcularFechaEstimada(mesesRestantes: number): Date
calcularAportacionNecesaria(restante: number, fechaLimite: Date): number
// Si hay fecha límite, calcula cuánto hay que aportar mensualmente
```

**Integración con Gastos:**
- Al registrar una aportación → se crea automáticamente un `expense_entry` de categoría "Ahorro"
- Esto alimenta el bloque "20% Ahorro" de la Regla 50/30/20

**Hooks a crear:**
- `hooks/useObjetivos.ts`

**Dependencias:** 2.3  
**Desbloquea:** Vista `/objetivos` completamente funcional.

---

### ✅ 3.2 Exportación (.xlsx)

**Qué hacer:**
- Botón "Exportar" en TopNavBar y en cada módulo de datos
- Genera un archivo .xlsx con los datos del mes o del año

**Instalación:**
```bash
npm install xlsx
```

**Archivos a crear:**
- `lib/export/exportToXlsx.ts` — función principal de generación
- `lib/export/sheets/ingresosSheet.ts`
- `lib/export/sheets/gastosSheet.ts`
- `lib/export/sheets/seguimientoSheet.ts`
- `lib/export/sheets/objetivosSheet.ts`
- `lib/export/sheets/resumenAnualSheet.ts`

**Función de exportación:**
```ts
exportToXlsx(
  tipo: 'ingresos' | 'gastos' | 'seguimiento' | 'objetivos' | 'completo',
  datos: ExportData,
  preferencias: UserPreferences
): void  // dispara descarga en el browser
```

**Dependencias:** 1.3 + 1.4 + 2.1 + 3.1  
**Desbloquea:** Compatibilidad con Excel (FUNCTIONALITIES.md §11).

---

### ✅ 3.3 Configuración Avanzada (Categorías + Apariencia)

**Qué hacer:**
- Añadir las pestañas de "Gestión de Categorías" y "Apariencia" a `/configuracion`
- El usuario puede crear, renombrar y desactivar categorías
- El usuario puede cambiar el tema (claro/oscuro/sistema)

**Componentes a crear:**
- `components/configuracion/CategoriesTab.tsx`
- `components/configuracion/CategoryTree.tsx` — árbol editable de categorías
- `components/configuracion/CategoryForm.tsx` — modal añadir/editar categoría
- `components/configuracion/Rule503020Mapping.tsx` — asignar categorías a Necesidades/Deseos/Ahorro
- `components/configuracion/AppearanceTab.tsx` — toggle de tema

**Lógica del tema:**
```ts
// Usar next-themes para gestión de dark/light/system
npm install next-themes
```
```tsx
// En root layout: <ThemeProvider attribute="class" defaultTheme="system">
// Toggle: useTheme() hook de next-themes
```

**Dependencias:** 1.6 (amplía la configuración del MVP)  
**Desbloquea:** Dark mode en toda la app, categorías personalizadas.

---

## Fase 4 — Polish

> **Objetivo:** Gráficas reales, dark mode completo, testing unitario y optimizaciones. La app pasa de funcional a pulida.

---

### 4.1 Gráficas Reales (Recharts)

**Qué hacer:**
- Reemplazar los charts estáticos del dashboard por gráficas interactivas reales
- Datos dinámicos desde Supabase

**Instalación:**
```bash
npm install recharts
```

**Componentes a crear:**
- `components/dashboard/CashFlowChart.tsx` — BarChart de ingresos vs gastos (6 meses)
- `components/dashboard/ExpenseDonutChart.tsx` — PieChart de distribución de gastos

**Especificaciones de diseño (DESIGN.md §2.9):**
```ts
// CashFlowChart:
// - BarChart con dos series (ingresos: primary, gastos: secondary)
// - Tooltip personalizado con bg-primary text-white
// - Sin grid lines visibles (solo sutiles)

// ExpenseDonutChart:
// - PieChart con innerRadius
// - Colores: primary, secondary, inverse-primary, outline-variant
// - Label central con total
```

**Dependencias:** 1.5 completamente funcional  

---

### 4.2 Dark Mode Completo

**Qué hacer:**
- Verificar que todos los componentes respetan las clases `dark:`
- Añadir variantes dark a todos los tokens de color personalizados
- Probar toda la app en modo oscuro

**Variables CSS dark mode:**
```css
/* En globals.css */
.dark {
  --background: #0f1117;
  --surface: #161b22;
  --surface-container: #1c2128;
  --surface-container-low: #1c2128;
  --surface-container-lowest: #0d1117;
  --on-surface: #e6edf3;
  /* etc. para cada token */
}
```

**Dependencias:** 3.3 (toggle de tema)  

---

### 4.3 Testing Unitario (Vitest)

**Qué hacer:**
- Instalar y configurar Vitest
- Tests para todas las funciones de cálculo (el core de la app)

**Instalación:**
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react
```

**Tests prioritarios:**

```
lib/calculations/
├── ingresos.test.ts
│   ├── calcularTotalMes → casos con 0, 1 y N ingresos
│   └── calcularPorcentajePorCategoria → suma = 100%, un ingreso = 100%
│
├── gastos.test.ts
│   ├── calcularTotalMes
│   └── calcularPorcentajePorCategoria
│
├── seguimiento.test.ts
│   ├── getTrackingStatus → 0%, 79%, 80%, 99%, 100%, 135%
│   └── generateInsights → detecta over-budget y ahorro
│
├── rule503020.test.ts
│   ├── calcularBloques → suma = ingresos totales
│   ├── calcularDesviacion → valores positivos, negativos y cero
│   └── generarInsightTexto → texto coherente para cada estado
│
└── objetivos.test.ts
    ├── calcularProgreso → 0%, 50%, 100%, >100%
    ├── calcularMesesRestantes → redondeo hacia arriba
    └── calcularAportacionNecesaria → con fecha límite pasada
```

**Dependencias:** Fase 2 y 3 completadas (las funciones de cálculo existen)  

---

### 4.4 Optimizaciones de Rendimiento

**Qué hacer:**
- Revisar y optimizar queries a Supabase (evitar N+1)
- Añadir caché de datos con React Query o SWR
- Optimizar re-renders con `useMemo` en los cálculos pesados

**Instalación (opcional pero recomendado):**
```bash
npm install @tanstack/react-query
```

**Queries a optimizar:**
```ts
// En vez de hacer queries separadas para ingresos y gastos del dashboard,
// usar una sola query con JOIN o vistas en Supabase:
CREATE VIEW monthly_summary AS
SELECT
  user_id,
  EXTRACT(YEAR FROM date) AS year,
  EXTRACT(MONTH FROM date) AS month,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
FROM transactions_view
GROUP BY user_id, year, month;
```

---

### 4.5 Mejoras de UX y Microinteracciones

**Qué hacer:**
- Añadir loading states (skeletons) en todas las secciones con datos
- Añadir empty states cuando no hay datos
- Confirmar eliminaciones con diálogos
- Toasts de feedback al guardar/eliminar

**Componentes:**
- `components/shared/Skeleton.tsx` — loading placeholder
- `components/shared/EmptyState.tsx` — estado vacío con CTA
- `components/shared/Toast.tsx` (o usar `sonner` de shadcn)
- `components/shared/ConfirmDialog.tsx`

---

## Checklist de Entregables por Fase

### Fase 0 ✓
- [ ] Proyecto Next.js inicializado con TypeScript y Tailwind
- [ ] Tokens de diseño configurados en `tailwind.config.ts`
- [ ] Fuentes Manrope + Inter cargadas
- [ ] Iconos Material Symbols configurados
- [ ] Proyecto Supabase creado
- [ ] Variables de entorno configuradas (local + Vercel)
- [ ] Todas las tablas creadas con RLS
- [ ] Seed de categorías por defecto insertado
- [ ] Deploy en Vercel funcionando
- [ ] Estructura de carpetas creada

### Fase 1 — MVP ✓
- [ ] Login con email + contraseña funcional
- [ ] Login con Google OAuth funcional
- [ ] Registro con creación de `user_preferences`
- [ ] Middleware de protección de rutas
- [ ] Sidebar con navegación y glassmorphism
- [ ] TopNavBar con search y avatar
- [ ] CRUD completo de ingresos
- [ ] CRUD completo de gastos (con subcategorías)
- [ ] Modal "Nuevo Movimiento" funcional
- [ ] Dashboard con 4 KPIs reales
- [ ] Selector de mes en Dashboard
- [ ] Configuración: perfil de usuario
- [ ] Configuración: moneda y formato
- [ ] `formatCurrency` usado en todos los importes

### Fase 2 ✓
- [ ] Tabla de presupuesto editable
- [ ] Sistema de plantilla base
- [ ] Sobrescritura por mes
- [ ] Tabla de seguimiento con semáforo de colores
- [ ] Insights automáticos de seguimiento
- [ ] Vista anual (12 meses)
- [ ] Barras de Regla 50/30/20
- [ ] Panel lateral de proyección
- [ ] Mini-panel de 50/30/20 en Dashboard
- [ ] Resumen anual en Dashboard

### Fase 3 ✓
- [ ] Máximo 5 objetivos de ahorro
- [ ] Modal de crear/editar objetivo
- [ ] Registro de aportaciones
- [ ] Cálculo automático de meses restantes
- [ ] Exportación .xlsx de ingresos
- [ ] Exportación .xlsx de gastos
- [ ] Exportación .xlsx completa (todas las hojas)
- [ ] Gestión de categorías en configuración
- [ ] Mapeo de categorías a bloques 50/30/20
- [ ] Toggle de tema claro/oscuro/sistema

### Fase 4 ✓
- [x] Gráfica de flujo de caja (Recharts BarChart)
- [x] Gráfica de distribución de gastos (Recharts PieChart)
- [x] Dark mode completo y verificado
- [x] Tests unitarios para todos los módulos de cálculo (55 tests)
- [x] Skeletons de carga (Skeleton, SkeletonCard, SkeletonRow)
- [ ] Empty states
- [x] Toasts de feedback (sonner)
- [x] Diálogos de confirmación (GoalCard, MovementsTable)
- [ ] React Query para caché de datos (omitido — Firebase listeners ya son reactivos)

---

## Dependencias entre Fases

```
Fase 0 (Setup)
    ↓
Fase 1.1 (Auth)
    ↓
Fase 1.2 (Layout)
    ↓
┌─── 1.3 (Ingresos) ───┐
│                       │
▼                       ▼
1.4 (Gastos)        1.6 (Config básica)
    ↓
1.5 (Dashboard MVP) ← ← ← ← ← ← MVP COMPLETO
    ↓
2.1 (Presupuesto)
    ↓
2.2 (Seguimiento)
    |
2.3 (Regla 50/30/20) ← depende también de 1.3 y 1.4
    ↓
2.4 (Dashboard V2)
    ↓
3.1 (Objetivos)
    |
3.2 (Exportación) ← depende de todos los módulos de datos
    |
3.3 (Config avanzada)
    ↓
4.x (Polish — paralelo entre sí)
```

---

## Stack Técnico Completo

| Tecnología | Rol | Versión |
|---|---|---|
| Next.js | Framework fullstack | 14+ (App Router) |
| TypeScript | Tipado estático | 5+ |
| Tailwind CSS | Estilos | 3+ |
| shadcn/ui | Componentes base | latest |
| Supabase | Auth + PostgreSQL + Storage | latest |
| Recharts | Gráficas interactivas (Fase 4) | 2+ |
| xlsx (SheetJS) | Exportación a Excel | latest |
| next-themes | Dark mode | latest |
| @tanstack/react-query | Caché de datos (Fase 4) | 5+ |
| Vitest | Testing unitario (Fase 4) | latest |
| Vercel | Deploy + CI/CD | — |

---

## Notas Importantes

### Principio de diseño en código
> Todos los componentes deben seguir estrictamente el `DESIGN.md`: sin bordes `1px solid`, separación por capas de superficie, glassmorphism en sidebar, gradient signature en CTAs.

### Formulario "Nuevo Movimiento"
> El modal de `MovementModal.tsx` es el componente más usado de la app. Debe ser accesible desde el CTA del sidebar y desde cada pantalla de datos. Construirlo bien en la Fase 1 ahorra trabajo en todas las fases siguientes.

### `formatCurrency` — función crítica
> Esta función debe crearse en la Fase 1.6 y usarse en absolutamente todos los componentes que muestren importes. Si el usuario cambia la moneda en Configuración, todo cambia automáticamente.

### Seed de categorías
> Las 9 categorías de gastos con sus 40+ subcategorías (FUNCTIONALITIES.md §6.5) y las 9 categorías de ingresos (FUNCTIONALITIES.md §5.4) deben estar en la base de datos desde el primer deploy. Sin ellas, los módulos de Ingresos y Gastos no funcionan.
