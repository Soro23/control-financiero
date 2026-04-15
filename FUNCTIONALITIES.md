# FUNCTIONALITIES.md — Control Financiero

Documento de funcionalidades completo. Define qué hace la app, cómo se conectan los módulos entre sí y qué pantallas existirán.

---

## Índice

1. [Visión General de la App](#1-visión-general-de-la-app)
2. [Mapa de Pantallas](#2-mapa-de-pantallas)
3. [Módulo: Autenticación](#3-módulo-autenticación)
4. [Módulo: Panel Resumen / Dashboard](#4-módulo-panel-resumen--dashboard)
5. [Módulo: Gestión de Ingresos](#5-módulo-gestión-de-ingresos)
6. [Módulo: Gestión de Gastos](#6-módulo-gestión-de-gastos)
7. [Módulo: Presupuesto Mensual](#7-módulo-presupuesto-mensual)
8. [Módulo: Seguimiento Real vs Presupuesto](#8-módulo-seguimiento-real-vs-presupuesto)
9. [Módulo: Objetivos de Ahorro](#9-módulo-objetivos-de-ahorro)
10. [Módulo: Regla 50/30/20](#10-módulo-regla-503020)
11. [Módulo: Exportación (.xlsx)](#11-módulo-exportación-xlsx)
12. [Módulo: Configuración](#12-módulo-configuración)
13. [Motor de Cálculos Automáticos](#13-motor-de-cálculos-automáticos)
14. [Mapa de Conexiones entre Módulos](#14-mapa-de-conexiones-entre-módulos)
15. [Modelo de Datos](#15-modelo-de-datos)

---

## 1. Visión General de la App

**Control Financiero** es una app web personal de gestión financiera. El usuario introduce sus datos financieros una sola vez y la app calcula automáticamente totales, porcentajes, desviaciones y proyecciones.

**Principio core:** El usuario solo introduce datos crudos (importes, fechas, conceptos). Todo lo demás es calculado, comparado y visualizado de forma automática.

**Usuarios:** Un usuario por cuenta (multi-cuenta con auth). Cada usuario ve exclusivamente sus propios datos.

**Flujo básico de uso:**
```
Registrarse / Login
       ↓
Configurar presupuesto base (una sola vez)
       ↓
Registrar ingresos y gastos reales cada mes
       ↓
La app calcula, compara y visualiza todo
       ↓
Revisar dashboard, seguimiento y objetivos
       ↓
Exportar cuando sea necesario
```

---

## 2. Mapa de Pantallas

### Pantallas públicas (sin login)
| Ruta | Pantalla | Descripción |
|---|---|---|
| `/` | Landing / Login | Pantalla de bienvenida con formulario de acceso |
| `/registro` | Registro | Crear cuenta con email+password o Google |
| `/auth/callback` | Auth Callback | Redirección OAuth de Google |

### Pantallas privadas (requieren login)
| Ruta | Pantalla | Módulo |
|---|---|---|
| `/dashboard` | Panel Resumen | Dashboard |
| `/ingresos` | Gestión de Ingresos | Ingresos |
| `/gastos` | Gestión de Gastos | Gastos |
| `/presupuesto` | Presupuesto Mensual | Presupuesto |
| `/seguimiento` | Seguimiento Real vs Presupuesto | Seguimiento |
| `/objetivos` | Objetivos de Ahorro + Regla 50/30/20 | Objetivos + 50/30/20 |
| `/configuracion` | Configuración | Configuración |

> **Nota de navegación:** Las pantallas `/ingresos` y `/gastos` son la misma vista base (Gestión de Movimientos) con filtro de tipo pre-aplicado. Comparten el mismo componente de tabla.

---

## 3. Módulo: Autenticación

### Descripción
Control de acceso a la app. Cada usuario tiene su propia cuenta y sus datos son completamente privados.

### Funcionalidades
- **Registro** con email + contraseña
- **Login** con email + contraseña
- **Login social** con Google OAuth
- **Recuperación de contraseña** vía email
- **Cerrar sesión**
- **Persistencia de sesión** — el usuario no necesita volver a loguearse en cada visita

### Pantallas
#### `/` — Login
- Formulario: email + contraseña
- Botón "Entrar con Google"
- Link "¿No tienes cuenta? Regístrate"
- Link "Olvidé mi contraseña"

#### `/registro` — Registro
- Formulario: nombre, email, contraseña, confirmar contraseña
- Botón "Registrarse con Google"
- Link "¿Ya tienes cuenta? Inicia sesión"

### Conexión con otros módulos
- Al registrarse → redirige a `/dashboard`
- Si no hay sesión activa → cualquier ruta privada redirige a `/`
- El `user_id` se usa como clave en todas las tablas de datos

---

## 4. Módulo: Panel Resumen / Dashboard

### Descripción
Vista ejecutiva de la situación financiera del usuario. No se introducen datos aquí — todo se calcula a partir de los datos de los otros módulos.

### Pantalla: `/dashboard`

#### 4.1 KPIs principales (4 cards)

| KPI | Fuente de datos | Cálculo |
|---|---|---|
| Ingresos del mes | Módulo Ingresos | Suma de todos los ingresos del mes activo |
| Gastos del mes | Módulo Gastos | Suma de todos los gastos del mes activo |
| Ahorro generado | Automático | `ingresos_mes - gastos_mes` |
| % de Ahorro | Automático | `(ahorro / ingresos_mes) × 100` |

Indicadores de tendencia comparando con el mes anterior (calculado automáticamente).

#### 4.2 Selector de mes
- Por defecto: mes actual
- Permite navegar a cualquier mes del año
- Todos los módulos del dashboard reaccionan al mes seleccionado

#### 4.3 Gráfica "Flujo de Caja Histórico"
- Fuente: ingresos y gastos de los últimos 6 meses
- Gráfica de barras comparativa mes a mes
- Muestra mes actual + meses anteriores + mes futuro (proyectado si hay presupuesto)

#### 4.4 Gráfica "Distribución de Gastos"
- Fuente: gastos del mes activo agrupados por categoría principal
- Donut chart con porcentaje por categoría
- Categorías: las definidas en el módulo de Gastos

#### 4.5 Comparativa Regla 50/30/20 (mini-panel)
- Muestra los 3 bloques (Necesidades / Deseos / Ahorro) con % real vs % ideal
- Indicador visual: verde si está dentro del ideal, rojo si está fuera
- Link "Ver detalle" → navega a `/objetivos`

#### 4.6 Resumen Anual
- Cards con totales del año en curso:
  - Ingresos anuales acumulados
  - Gastos anuales acumulados
  - Ahorro anual acumulado
  - % de ahorro promedio anual

#### 4.7 Preview de Objetivos de Ahorro
- Muestra hasta 3 objetivos activos con su progreso
- Link "Ver todos" → navega a `/objetivos`

### Conexión con otros módulos
- Lee datos de: Ingresos, Gastos, Presupuesto, Objetivos, Regla 50/30/20
- No escribe datos — es 100% de lectura
- El selector de mes del dashboard es independiente por pantalla (no afecta a los otros módulos)

---

## 5. Módulo: Gestión de Ingresos

### Descripción
Registro y gestión de todas las fuentes de ingresos del usuario. Los datos introducidos aquí alimentan el Dashboard, el Seguimiento y la Regla 50/30/20.

### Pantalla: `/ingresos`

#### 5.1 Cards resumen (calculadas automáticamente)
| Card | Cálculo |
|---|---|
| Total ingresos del mes | Suma de ingresos del mes filtrado |
| Número de fuentes activas | Count de ingresos distintos del mes |
| Mayor fuente de ingreso | Fuente con mayor importe del mes |
| Variación vs mes anterior | `((mes_actual - mes_anterior) / mes_anterior) × 100` |

#### 5.2 Filtros
- Selector de mes (navegación temporal)
- Filtro por categoría de ingreso
- Botón "Limpiar filtros"

#### 5.3 Tabla de ingresos
**Columnas:**
- Fecha
- Concepto (nombre descriptivo)
- Categoría
- Importe
- % sobre total (calculado automáticamente)
- Importe anual equivalente (calculado: `importe × 12` si es recurrente, o importe exacto)
- Notas/comentarios
- Acciones (editar, eliminar)

**Comportamiento:**
- Filas ordenadas por fecha descendente
- Paginación
- Hover → muestra botón de edición

#### 5.4 Añadir / Editar Ingreso (Modal)
**Campos:**
| Campo | Tipo | Detalle |
|---|---|---|
| Concepto | text | Ej: "Nómina enero", "Proyecto X" |
| Categoría | select | Ver categorías más abajo |
| Importe | number | Importe bruto en la moneda configurada |
| Fecha | date | Por defecto: hoy |
| Es recurrente | toggle | Sí = se repite mensualmente |
| Notas | textarea | Comentario libre |

**Categorías de ingresos predefinidas:**
1. Salario / Nómina
2. Freelance / Autónomo
3. Alquileres
4. Dividendos / Inversiones
5. Pensiones / Prestaciones
6. Ventas / Segunda mano
7. Bonificaciones / Extras
8. Regalos / Herencias
9. Ingresos ocasionales (otros)

#### 5.5 Cálculos automáticos
- `total_ingresos_mes` = suma de todos los importes del mes
- `total_ingresos_año` = suma de todos los importes del año
- `% por categoría` = `(importe_categoria / total_ingresos_mes) × 100`
- `% por concepto` = `(importe_concepto / total_ingresos_mes) × 100`

### Conexión con otros módulos
- → **Dashboard:** alimenta KPI "Ingresos del mes" y gráfica de flujo de caja
- → **Seguimiento:** se compara con el "ingreso previsto" del presupuesto
- → **Regla 50/30/20:** el `total_ingresos_mes` es la base para calcular los 3 bloques
- → **Objetivos:** el ingreso disponible informa el ahorro mensual posible

---

## 6. Módulo: Gestión de Gastos

### Descripción
Registro detallado de todos los gastos. Es el módulo más rico en categorización. Alimenta el Dashboard, el Seguimiento y la Regla 50/30/20.

### Pantalla: `/gastos`

#### 6.1 Cards resumen (automáticas)
| Card | Cálculo |
|---|---|
| Total gastos del mes | Suma de gastos del mes |
| % del presupuesto usado | `(total_real / total_presupuesto) × 100` |
| Mayor categoría de gasto | Categoría con más gasto en el mes |
| Variación vs mes anterior | Delta porcentual |

#### 6.2 Filtros
- Selector de mes
- Filtro por categoría principal
- Filtro por subcategoría
- Botón "Limpiar filtros"

#### 6.3 Tabla de gastos
**Columnas:**
- Fecha
- Concepto
- Categoría / Subcategoría
- Importe
- % sobre total del mes (calculado)
- Importe anual equivalente
- Notas
- Acciones (editar, eliminar)

#### 6.4 Añadir / Editar Gasto (Modal)
**Campos:**
| Campo | Tipo | Detalle |
|---|---|---|
| Concepto | text | Ej: "Alquiler piso", "Supermercado Mercadona" |
| Categoría | select | Ver árbol de categorías |
| Subcategoría | select | Filtrada según categoría elegida |
| Importe | number | Importe real gastado |
| Fecha | date | Por defecto: hoy |
| Es recurrente | toggle | Se repite mensualmente |
| Notas | textarea | Comentario libre |

#### 6.5 Árbol de Categorías y Subcategorías de Gastos

La app incluye **9 categorías principales** y **más de 40 subcategorías predefinidas**. El usuario puede añadir las suyas propias desde Configuración.

| # | Categoría | Subcategorías predefinidas |
|---|---|---|
| 1 | **Vivienda** | Alquiler / Hipoteca, Comunidad, Seguro hogar, Agua, Luz, Gas, Internet, Teléfono fijo, Mantenimiento |
| 2 | **Alimentación** | Supermercado, Mercado / Frutería, Restaurantes, Cafeterías / Bares, Comida a domicilio |
| 3 | **Transporte** | Gasolina, Seguro vehículo, ITV / Mantenimiento coche, Transporte público, Taxi / VTC, Parking |
| 4 | **Salud** | Médico / Consultas, Farmacia, Seguro médico privado, Dentista, Óptica, Gimnasio / Deporte |
| 5 | **Entretenimiento** | Cine / Teatro, Suscripciones streaming, Videojuegos, Salidas / Ocio, Viajes / Vacaciones, Hobbies |
| 6 | **Educación** | Formación / Cursos, Libros / Material, Colegios / Universidad, Idiomas |
| 7 | **Ropa y Personal** | Ropa / Calzado, Peluquería / Estética, Higiene personal, Complementos |
| 8 | **Tecnología** | Software / Suscripciones, Hardware / Dispositivos, Servicios cloud, Dominio / Hosting |
| 9 | **Otros** | Regalos, Impuestos / Tasas, Seguros varios, Donaciones, Gastos imprevistos |

#### 6.6 Cálculos automáticos
- `total_gastos_mes` = suma de todos los gastos del mes
- `total_gastos_año` = suma anual
- `% por categoría` = `(total_categoria / total_gastos_mes) × 100`
- `% por subcategoría` = `(total_subcategoria / total_gastos_mes) × 100`
- `% sobre presupuesto` = `(total_real / presupuesto_categoria) × 100` (si hay presupuesto definido)

### Conexión con otros módulos
- → **Dashboard:** alimenta KPI "Gastos del mes", donut de distribución, flujo de caja
- → **Seguimiento:** se compara con el presupuesto previsto por categoría
- → **Regla 50/30/20:** los gastos se clasifican en Necesidades o Deseos automáticamente según categoría
- → **Presupuesto:** proporciona los datos reales para comparar con lo presupuestado

---

## 7. Módulo: Presupuesto Mensual

### Descripción
El usuario define una **plantilla base** con sus importes presupuestados por categoría. Esta plantilla es reutilizable para todos los meses del año. Se puede ajustar por mes si fuera necesario.

### Pantalla: `/presupuesto`

#### 7.1 Concepto de Plantilla Base
- El usuario configura su presupuesto una sola vez (en la primera sesión o desde Configuración)
- La plantilla aplica a todos los meses del año por defecto
- Se puede sobrescribir el presupuesto de un mes concreto sin afectar a la plantilla base
- Si no hay presupuesto configurado para un mes, el sistema usa la plantilla base

#### 7.2 Estructura del presupuesto

**Ingresos presupuestados:**
- Por categoría de ingreso (mismas categorías del módulo 5)
- Importe mensual esperado para cada categoría

**Gastos presupuestados:**
- Por categoría principal de gasto (mismas 9 categorías del módulo 6)
- Opcionalmente por subcategoría (nivel de detalle avanzado)
- Importe mensual máximo para cada categoría

**Totales calculados automáticamente:**
| Campo | Cálculo |
|---|---|
| Total ingresos presupuestados | Suma de todos los ingresos previstos |
| Total gastos presupuestados | Suma de todos los gastos previstos |
| Ahorro presupuestado | `ingresos_presupuestados - gastos_presupuestados` |
| % ahorro presupuestado | `(ahorro_presupuestado / ingresos_presupuestados) × 100` |

#### 7.3 Interfaz de edición
- Tabla editable por categoría: cada fila tiene un campo numérico para introducir el importe previsto
- Zonas de datos separadas: tabla de ingresos + tabla de gastos
- Resumen automático al pie de cada tabla
- Botón "Guardar como plantilla base" → aplica para todos los meses futuros
- Botón "Guardar solo para este mes" → sobrescribe solo el mes activo

#### 7.4 Selector de mes
- Permite ver y editar el presupuesto de cualquier mes del año
- Indicador visual si el mes usa la plantilla base o tiene un presupuesto personalizado

### Conexión con otros módulos
- → **Seguimiento:** el presupuesto es la referencia para calcular desviaciones (previsto vs real)
- → **Dashboard:** el % de presupuesto usado aparece en las cards de gastos
- → **Regla 50/30/20:** el presupuesto por categoría alimenta la comparativa de la regla
- ← **Configuración:** la plantilla base se puede gestionar también desde Configuración

---

## 8. Módulo: Seguimiento Real vs Presupuesto

### Descripción
Comparativa mes a mes entre lo que el usuario presupuestó y lo que realmente ha ingresado/gastado. Es el módulo de control y auditoría financiera.

### Pantalla: `/seguimiento`

#### 8.1 Selector de mes
- Por defecto: mes actual
- Permite navegar entre los 12 meses del año
- Opción "Vista anual" para ver los 12 meses de golpe (versión reducida)

#### 8.2 KPIs de cabecera (3 cards)
| Card | Valor | Fuente |
|---|---|---|
| Total Previsto | Presupuesto del mes activo | Módulo Presupuesto |
| Total Real | Suma de ingresos − gastos reales | Módulos Ingresos + Gastos |
| Diferencia / Desviación | `previsto - real` | Automático |

La card de Diferencia muestra:
- Verde si `real < previsto` (gasto) o `real > previsto` (ingreso)
- Rojo si se supera el presupuesto o ingresa menos de lo previsto

#### 8.3 Tabla comparativa por categoría

**Columnas:**
| Columna | Fuente | Tipo |
|---|---|---|
| Categoría | Configuración | Texto |
| Previsto | Módulo Presupuesto | Dato manual |
| Real | Módulo Gastos/Ingresos | Calculado automáticamente |
| Progreso | Automático | Barra visual (%) |
| Diferencia | Automático | `previsto - real` |

**Lógica de color de la barra de progreso:**
| % utilizado | Color | Estado |
|---|---|---|
| 0–79% | Verde (`secondary`) | Bien |
| 80–99% | Azul navy (`primary`) | Atención |
| 100% | Verde exacto (`secondary`) | Objetivo exacto |
| >100% | Rojo (`error`) | Sobre el presupuesto |

**Secciones de la tabla:**
1. Tabla de **Ingresos** (previsto vs real por categoría)
2. Tabla de **Gastos** (previsto vs real por categoría)
3. Fila de **TOTALES** al pie de cada sección
4. **Resumen final:** ahorro previsto vs ahorro real + % de ahorro

#### 8.4 Seguimiento mensual completo (los 12 meses)
- Mini-tabla de los 12 meses del año con columnas: Mes | Ingresos | Gastos | Ahorro | % Ahorro
- Valores futuros mostrados en gris (proyectados desde el presupuesto)
- Valores pasados y actual con datos reales

#### 8.5 Sección de Insights automáticos
Detecta automáticamente:
- Categorías que han superado el presupuesto → alerta roja con importe de desviación
- Categorías con ahorro respecto al presupuesto → highlight verde con sugerencia de transferir al ahorro
- Mensaje de análisis global del mes

### Conexión con otros módulos
- Lee de: **Presupuesto** (datos previstos), **Ingresos** y **Gastos** (datos reales)
- → **Objetivos:** sugiere transferir el ahorro detectado a un objetivo específico
- → **Dashboard:** alimenta el resumen anual del dashboard

---

## 9. Módulo: Objetivos de Ahorro

### Descripción
El usuario puede definir hasta **5 metas de ahorro** personales. La app calcula el progreso y el tiempo estimado para alcanzarlas.

### Pantalla: `/objetivos` (sección superior)

#### 9.1 Listado de objetivos
- Grid de cards (máximo 5)
- Cada card muestra:
  - Nombre del objetivo
  - Icono / emoji representativo
  - Importe actual acumulado
  - Importe meta (objetivo final)
  - Porcentaje completado (barra de progreso)
  - Fecha límite (si se ha definido) o meses restantes estimados
  - Importe aportado este mes
  - Importe restante para completar la meta

#### 9.2 Crear / Editar Objetivo (Modal)
**Campos:**
| Campo | Tipo | Detalle |
|---|---|---|
| Nombre | text | Ej: "Fondo de emergencia", "Viaje a Japón" |
| Icono | selector | Listado de iconos predefinidos (Material Icons) |
| Coste estimado / Meta | number | Importe total a alcanzar |
| Ahorro mensual asignado | number | Cuánto destina el usuario cada mes a este objetivo |
| Ahorro actual acumulado | number | Importe ya ahorrado al crear el objetivo |
| Fecha límite | date | Opcional; si se deja vacío, se calcula automáticamente |
| Notas | textarea | Descripción o motivación |

#### 9.3 Cálculos automáticos por objetivo
| Campo calculado | Fórmula |
|---|---|
| Importe restante | `meta - acumulado_actual` |
| Meses necesarios | `ceil(importe_restante / ahorro_mensual)` |
| Fecha estimada fin | `fecha_hoy + meses_necesarios` |
| % completado | `(acumulado_actual / meta) × 100` |

Si se define una fecha límite:
- `ahorro_mensual_necesario` = `importe_restante / meses_hasta_fecha_limite`
- Alerta si el ahorro mensual asignado es insuficiente para cumplir la fecha

#### 9.4 Aportación mensual
- El usuario puede registrar aportaciones al objetivo directamente desde la card
- Cada aportación suma al `acumulado_actual` del objetivo
- La aportación se refleja también como gasto de categoría "Ahorro" en el módulo de gastos

#### 9.5 Casos de uso tipicos incluidos como sugerencias
Al crear un objetivo, se puede elegir una plantilla:
- Fondo de emergencia (3–6 meses de gastos)
- Vacaciones / Viaje
- Coche / Vehículo
- Vivienda / Entrada piso
- Formación / Educación
- Inversión inicial
- Otro (personalizado)

### Conexión con otros módulos
- ← **Gastos:** las aportaciones se registran como un gasto de tipo "Ahorro"
- ← **Dashboard:** el dashboard muestra un preview de los 3 objetivos con mayor progreso
- ← **Seguimiento:** cuando hay ahorro del mes, el sistema sugiere asignarlo a un objetivo
- ← **Regla 50/30/20:** el bloque "20% Ahorro" refleja las aportaciones a objetivos

---

## 10. Módulo: Regla 50/30/20

### Descripción
Herramienta educativa y de control integrada en la app. Calcula automáticamente cómo está distribuyendo el usuario sus ingresos respecto al modelo ideal 50/30/20 y detecta desviaciones.

### Pantalla: `/objetivos` (sección inferior, misma página que Objetivos)

#### 10.1 Definición de bloques

| Bloque | % Ideal | Incluye |
|---|---|---|
| Necesidades | 50% | Vivienda, Alimentación, Transporte, Salud, seguros básicos |
| Deseos | 30% | Entretenimiento, Ropa, Tecnología, Educación no obligatoria, Ocio |
| Ahorro / Inversión | 20% | Aportaciones a objetivos, fondo de emergencia, inversiones |

La clasificación de cada categoría de gasto en uno de los 3 bloques está predefinida pero el usuario puede reasignarla desde Configuración.

#### 10.2 Cálculos automáticos
| Campo | Fórmula |
|---|---|
| Importe ideal Necesidades | `ingresos_mes × 0.50` |
| Importe ideal Deseos | `ingresos_mes × 0.30` |
| Importe ideal Ahorro | `ingresos_mes × 0.20` |
| Importe real Necesidades | Suma de gastos de categorías clasificadas como Necesidades |
| Importe real Deseos | Suma de gastos de categorías clasificadas como Deseos |
| Importe real Ahorro | Suma de aportaciones a objetivos del mes |
| % real Necesidades | `(real_necesidades / ingresos_mes) × 100` |
| % real Deseos | `(real_deseos / ingresos_mes) × 100` |
| % real Ahorro | `(real_ahorro / ingresos_mes) × 100` |
| Desviación por bloque | `% real - % ideal` |

#### 10.3 Visualización
- 3 barras horizontales animadas (una por bloque)
- Cada barra muestra: % real vs % ideal con marcador
- Color del indicador:
  - Verde: dentro del rango ideal (±3%)
  - Amarillo: desviación leve (±3-8%)
  - Rojo: desviación importante (>8%)
- Insight box con análisis textual automático

#### 10.4 Panel lateral
- **Saldo proyectado:** cuánto podría ahorrar si ajustara al 50/30/20 ideal
- **Comparativa mensual:** evolución de los 3 porcentajes en los últimos meses
- Botón "Reajustar presupuesto" → navega a `/presupuesto` con sugerencias pre-cargadas

#### 10.5 Análisis automático de texto
La app genera un insight personalizado como:
> "Estás gastando un 6% extra en Deseos. Si reduces las suscripciones este mes, alcanzarías tu meta de ahorro del 20% sin tocar tus necesidades básicas."

### Conexión con otros módulos
- ← **Ingresos:** base para calcular los 3 importes ideales
- ← **Gastos:** fuente de los importes reales de Necesidades y Deseos
- ← **Objetivos:** las aportaciones alimentan el bloque "Ahorro"
- → **Presupuesto:** el botón "Reajustar" lleva al usuario a revisar su presupuesto
- → **Dashboard:** mini-panel de la regla 50/30/20 visible en el dashboard

---

## 11. Módulo: Exportación (.xlsx)

### Descripción
El usuario puede descargar sus datos financieros en formato Excel (.xlsx) desde cualquier pantalla con datos tabulares.

### Funcionalidades
- Exportar desde **Gestión de Ingresos:** todos los ingresos del mes seleccionado o del año
- Exportar desde **Gestión de Gastos:** todos los gastos del mes o del año
- Exportar desde **Seguimiento:** comparativa previsto vs real por mes
- Exportar desde **Dashboard:** resumen anual completo (todas las hojas en un solo archivo)

### Formato del archivo exportado
El archivo `.xlsx` tendrá múltiples hojas según el tipo de exportación:

**Exportación completa (desde Dashboard):**
- Hoja 1: Resumen Anual (KPIs por mes)
- Hoja 2: Ingresos detallados
- Hoja 3: Gastos detallados
- Hoja 4: Presupuesto vs Real
- Hoja 5: Objetivos de ahorro

**Exportación individual (desde cada módulo):**
- Una sola hoja con los datos de ese módulo

### Librería
- `xlsx` (SheetJS) — librería JavaScript para generar archivos .xlsx sin backend

### Conexión con otros módulos
- Accede a los datos de: Ingresos, Gastos, Presupuesto, Objetivos
- No modifica ningún dato — es solo de lectura

---

## 12. Módulo: Configuración

### Pantalla: `/configuracion`

El módulo de configuración se divide en 4 secciones accesibles por pestañas.

---

### 12.1 Perfil de Usuario
| Campo | Tipo | Detalle |
|---|---|---|
| Nombre | text | Nombre visible en el sidebar |
| Email | text | Solo lectura (viene del auth) |
| Foto de perfil | image upload | Avatar circular |
| Contraseña | button | Abre modal para cambiar contraseña |
| Cerrar sesión | button | Cierra la sesión activa |
| Eliminar cuenta | button peligroso | Borra todos los datos del usuario (con confirmación) |

---

### 12.2 Moneda y Formato
| Campo | Tipo | Opciones |
|---|---|---|
| Moneda | select | EUR (€), USD ($), GBP (£), MXN, ARS, COP, CLP, PEN, otras |
| Símbolo | radio | Antes del número ($100) o después (100€) |
| Separador decimal | radio | Coma (1.234,56) o Punto (1,234.56) |
| Formato de fecha | select | DD/MM/AAAA, MM/DD/AAAA, AAAA-MM-DD |

Los cambios aplican a todos los importes mostrados en la app de forma inmediata.

---

### 12.3 Gestión de Categorías
Permite al usuario personalizar el árbol de categorías.

**Ingresos:**
- Ver listado de categorías predefinidas
- Añadir categoría personalizada
- Renombrar categorías existentes
- Desactivar (ocultar) categorías que no usa
- No se pueden eliminar categorías que ya tienen datos asociados

**Gastos:**
- Ver las 9 categorías principales y sus subcategorías
- Añadir subcategorías personalizadas dentro de una categoría existente
- Añadir categorías principales nuevas
- Renombrar existentes
- Desactivar categorías sin datos

**Clasificación 50/30/20:**
- Para cada categoría de gasto: selector para asignarla a Necesidades, Deseos o Ahorro
- Las clasificaciones predefinidas se pueden cambiar aquí

---

### 12.4 Apariencia
| Campo | Tipo | Opciones |
|---|---|---|
| Tema | toggle | Claro / Oscuro |
| Modo oscuro automático | toggle | Seguir preferencia del sistema operativo |

### Conexión con otros módulos
- Los cambios de moneda afectan a todos los módulos inmediatamente
- Las categorías creadas aquí aparecen en los formularios de Ingresos y Gastos
- La clasificación 50/30/20 de categorías afecta directamente al módulo Regla 50/30/20
- El tema claro/oscuro aplica al sistema de diseño completo

---

## 13. Motor de Cálculos Automáticos

Este es el núcleo de la app. El usuario **nunca** calcula nada a mano.

### Cálculos en tiempo real (al guardar un dato)
| Evento | Cálculo desencadenado |
|---|---|
| Añadir ingreso | Actualiza: total_ingresos_mes, % por categoría, KPIs dashboard, Regla 50/30/20 |
| Añadir gasto | Actualiza: total_gastos_mes, % por categoría, ahorro_mes, Seguimiento, Regla 50/30/20 |
| Modificar presupuesto | Actualiza: desviaciones en Seguimiento, sugerencias en Regla 50/30/20 |
| Añadir aportación a objetivo | Actualiza: % completado del objetivo, bloque Ahorro en Regla 50/30/20 |
| Cambiar mes en dashboard | Recalcula todos los KPIs para el nuevo mes |

### Campos que el usuario NUNCA toca (siempre calculados)
- Totales (mes, año)
- Porcentajes (por categoría, sobre total, de ahorro)
- Desviaciones (previsto vs real)
- Meses restantes para objetivos
- Fechas estimadas de fin de objetivo
- Bloques de la regla 50/30/20
- Insights y análisis de texto
- Comparativas con mes anterior
- Barras de progreso

---

## 14. Mapa de Conexiones entre Módulos

```
┌─────────────────────────────────────────────────────────┐
│                     FUENTES DE DATOS                     │
│  ┌───────────┐   ┌───────────┐   ┌──────────────────┐   │
│  │ INGRESOS  │   │  GASTOS   │   │   PRESUPUESTO    │   │
│  │  (manual) │   │  (manual) │   │    (manual/base) │   │
│  └─────┬─────┘   └─────┬─────┘   └────────┬─────────┘   │
└────────┼───────────────┼──────────────────┼─────────────┘
         │               │                  │
         ▼               ▼                  ▼
┌────────────────────────────────────────────────────────┐
│                   MOTOR DE CÁLCULOS                     │
│  totales · porcentajes · desviaciones · proyecciones    │
└──────┬────────────┬────────────┬──────────┬────────────┘
       │            │            │          │
       ▼            ▼            ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│DASHBOARD │ │SEGUIMIEN.│ │50/30/20  │ │OBJETIVOS │
│(lectura) │ │(lectura) │ │(lectura) │ │(lectura+ │
│          │ │          │ │          │ │aportac.) │
└──────────┘ └────┬─────┘ └────┬─────┘ └──────────┘
                  │             │
                  ▼             ▼
            [INSIGHTS]   [REAJUSTE PRESUPUESTO]
```

### Tabla de dependencias
| Módulo | Lee de | Escribe en |
|---|---|---|
| Dashboard | Ingresos, Gastos, Presupuesto, Objetivos | — |
| Ingresos | — | ingresos (tabla) |
| Gastos | — | gastos (tabla) |
| Presupuesto | — | presupuesto (tabla) |
| Seguimiento | Ingresos, Gastos, Presupuesto | — |
| Objetivos | Gastos (aportaciones) | objetivos (tabla), gastos (tabla) |
| Regla 50/30/20 | Ingresos, Gastos, Objetivos | — |
| Exportación | Ingresos, Gastos, Presupuesto, Objetivos | archivo .xlsx (descarga) |
| Configuración | categorias, usuario | categorias, preferencias_usuario |

---

## 15. Modelo de Datos

### Entidades principales

#### `users` (gestionado por Supabase Auth)
```
id              uuid (PK)
email           text
name            text
avatar_url      text
created_at      timestamp
```

#### `user_preferences`
```
id              uuid (PK)
user_id         uuid (FK → users)
currency        text          -- 'EUR', 'USD', etc.
currency_symbol text          -- '€', '$'
symbol_position text          -- 'before' | 'after'
decimal_format  text          -- 'comma' | 'dot'
date_format     text          -- 'DD/MM/YYYY', etc.
theme           text          -- 'light' | 'dark' | 'system'
```

#### `categories`
```
id              uuid (PK)
user_id         uuid (FK → users)
type            text          -- 'income' | 'expense'
name            text
parent_id       uuid (FK → categories, nullable)  -- para subcategorías
rule_block      text          -- 'needs' | 'wants' | 'savings' (solo gastos)
is_default      boolean       -- categorías predefinidas del sistema
is_active       boolean
sort_order      integer
```

#### `income_entries`
```
id              uuid (PK)
user_id         uuid (FK → users)
category_id     uuid (FK → categories)
concept         text
amount          numeric(12,2)
date            date
is_recurring    boolean
notes           text
created_at      timestamp
updated_at      timestamp
```

#### `expense_entries`
```
id              uuid (PK)
user_id         uuid (FK → users)
category_id     uuid (FK → categories)
subcategory_id  uuid (FK → categories, nullable)
concept         text
amount          numeric(12,2)
date            date
is_recurring    boolean
notes           text
created_at      timestamp
updated_at      timestamp
```

#### `budget_templates` (plantilla base reutilizable)
```
id              uuid (PK)
user_id         uuid (FK → users)
category_id     uuid (FK → categories)
amount          numeric(12,2)
type            text          -- 'income' | 'expense'
is_default      boolean       -- si es la plantilla base
```

#### `monthly_budgets` (presupuesto de un mes concreto, sobreescribe la plantilla)
```
id              uuid (PK)
user_id         uuid (FK → users)
category_id     uuid (FK → categories)
year            integer
month           integer       -- 1-12
amount          numeric(12,2)
type            text
```

#### `saving_goals`
```
id              uuid (PK)
user_id         uuid (FK → users)
name            text
icon            text          -- nombre del Material Icon
target_amount   numeric(12,2)
current_amount  numeric(12,2)
monthly_savings numeric(12,2)
target_date     date (nullable)
notes           text
sort_order      integer       -- max 5
is_active       boolean
created_at      timestamp
```

#### `goal_contributions` (aportaciones mensuales a objetivos)
```
id              uuid (PK)
goal_id         uuid (FK → saving_goals)
user_id         uuid (FK → users)
amount          numeric(12,2)
date            date
notes           text
```

---

## Notas de Priorización

### MVP (Primera versión funcional)
1. Autenticación (Google + email)
2. Gestión de Ingresos
3. Gestión de Gastos
4. Dashboard básico (KPIs + totales)
5. Configuración básica (moneda + perfil)

### V2
6. Presupuesto mensual
7. Seguimiento Real vs Presupuesto
8. Regla 50/30/20

### V3
9. Objetivos de Ahorro
10. Exportación .xlsx
11. Configuración avanzada (categorías, apariencia)
