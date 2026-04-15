# Tasks Pendientes

## Índice
1. [Movimientos](#movimientos)
2. [Presupuestos](#presupuestos)
3. [Seguimiento y Regla 50/30/20](#seguimiento-y-regla-503020)
4. [Configuración](#configuración)
5. [General](#general)

---

## Movimientos

### Bugs Críticos

**1. Buscador de movimientos no funciona** ✅
- El buscador aparece en todas las páginas cuando solo debería estar en Ingresos y Gastos
- Además, aunque está visible, no filtra los resultados al escribir
- Hay que condicionar su visibilidad y hacer que funcione el filtrado por descripción

**2. No se actualiza el listado al añadir movimiento desde el botón general** ✅
- Al hacer clic en el botón "Añadir movimiento" del sidebar, se abre el modal
- Después de guardar, el listado de la página actual (Ingresos o Gastos) no se actualiza automáticamente
- Hay que forzar un refresh o refetch de los datos después de cerrar el modal

**3. La categoría muestra una clave string en lugar del nombre** ✅
- En el formulario de añadir/editar movimiento, al seleccionar una categoría del dropdown
- En lugar de mostrar el nombre legible (ej: "Alimentación"), cuando se selecciona alguno muestra una clave técnica (ej: "NoHGYDDTFYxSrgoFaZrS")
- Hay que mostrar el campo `name` de la categoría, no el `id` o clave interna

**4. Editar movimientos** ✅
- Actualmente no existe funcionalidad para modificar un movimiento existente
- Hay que añadir un botón de editar en cada fila de la tabla
- Al hacer clic, debe abrir el mismo modal que para añadir, pero con los datos precargados
- Debe permitir modificar todos los campos excepto la fecha de creación

### Funcionalidad Faltante

**5. Movimientos recurrentes** ✅
- Los usuarios pueden tener ingresos/gastos que se repiten automáticamente
- Necesidad: añadir un campo de "recurrencia" en el modal de movimiento
- Opciones: único, semanal, quincenal, mensual, bimensual, trimestral, anual
- Al guardar, si es recurrente, crear automáticamente las entradas para los meses futuros
- Mostrar un indicador visual en la tabla para saber qué movimientos son recurrentes

**6. Replicar ingresos recurrentes de meses anteriores** ✅
- Si se crea un ingreso recurrente en un mes anterior (ej: marzo 2025) y estamos en abril 2026
- El sistema debe generar automáticamente las entradas desde la fecha de creación hasta el mes actual
- Esto aplica tanto al crear nuevos como al cargar la página (verificar si hay recurrentes pendientes de generar)

---

## Presupuestos

**7. La página de presupuestos no muestra nada** ✅
- Al acceder a /presupuesto, la pantalla aparece vacía o sin datos
- Hay que implementar la vista de presupuestos mensuales
- Mostrar: límite de gasto por categoría, gasto actual, diferencia
- Permitir crear/editar presupuestos para cada mes
- Incluir barra de progreso visual (semáforo: verde <80%, navy 80-99%, rojo >=100%)

---

## Seguimiento y Regla 50/30/20

### Seguimiento mensual

**8. El seguimiento mensual no hace nada** ✅
- La página de /seguimiento está vacía o inactiva
- Necesita mostrar: comparación presupuesto vs gasto real por categoría
- Calcular desviación (diferencia entre previsto y real)
- Mostrar insights automáticos: "Has gastado un 20% más en Alimentación este mes"
- Resumen ejecutivo: total presupuesto, total gastado, disponible restante

### Regla del 50/30/20

**9. La regla del 50/30/20 no hace nada** ✅
- La página de /objetivos (que incluye la regla 50/30/20) está vacía
- Implementar análisis automático de gastos:
  - 50% Necesidades (casa, transporte, alimentación, servicios)
  - 30% Deseos (ocio, entretenimiento, suscripciones)
  - 20% Ahorro e inversión
- Mostrar gráfico circular con la distribución actual
- Comparar con la regla ideal y mostrar desviaciones
- Recomendaciones automáticas según el análisis

---

## Configuración

**10. Las categorías no cargan** ✅
- En la página de configuración, el listado de categorías no se muestra
- Error probably related to Supabase query or data fetching
- Revisar la consulta a la tabla `categories` y el RLS policies
- Verificar que se están trayendo las categorías del usuario actual

**11. El modo oscuro está mal implementado** ✅
- El toggle de dark/light mode no funciona correctamente
- Los colores no cambian o se ven mal en uno de los modos
- Revisar la implementación de next-themes
- Verificar que todos los componentes respetan el tema
- Asegurar transición suave entre modos

**12. Mejorar el aspecto visual de configuración** ✅
- La página se ve básica o desproporcionada
- Mejorar spacing, tipografía y layout
- Organizar las opciones en secciones claras
- Añadir iconos descriptivos para cada setting

---

## General

**13. Revisar el responsive en todas las páginas** ✅
- Testing completo en móvil (375px), tablet (768px) y desktop (1440px)
- Revisar: menús, tablas, botones, modales, formularios
- Asegurar que no hay elementos que se desborden
- Verificar touch targets en móvil (mínimo 44px)
- Comprobar que la navegación sea funcional en todas las tamaños