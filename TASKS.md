# Tasks Pendientes

## Índice

1. [Movimientos - Bugs](#movimientos-bugs)
2. [Movimientos - Funcionalidad](#movimientos-funcionalidad)
3. [Presupuestos](#presupuestos)
4. [Seguimiento y Regla 50/30/20](#seguimiento-y-regla-503020)
5. [Configuración](#configuración)
6. [General](#general)

### LEYENDA

#### ✅ COMPLETADOS

#### ❌ PENDIENTES

#### ⚠️ EN PROGRESO

---

## Movimientos - Bugs

**5. Bug: Dropdown de categorías se rompe al cambiar tipo de movimiento**

- Al seleccionar una categoría (ej: "Alimentación") y cambiar de Ingreso a Gasto (o viceversa), el dropdown deja de funcionar
- El valor anterior queda pillado y no permite seleccionar otra categoría
- Frecuencia: siempre que se cambia el tipo con una categoría seleccionada

**6. Buscador: búsqueda sin acentos ni mayúsculas/minúsculas**

- Actualmente distingue mayúsculas/minúsculas y acentos (ej: "café" no encuentra "cafe")
- Necesidad: normalizar texto antes de buscar para que coincida cualquier variant

---

## Movimientos - Funcionalidad

**7. Añadir selector de frecuencia recurrente**

- En el modal de movimiento, añadir campo de recurrencia
- Opciones: semanal, quincenal, mensual, bimensual, trimestral, anual
- Al guardar, crear automáticamente las entradas para meses futuros
- Estado: ✅ Implementado el selector y creación inicial, ❌ faltan pruebas de verificación

**8. Replicar recurrentes de meses anteriores al cargar**

- Al cargar la página de Ingresos/Gastos, verificar si hay movimientos recurrentes creados en meses anteriores que no se han generado todavía
- Si existe un movimiento recurrente creado en marzo 2025 y estamos en abril 2026, generar automáticamente las entradas desde la fecha de creación hasta el mes actual
- Esto aplica al cargar datos, no solo al crear nuevos

**9. Botón "Mes actual" en el selector de meses**

- Añadir un botón de acceso rápido junto al MonthSelector
- Al hacer clic, vuelve al mes y año actuales

**10. Sistema de auto-actualización de recurrentes (Documentación)**

- Documentar cómo funciona la lógica de recurrentes
- Verificar que se generan correctamente al crear y al cargar la página

---

## Presupuestos

**11. La página de presupuestos no muestra nada**

- Al acceder a /presupuesto, la pantalla aparece vacía o sin datos
- Hay que verificar que los componentes BudgetTable, BudgetSummary cargan correctamente
- Mostrar: límite de gasto por categoría, gasto actual, diferencia
- Incluir barra de progreso visual (semáforo: verde <80%, navy 80-99%, rojo >=100%)

---

## Seguimiento y Regla 50/30/20

### Seguimiento mensual

**12. El seguimiento mensual no hace nada**

- La página /seguimiento está vacía o inactiva
- Debe mostrar: comparación presupuesto vs gasto real por categoría
- Calcular desviación (diferencia entre previsto y real)
- Mostrar insights automáticos: "Has gastado un 20% más en Alimentación este mes"
- Resumen ejecutivo: total presupuesto, total gastado, disponible restante

### Regla del 50/30/20

**13. La regla del 50/30/20 no hace nada**

- La página /objetivos (que incluye la regla 50/30/20) está vacía
- Implementar análisis automático de gastos:
  - 50% Necesidades (casa, transporte, alimentación, servicios)
  - 30% Deseos (ocio, entretenimiento, suscripciones)
  - 20% Ahorro e inversión
- Mostrar gráfico circular con la distribución actual
- Comparar con la regla ideal y mostrar desviaciones
- Recomendaciones automáticas según el análisis

---

## Configuración

**14. Las categorías no cargan**

- En la página de configuración > pestaña Categorías, el listado no se muestra
- Revisar la consulta a la colección "categories" de Firebase
- Verificar que se están trayendo las categorías del usuario actual

**15. El modo oscuro está mal implementado**

- El toggle de dark/light mode no funciona correctamente
- Los colores no cambian o se ven mal en uno de los modos
- Revisar la implementación de next-themes y los tokens CSS de dark mode

**16. Mejorar el aspecto visual de configuración**

- La página se ve básica o desproporcionada
- Mejorar spacing, tipografía y layout
- Organizar las opciones en secciones claras
- Añadir iconos descriptivos para cada setting

---

## General

**17. Revisar el responsive en todas las páginas**

- Testing completo en móvil (375px), tablet (768px) y desktop (1440px)
- Revisar: menús, tablas, botones, modales, formularios
- Asegurar que no hay elementos que se desborden
- Verificar touch targets en móvil (mínimo 44px)
- Comprobar que la navegación sea funcional en todas las tamaños
