# DESIGN.md — Control Financiero

Documento de diseño detallado extraído del prototipo Stitch. Sirve como referencia única para la implementación de la app.

---

## 1. Identidad y Filosofía de Diseño

**Nombre de la app:** Control Financiero  
**Subtítulo:** Wealth Management

**Concepto creativo: "The Editorial Vault"**  
La app trata los datos financieros con la seriedad de una publicación editorial de alta gama. Rechaza el aspecto "SaaS-template" lleno de líneas y adopta el **Architectural Layering**: capas tonales, espacios en blanco amplios y tipografía sofisticada para crear un entorno de "Quiet Authority".

**Filosofía "Glass & Stone":**

- Elementos estructurales → pesados y estables (Deep Navy / Slate)
- Overlays de datos → ligeros y etéreos (Glassmorphism)

---

## 2. Sistema de Diseño

### 2.1 Paleta de Colores

```
// Core
primary:                  #041627   // Deep Navy - fondo sidebar activo, textos clave
primary-container:        #1a2b3c   // variante más clara de primary
on-primary:               #ffffff
on-primary-container:     #8192a7
primary-fixed:            #d2e4fb
primary-fixed-dim:        #b7c8de
on-primary-fixed:         #0b1d2d
on-primary-fixed-variant: #38485a

// Secondary (Emerald Green - éxito, crecimiento)
secondary:                #006c4a
secondary-container:      #82f5c1
on-secondary:             #ffffff
on-secondary-container:   #00714e
secondary-fixed:          #85f8c4
secondary-fixed-dim:      #68dba9
on-secondary-fixed:       #002114
on-secondary-fixed-variant: #005137

// Tertiary (Rose Red - alertas suaves)
tertiary:                 #350008
tertiary-container:       #5b0015
on-tertiary:              #ffffff
on-tertiary-container:    #ff5168   // usado como color de acento/aviso
tertiary-fixed:           #ffdada
tertiary-fixed-dim:       #ffb3b6
on-tertiary-fixed:        #40000c
on-tertiary-fixed-variant: #920028

// Error
error:                    #ba1a1a
error-container:          #ffdad6
on-error:                 #ffffff
on-error-container:       #93000a

// Surface hierarchy (de más oscuro a más claro)
surface-dim:              #d8dadc   // más oscuro
surface-container-highest:#e0e3e5
surface-container-high:   #e6e8ea
surface-container:        #eceef0
surface-container-low:    #f2f4f6
surface:                  #f7f9fb
surface-bright:           #f7f9fb
surface-container-lowest: #ffffff   // más claro — "pop" natural sin sombras

// Text
on-surface:               #191c1e   // nunca usar #000000
on-surface-variant:       #44474c
on-background:            #191c1e

// Borders (usados con opacidad baja)
outline:                  #74777d
outline-variant:          #c4c6cd

// Misc
inverse-surface:          #2d3133
inverse-on-surface:       #eff1f3
inverse-primary:          #b7c8de
surface-tint:             #4f6073
surface-variant:          #e0e3e5
background:               #f7f9fb
```

### 2.2 Border Radius

```
DEFAULT: 0.125rem   // elementos muy pequeños
lg:      0.25rem
xl:      0.5rem     // cards principales
full:    0.75rem    // chips, pills, badges
// Para goal cards y secciones grandes: rounded-[2rem] o rounded-[2.5rem]
```

### 2.3 Tipografía

| Rol | Fuente | Pesos | Uso |
|---|---|---|---|
| Headlines / Display | **Manrope** | 600, 700, 800 | Títulos de sección, cifras monetarias grandes (>24px), nombres de KPIs |
| Body / Data / Labels | **Inter** | 400, 500, 600 | Tablas, párrafos, labels, datos numéricos en tablas |

**Regla editorial:** Siempre combinar un `headline-md` (Manrope) con un `label-md` (Inter, UPPERCASE, tracking-widest) para crear relación "Header + Subheader" curado.

**Importación Google Fonts:**

```
Manrope: wght@400;600;700;800
Inter: wght@400;500;600;700
Material Symbols Outlined: wght,FILL@100..700,0..1
```

### 2.4 Regla "Sin Bordes" (The No-Line Rule)

**CRÍTICO:** Prohibido usar bordes `1px solid` para separar secciones.

- Separación **solo** mediante cambios de `background-color` entre tokens de superficie.
- Si un borde es estrictamente necesario por accesibilidad: usar `outline-variant` (#c4c6cd) al **15% de opacidad**.
- Aumentar padding 16px en vez de añadir una línea divisoria.

### 2.5 Elevación y Profundidad (Tonal Layering)

Tres capas físicas:

1. **Base:** `surface` (#f7f9fb) — la mesa
2. **Sección:** `surface-container-low` (#f2f4f6) — agrupaciones grandes
3. **Interactiva:** `surface-container-lowest` (#ffffff) — cards individuales, tablas

**Sombras** solo para overlays temporales (modales/dropdowns):

```css
box-shadow: 0 12px 32px rgba(25, 28, 30, 0.06);
```

**Glassmorphism del sidebar:**

```css
background: rgba(255,255,255,0.85);
backdrop-filter: blur(20px);
```

### 2.6 Componentes — Botones

| Tipo | Fondo | Texto | Border Radius |
|---|---|---|---|
| **Primary** | Gradient `primary` → `primary-container` (135°) | `on-primary` (#fff) | `xl` (0.5rem) |
| **Secondary** | `surface-container-high` | `on-surface` | `xl` |
| **Ghost/Tertiary** | Ninguno | `primary` | `xl` |

### 2.7 Componentes — Inputs

- Default: bg `surface-container-highest`, sin borde, borde inferior "ghost" de `outline-variant` al 20%
- Focus: borde inferior → `primary` a 2px
- Border radius: `xl`

### 2.8 Componentes — Iconos

- Librería: **Material Symbols Outlined**
- Configuración base: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`
- Iconos activos/filled: `'FILL' 1`
- **SIEMPRE** acompañar icono con label de texto (nunca icono solo en navegación)

### 2.9 Gráficas y Progress Bars

- Eje éxito/crecimiento: `secondary` (Emerald Green)
- Eje error/sobre-presupuesto: `error` (Rose Red)
- Líneas de gráfica: stroke 2px; área rellena con gradiente del color al 10% → 0%
- Progress bars: `h-2` o `h-3` o `h-4` según contexto, `rounded-full`, con gradiente

### 2.10 Gradiente Signature

```css
background: linear-gradient(135deg, #041627 0%, #1a2b3c 100%);
```

Usado en: botón CTA principal del sidebar, card de diferencia (presupuesto), tarjeta de meta de ahorro mensual.

---

## 3. Layout Global

### 3.1 Estructura de Página

```
+--Sidebar (w-72, fixed)--+--Main Content (ml-72)----+
| Logo                    | Header (sticky, h-20)    |
| Nav links               |--------------------------|
| ...                     | Page Content (px-12 py-8)|
| [Nuevo Movimiento] CTA  |                          |
| User profile (opcional) |                          |
+-------------------------+--------------------------+
```

### 3.2 Sidebar — Especificación

- **Ancho:** `w-72` (288px), fixed
- **Fondo:** `bg-white/85 backdrop-blur-xl` (glassmorphism)
- **Border:** `border-r border-slate-200/15` (casi invisible)
- **Padding:** `py-8 px-6`
- **Logo block:** Manrope, font-black, `text-2xl`; subtítulo Inter UPPERCASE tracking-widest
- **Nav items (inactivo):** `text-slate-500 font-medium hover:bg-slate-100/50 rounded-xl px-4 py-3`
- **Nav item (activo):** `text-slate-900 font-bold border-r-2 border-slate-900 bg-slate-100/50 rounded-xl`
- **CTA "Nuevo Movimiento":** `w-full bg-primary text-white rounded-xl py-4 font-bold` con gradient signature

**Nav links (en orden):**

1. `dashboard` → Resumen
2. `payments` → Ingresos
3. `receipt_long` → Gastos
4. `account_balance_wallet` → Presupuesto
5. `monitoring` → Seguimiento mensual
6. `savings` → Objetivos de ahorro
7. `pie_chart` → Regla 50/30/20
8. `settings` → Configuración

### 3.3 Header / TopNavBar — Especificación

- **Altura:** `h-20`, sticky, `z-40`, fondo transparente
- **Padding:** `px-12`
- **Lado izquierdo:**
  - Search bar: `rounded-full pl-10 pr-4 py-2 bg-surface-container-low` con icono `search` absoluto
  - Links: Reportes | Auditoría (`text-sm font-medium tracking-wide`)
- **Lado derecho:**
  - Botón "Soporte" (ghost)
  - Botón "Exportar" (primary)
  - Botón notificaciones (icono)
  - Botón ayuda (icono)
  - Separador vertical `h-8 w-px bg-outline-variant/30`
  - Avatar usuario (`w-10 h-10 rounded-full ring-2 ring-white`)

---

## 4. Pantallas

---

### Pantalla 1: Resumen Ejecutivo (Dashboard)

**Ruta:** `/` o `/resumen`  
**Nav activo:** Resumen

#### 4.1.1 Encabezado de página

```
Análisis de rendimiento financiero de [Mes Año]   |  [trending_up] Comparado con [Mes anterior]: +12.4% crecimiento
Resumen Ejecutivo
```

- Título: `text-4xl font-black font-headline text-primary`
- Badge comparación: `bg-surface-container-low px-4 py-2 rounded-full`

#### 4.1.2 KPI Bento Grid (4 columnas)

| Card | Icono | Bg icono | Indicador | Valor ejemplo |
|---|---|---|---|---|
| Ingresos del mes | `account_balance` | `bg-primary-fixed text-primary` | `+8%` en `text-secondary` | $12,450.00 |
| Gastos del mes | `shopping_bag` | `bg-tertiary-fixed text-on-tertiary-fixed-variant` | `-3%` en `text-error` | $6,120.45 |
| Ahorro generado | `verified` | `bg-secondary-fixed text-on-secondary-fixed-variant` | Badge "Objetivo OK" en `bg-secondary-container text-secondary` | $6,329.55 |
| % de Ahorro | — | Card fondo `bg-primary text-white` | Circular SVG progress | 50.8% |

**Card % de Ahorro (card 4):**

- Fondo: `bg-primary` (Deep Navy) con texto blanco
- SVG circular: radio 28, strokeWidth 6, círculo de fondo `text-white/10`, progress en `text-secondary-fixed`
- Label porcentaje `text-on-primary-container` UPPERCASE

#### 4.1.3 Sección Charts (grid 3 columnas)

**Flujo de Caja Histórico** (col-span-2):

- Título `text-xl font-bold font-headline text-primary`
- Subtítulo `text-on-surface-variant text-sm`
- Leyenda: punto `w-3 h-3 rounded-full` azul=Ingresos, verde=Gastos
- Chart de barras simulado con 6 meses (Ene–Jun)
  - Barras: `w-12 bg-primary/20 rounded-t-lg hover:bg-primary/40`
  - Barra activa (mes actual): `bg-primary/60`
  - Barra proyectada (futura): `bg-outline-variant/20 border-dashed border-2`
  - Tooltip en hover: `bg-primary text-white text-[10px] py-1 px-2 rounded`
  - Ejes Y: `border-b border-outline-variant/10 text-[10px]` con labels 12k, 8k, 4k, 0

**Distribución de Gastos** (col-span-1):

- Título `text-xl font-bold font-headline text-primary`
- Donut SVG con total en el centro
- Leyenda de categorías con cuadrado de color + nombre + porcentaje
  - Vivienda: `bg-primary` 45%
  - Alimentación: `bg-secondary` 22%
  - Ocio: `bg-inverse-primary` 18%
  - Otros: `bg-outline-variant` 15%

#### 4.1.4 Objetivos de Ahorro (preview)

- Encabezado: título + link "Ver todos" con `chevron_right`
- Grid 3 columnas, cards con `bg-surface-container rounded-xl hover:border-primary-container`
- Cada card:
  - Icono en `w-12 h-12 bg-white rounded-lg`
  - Nombre objetivo + meta en euros/dólares
  - Cifra actual + porcentaje
  - Progress bar `h-2 bg-white rounded-full` con fill del color correspondiente

| Objetivo | Icono | Color progress | Ejemplo |
|---|---|---|---|
| Viaje a Japón 2025 | `flight_takeoff` | `bg-primary` | $3,250 / $5,000 = 65% |
| Fondo Vehículo Nuevo | `directions_car` | `bg-secondary` | $9,600 / $12,000 = 80% |
| Fondo de Emergencia | `emergency_home` | `bg-on-tertiary-container` | $4,500 / $15,000 = 30% |

---

### Pantalla 2: Gestión de Movimientos

**Ruta:** `/movimientos`  
**Nota:** Esta pantalla también sirve para `/ingresos` y `/gastos` con filtro pre-aplicado.  
**Nav activo:** Ingresos / Gastos (según filtro)

#### 4.2.1 Cards resumen (3 columnas)

| Card | Label | Icono | Detalle |
|---|---|---|---|
| Balance Mensual | `account_balance` filled en `text-secondary` | +$4,820.50 | "12% más que el mes pasado" en `text-secondary` |
| Ingresos Totales | `arrow_downward` en `text-secondary` | $8,240.00 | "14 transacciones confirmadas" |
| Gastos Totales | `arrow_upward` en `text-error` | $3,419.50 | Progress bar `bg-error` al 65% + "65% del presupuesto utilizado" |

**Diseño de card:** `bg-surface-container-lowest p-8 rounded-full shadow-sm`

#### 4.2.2 Barra de Filtros y Acciones

Container: `bg-surface-container-low rounded-xl p-6 flex flex-wrap justify-between`

**Izquierda:**

- Selector mes: `bg-white px-4 py-2 rounded-lg text-sm shadow-sm border border-slate-100` con icono `calendar_today` + `expand_more`
- Selector categoría: igual con icono `category`

**Derecha:**

- "Limpiar Filtros" → botón secondary (`bg-surface-container-high`)
- "Añadir Movimiento" → botón primary con icono `add`

#### 4.2.3 Tabla de Movimientos

Container: `bg-surface-container-lowest rounded-xl overflow-hidden`  
Header de tabla: `bg-surface-container-low`

**Columnas:**

| # | Nombre | Alineación | Tipo |
|---|---|---|---|
| 1 | Fecha | left | texto sm, slate-500 |
| 2 | Concepto | left | bold + ref en `text-[10px] text-slate-400` |
| 3 | Categoría | left | pill badge `rounded-full px-3 py-1 text-xs font-bold` |
| 4 | Monto | right | extrabold; positivo=`text-secondary`, negativo=`text-error` |
| 5 | Estado | center | icono `check_circle` filled `text-secondary` o `schedule` `text-slate-400` |
| 6 | Acciones | right | `edit_note` visible en hover (opacity-0 → opacity-100) |

**Filas:** `hover:bg-surface-bright transition-colors cursor-pointer group`  
**Separador:** `divide-y divide-surface-container`

**Categorías — colores de badge:**

- Tecnología: `bg-primary/5 text-primary`
- Salario: `bg-secondary/5 text-secondary`
- Hogar: `bg-primary/5 text-primary`
- Entretenimiento: `bg-primary/5 text-primary`

**Paginación (footer de tabla):**
`bg-surface-container-low px-8 py-4 flex justify-between`  
Texto: "Mostrando X de Y movimientos"  
Botones: `chevron_left` / `chevron_right`

#### 4.2.4 Modal / Formulario "Nuevo Movimiento"

Posición: Floating, fixed bottom-right (`fixed bottom-12 right-12`)  
Container: `w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-8`

**Campos del formulario:**

1. **Concepto** — input text, placeholder "Ej: Supermercado"
2. **Monto** — input number + **Tipo** (toggle Gasto/Ingreso)
   - Toggle: `flex bg-surface-container-low rounded-lg p-1`
   - Activo Gasto: `bg-white shadow-sm text-error`
   - Activo Ingreso: `text-secondary`
3. **Fecha** — date picker (no visible en prototipo, se debe añadir)
4. **Categoría** — select con opciones: Hogar, Tecnología, Salud, Alimentación, Entretenimiento...

**CTA:** `w-full bg-primary text-on-primary py-4 rounded-xl font-bold` → "Guardar Movimiento"

---

### Pantalla 3: Objetivos de Ahorro + Regla 50/30/20

**Ruta:** `/objetivos`  
**Nav activo:** Objetivos de ahorro / Regla 50/30/20

#### 4.3.1 Sección Objetivos de Ahorro

**Encabezado:**

- Supertítulo: `text-xs font-bold tracking-widest text-on-primary-container uppercase`
- Título: `text-4xl font-black text-primary` → "Objetivos de Ahorro"
- Botón "Gestionar todos" con `arrow_forward`

**Grid de cards (1/2/3 cols responsive):**

Cada card: `bg-surface-container-lowest p-8 rounded-[2rem] hover:translate-y-[-4px] transition-all`

Estructura interna:

```
[Icono 56x56 rounded-2xl]    [Badge fecha/tipo]
[Título del objetivo - Manrope bold]
[$actual - $total - Inter]
[Badge porcentaje completado] [$ restantes]
[Progress bar h-4 rounded-full con gradiente]
```

| Objetivo | Icono | Bg icono | Color progress | Ejemplo |
|---|---|---|---|---|
| Viaje a Japón | `flight_takeoff` filled | `bg-secondary-container` | gradient `from-secondary to-secondary-fixed-dim` | $4,200/$6,000 = 70% |
| Nuevo SUV Híbrido | `directions_car` filled | `bg-primary-fixed` | gradient `from-primary to-primary-container` | $12,500/$45,000 = 28% |
| Fondo de Emergencia | `emergency` filled | `bg-tertiary-fixed` | gradient `from-error to-on-tertiary-container` | $14,100/$15,000 = 94% |

#### 4.3.2 Sección Regla 50/30/20

**Encabezado:**

- Supertítulo: "Salud Financiera"
- Título: "Regla 50 / 30 / 20"
- Descripción breve en `text-on-surface-variant`

**Layout: grid 12 cols — 8+4**

**Panel visualización (8/12):**  
Container: `bg-surface-container-lowest p-10 rounded-[2.5rem]`  
3 barras horizontales con layout consistente:

```
[Nombre categoría]                    [% actual - color estado]
[Descripción de qué incluye]          [Estado vs ideal - texto]
[━━━━━━━━░░░░░░░░░░░░░░░░] barra h-10 rounded-2xl
```

| Categoría | Ideal | Color en rango | Color fuera | Ejemplo |
|---|---|---|---|---|
| Necesidades | 50% | `bg-primary` | — | 48% → verde |
| Deseos | 30% | `bg-primary` | `bg-error` | 36% → rojo (excedido) |
| Ahorro e Inversión | 20% | `bg-secondary` | — | 16% → amarillo (bajo) |

**Insight box** (debajo de las barras):  
`mt-12 p-6 bg-surface-container-low rounded-2xl flex items-start gap-4`  
Icono `info` + texto de análisis personalizado

**Panel lateral (4/12):**

1. **Saldo Proyectado** (dark card):
   - `bg-primary-container p-8 rounded-[2.5rem] text-white`
   - Icono de fondo gigante `insights` a 10% opacidad
   - "+$1,450" en `text-5xl font-black`
   - Botón "Reajustar Ahora" en `bg-white text-primary`

2. **Comparativa Anual** (light card):
   - `bg-surface-container-lowest p-8 rounded-[2.5rem]`
   - Lista de meses con barra vertical de color + distribución (ej: "42 / 38 / 20")
   - Colores: `bg-primary`, `bg-secondary`, `bg-error`

---

### Pantalla 4: Seguimiento Mensual (Presupuesto)

**Ruta:** `/seguimiento` o `/presupuesto`  
**Nav activo:** Seguimiento mensual

#### 4.4.1 Encabezado de página

```
[ESTADO DE PRESUPUESTO]    →  selector mes [Octubre 2023 ▾]
Seguimiento Mensual
```

#### 4.4.2 Bento KPIs (3 columnas)

| Card | Valor | Indicador | Estilo |
|---|---|---|---|
| Total Previsto | $12,450.00 | +4.2% vs mes anterior (`text-secondary`) | `bg-surface-container-lowest` |
| Total Real | $10,124.50 | -2.1% vs mes anterior (`text-error`) | `bg-surface-container-lowest` |
| Diferencia Actual | $2,325.50 | "81% del presupuesto ejecutado" | Gradient signature (dark) |

#### 4.4.3 Tabla Comparativa por Categoría

Container wrapper: `bg-surface-container-low p-1 rounded-xl`  
Inner: `bg-surface-container-lowest rounded-xl overflow-hidden`

**Cabecera de tabla:** `grid grid-cols-12 px-8 py-6`

**Columnas:**

| Col-span | Nombre | Alineación |
|---|---|---|
| 4 | Categoría | left (icono + nombre) |
| 2 | Previsto | right (`text-slate-400`) |
| 2 | Real | right (`text-primary`) |
| 3 | Progreso | center (progress bar h-2 + label) |
| 1 | Diferencia | right (verde si positivo, rojo si negativo) |

**Filas de categorías:**

| Categoría | Icono | Estado | Color barra |
|---|---|---|---|
| Vivienda & Servicios | `home` | 100% (neutral) | `bg-secondary` |
| Alimentación | `restaurant` | 84% (bajo límite) | `bg-primary` |
| Entretenimiento | `movie` | 135% (sobre límite) | `bg-error` + container `bg-error-container` |
| Transporte | `directions_car` | 56% (bien) | `bg-secondary` |
| Salud & Seguros | `health_and_safety` | 98% (ok) | `bg-primary` |

**Labels de estado:** `text-[10px] text-center mt-2 font-bold`

- Bajo límite: `text-secondary`
- Sobre límite: `text-error` + "X% SOBRE EL LÍMITE"
- Neutral: `text-primary`

**Footer de tabla:**  
`bg-surface-container-low px-8 py-10` con grid 12 cols  
Muestra: "TOTAL MENSUAL" | Presupuesto total | Gasto real | Progress global | Balance (+/-)

#### 4.4.4 Sección Insights (7+5 columnas)

**Categorías con Mayor Desviación (7/12):**  
Lista de cards `bg-surface-container-lowest p-6 rounded-xl flex justify-between`:

- Alerta (sobre límite): icono `warning` en `bg-error/10 text-error` + descripción + botón "Ajustar"
- Éxito (ahorro): icono `check_circle` en `bg-secondary/10 text-secondary` + ahorro proyectado + "Transferir a Ahorros"

**Meta de Ahorro Mensual (5/12):**  
Card oscura: `bg-primary text-white p-8 rounded-xl`

- Título + cifra grande ($450.00 de $500.00)
- Progress bar `bg-white/10` con fill `bg-secondary-fixed`
- Texto motivacional con monto restante en `text-secondary-fixed font-bold`

---

## 5. Estados y Feedback Visual

### Hover

- Filas de tabla: `hover:bg-surface-bright`
- Cards navegación: `hover:bg-slate-100/50`
- Cards de objetivo: `hover:translate-y-[-4px]`
- Cards de resumen: `hover:border-primary-container`

### Activo

- Botones: `active:scale-95 transition-transform`

### Progreso / Salud Financiera

| Estado | Condición | Color |
|---|---|---|
| Excelente | < 80% del presupuesto | `secondary` (verde) |
| Atención | 80–100% | `primary` (navy) |
| Crítico | > 100% | `error` (rojo) |
| Proyectado | sin datos | Borde dashed `outline-variant` |

---

## 6. Formulario "Nuevo Movimiento" — Campos Completos

| Campo | Tipo | Opciones / Notas |
|---|---|---|
| Concepto | text | placeholder "Ej: Supermercado" |
| Monto | number | placeholder "0.00" |
| Tipo | toggle | Gasto (activo por defecto) / Ingreso |
| Fecha | date | por defecto hoy |
| Categoría | select | Hogar, Tecnología, Salud, Alimentación, Entretenimiento, Transporte, Vivienda, Salario, Otros |
| Nota (opcional) | textarea | referencia o descripción |

---

## 7. Datos de Ejemplo (Mock Data)

### Transacciones

```
- 24 Oct 2023 | Servicios Digitales AWS | Tecnología | -$240.00 | Confirmado
- 23 Oct 2023 | Nómina Octubre          | Salario    | +$4,500.00 | Confirmado
- 21 Oct 2023 | Alquiler Loft Studio    | Hogar      | -$1,200.00 | Confirmado
- 19 Oct 2023 | Suscripción Netflix     | Entretenim.| -$15.99   | Pendiente
```

### Objetivos de Ahorro

```
- Viaje a Japón      | actual: $4,200  | meta: $6,000  | deadline: Dic 2024 | 70%
- Nuevo SUV Híbrido  | actual: $12,500 | meta: $45,000 | deadline: Mar 2025 | 28%
- Fondo de Emergencia| actual: $14,100 | meta: $15,000 | indefinido         | 94%
```

### Presupuesto Mensual (Octubre 2023)

```
- Vivienda & Servicios | previsto: $3,200 | real: $3,200 | 100%
- Alimentación         | previsto: $850   | real: $720   | 84%
- Entretenimiento      | previsto: $400   | real: $542   | 135% ⚠️
- Transporte           | previsto: $600   | real: $340   | 56%
- Salud & Seguros      | previsto: $1,100 | real: $1,080 | 98%
```

---

## 8. Notas de Implementación

### Tech Stack Recomendado

- **Framework:** Next.js 14+ (App Router)
- **Estilos:** Tailwind CSS con tokens del sistema de diseño
- **Componentes UI:** shadcn/ui como base, personalizado con el tema
- **Gráficas:** Recharts o Chart.js (para implementar los charts reales)
- **Iconos:** Material Symbols Outlined vía Google Fonts CDN o npm
- **Fuentes:** Manrope + Inter vía Google Fonts
- **Base de datos:** Supabase (PostgreSQL) o localStorage para MVP

### Configuración Tailwind base

Los colores, borderRadius y fontFamily del sistema de diseño deben extender el theme en `tailwind.config.ts`.

### Componentes reutilizables a crear

1. `<Sidebar>` — glassmorphism, nav links, CTA
2. `<TopNavBar>` — search, nav links, acciones, avatar
3. `<KPICard>` — icono, label, valor, indicador
4. `<TransactionRow>` — fila de tabla con hover
5. `<GoalCard>` — objetivo con progress bar
6. `<BudgetRow>` — fila comparativa presupuesto
7. `<NewMovementModal>` — formulario floating
8. `<ProgressBar>` — reutilizable con props de color y porcentaje
9. `<InsightCard>` — alerta o éxito con icono y acción
10. `<CategoryBadge>` — pill de categoría con color

### Responsive

El diseño es **desktop-first**. El sidebar es fijo en desktop. En móvil se puede colapsar (no especificado en el prototipo).

### Paleta Tailwind (tailwind.config.ts)

Registrar todos los tokens de color del punto 2.1 bajo `theme.extend.colors`, con los mismos nombres kebab-case del prototipo.
