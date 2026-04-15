# Control Financiero

Aplicación web para gestión de finanzas personales. Permite registrar ingresos y gastos, ver KPIs mensuales en un dashboard y configurar preferencias de moneda y perfil.

## Stack

- **Next.js 16** — App Router, Server Components, proxy (middleware)
- **TypeScript**
- **Tailwind CSS v4** — tokens de diseño en `@theme inline` (sin `tailwind.config.ts`)
- **shadcn/ui** — componentes base
- **Firebase** — Auth (email/password + Google), Firestore
- **firebase-admin** — verificación de sesión server-side
- **react-hook-form + zod** — validación de formularios
- **sonner** — toasts

## Estructura

```
src/
├── app/
│   ├── (auth)/          # /login, /registro — sin layout de dashboard
│   ├── (dashboard)/     # rutas privadas con Sidebar + TopNavBar
│   │   ├── dashboard/
│   │   ├── ingresos/
│   │   ├── gastos/
│   │   └── configuracion/
│   └── api/auth/session/ # crea/elimina la cookie de sesión
├── components/
│   ├── auth/
│   ├── layout/          # Sidebar, TopNavBar, NavItem
│   ├── movements/       # MovementModal, MovementsTable
│   └── shared/          # KPICard, MonthSelector, ProgressBar, CategoryBadge
├── hooks/               # useIngresos, useGastos, useUserPreferences, useCategories
├── lib/
│   ├── calculations/    # funciones puras: totales, variaciones, KPIs
│   ├── firebase/        # client.ts, server.ts (admin), session.ts
│   └── utils/           # formatCurrency, formatDate, cn
└── proxy.ts             # protección de rutas (reemplaza middleware en Next 16)
```

## Modelo de datos (Firestore)

Toda la información del usuario vive bajo `/users/{userId}/`:

```
/users/{userId}/preferences/main       → preferencias (moneda, formato, tema)
/users/{userId}/categories/{id}        → categorías y subcategorías (árbol plano con parent_id)
/users/{userId}/income_entries/{id}    → ingresos
/users/{userId}/expense_entries/{id}   → gastos
```

Las reglas de seguridad están en `firestore.rules`. Cada usuario solo puede leer y escribir bajo su propio `userId`.

Al registrarse, `initUserData()` crea las preferencias por defecto y clona las categorías predefinidas (9 de ingresos + 9 de gastos con subcategorías).

## Sesión

El flujo de autenticación es:

1. Login/registro via Firebase Auth (cliente)
2. `getIdToken()` → POST `/api/auth/session` → `admin.createSessionCookie()` → cookie httpOnly `__session`
3. El proxy verifica la existencia de `__session` en cada request y redirige si no hay sesión
4. Los Server Components usan `getServerUser()` (admin SDK) para leer el usuario

El token de sesión dura 5 días. Al cerrar sesión se elimina tanto el estado de Firebase Auth como la cookie.

## Instalación

```bash
npm install
```

Copia `.env.local.example` a `.env.local` y rellena los valores:

```bash
cp .env.local.example .env.local
```

### Variables de entorno

Las variables `NEXT_PUBLIC_*` son las del SDK de cliente (Firebase Console → Project Settings → General → Your apps).

Las variables `FIREBASE_ADMIN_*` son de la cuenta de servicio (Firebase Console → Project Settings → Service Accounts → Generate new private key). El JSON descargado contiene los tres valores.

> La `FIREBASE_ADMIN_PRIVATE_KEY` debe ir entre comillas dobles y con los saltos de línea como `\n`:
> ```
> FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
> ```

### Configuración de Firebase

En Firebase Console:

1. **Authentication** → Sign-in method → habilitar Email/Password y Google
2. **Firestore** → crear base de datos en modo producción
3. **Firestore** → Rules → pegar el contenido de `firestore.rules` y publicar

## Desarrollo

```bash
npm run dev      # localhost:3000
npm run build    # build de producción
npm run lint
```

Los hooks (`useIngresos`, `useGastos`, etc.) hacen una lectura puntual a Firestore cada vez que cambia el mes o se modifica un registro. No usan `onSnapshot`, así que no hay actualizaciones en tiempo real.

El motor de cálculos (`src/lib/calculations/`) son funciones puras que reciben arrays ya filtrados por mes. No acceden a Firestore directamente — eso lo hacen los hooks antes de llamarlas.

## Deploy (Vercel)

Conectar el repositorio en Vercel e introducir las mismas variables de entorno que en `.env.local`. El proyecto no necesita configuración adicional.

En Firebase Console, añadir el dominio de Vercel en:
- Authentication → Settings → Authorized domains

## Notas

- El idioma de la interfaz es español. Los nombres de variables, funciones y rutas están en inglés.
- `src/proxy.ts` exporta `proxy` (no `middleware`) — cambio de naming en Next.js 16.
- Las categorías con `is_default: true` no se eliminan, solo se desactivan.
- El campo `rule_block` (`needs`/`wants`/`savings`) en categorías de gastos está preparado para la regla 50/30/20 (implementación futura).
