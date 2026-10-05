# Seguimiento XML Instituciones BICSA

Aplicación web para el seguimiento de las instituciones que atraviesan el proceso de validación de XML de BICSA:
estados y vencimientos, comentarios de seguimiento, auditoría de movimientos, reportes para el área comercial y
gestión de usuarios con permisos.

**Versión actual:** V1.3 (se define en `src/version.js`).

## Contenido

- [Funcionalidades](#funcionalidades)
- [Roles y permisos](#roles-y-permisos)
- [Tecnologías](#tecnologías)
- [Puesta en marcha local](#puesta-en-marcha-local)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Firebase](#firebase)
- [Despliegue en Netlify](#despliegue-en-netlify)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Reglas de negocio](#reglas-de-negocio)
- [Solución de problemas](#solución-de-problemas)

## Funcionalidades

**Panel "Seguimiento XML Instituciones BICSA"**
- Tarjetas de KPI por estado (Total, Validación MiPymes / Premium / Premium-Portal, Revalidación, Activas, Suspendidas, Vencidas, Sin Renovación) con detalle y descarga a Excel.
- Panel de **Alertas de validaciones críticas**: vencidas y por vencer (hasta 8 días).
- Listado de instituciones con **búsqueda** (sin distinguir tildes ni mayúsculas), filtros por estado y categoría, **orden** (recientes, antiguas, vencimiento, nombre) y **paginación** (12 / 24 / 48 por página).
- Por institución: **Seguimiento** (comentarios con **negrita** y *cursiva*, eliminación con confirmación), **Editar**, **Auditoría** y **Eliminar**.
- **Auditoría**: historial de movimientos por institución (creación, cambios de estado, ediciones, comentarios agregados y eliminados) con usuario y fecha.
- **Exportar Excel** con títulos en color, filtros y fila fija.

**Reporte Instituciones** (Menú → Reporte Instituciones)
- Último comentario por institución para Valid. XML MiPymes, Valid. XML Premium, Valid. Premium/Portal-MiPymes, Revalidación Inst. Activas y Suspendidas.
- Búsqueda por institución o por texto del comentario, filtro "Solo vencidas", exportación a Excel (una hoja por grupo) e impresión.

**Gestión de usuarios** (Menú → Usuarios, solo administradores)
- Alta de usuarios, activar/inhabilitar, cambio de rol y permisos con interruptores, envío de correo para restablecer la contraseña.

**Otros**
- Modo claro / oscuro, widget del clima, avisos (toasts) y confirmación para acciones destructivas y para cerrar sesión.
- **Cierre de sesión por inactividad:** tras 15 minutos sin usar el portal la sesión se cierra sola, con un aviso de 60 segundos antes ("Seguir conectado"). La actividad se comparte entre pestañas. Los tiempos se ajustan en `src/hooks/useIdleLogout.js` (`IDLE_TIMEOUT_MINUTES`, `IDLE_WARNING_SECONDS`).
- Interfaz adaptada a móvil y tablet (los iconos de acción de las tarjetas están siempre visibles en pantallas táctiles).

## Roles y permisos

| Rol | Acceso |
|---|---|
| **Super administrador** | Todo. Se identifica por su correo (`SUPER_ADMIN_EMAIL` en `src/utils/permissions.js`) y no puede ser modificado desde la app. |
| **Administrador** | Mismos accesos que el super administrador, incluida la gestión de usuarios (excepto modificar al super administrador). |
| **Usuario** | Por defecto solo ve el **Reporte de Instituciones**. Un administrador le habilita con interruptores lo demás. |

Interruptores de un usuario normal:

1. **Seguimiento XML Instituciones BICSA**: acceso al panel principal.
2. **Seguimiento**, **Editar** (incluye agregar instituciones), **Auditoría**, **Eliminar**: botones de cada tarjeta. Requieren tener habilitado el panel.

Cuando alguien inicia sesión y todavía no tiene perfil, la app crea uno **pendiente de aprobación**: no ve datos hasta que un administrador lo active.

> Los permisos se aplican en la interfaz **y** en el servidor mediante `firestore.rules`. Las reglas deben publicarse (ver [Firebase](#firebase)); sin ellas los permisos son solo visuales.

## Tecnologías

- [React 18](https://react.dev/) + [Vite](https://vite.dev/)
- [Tailwind CSS 3](https://tailwindcss.com/) y styled-components
- [Firebase](https://firebase.google.com/) (Authentication y Firestore)
- [ExcelJS](https://github.com/exceljs/exceljs) para los Excel con formato (se carga solo al exportar)
- ESLint 9

## Puesta en marcha local

Requisitos: **Node.js 20 o superior** y npm.

```bash
git clone https://github.com/Matiasmart9/seguimiento-instituciones-bicsav2.git
cd seguimiento-instituciones-bicsav2
npm install
cp .env.example .env.local   # completa los valores (ver más abajo)
npm run dev
```

La app queda en <http://localhost:3000> (Vite usa el siguiente puerto libre si está ocupado).

> El entorno local usa el mismo proyecto de Firebase que producción (ver `src/firebase/firebaseConfig.js`): lo que hagas en local afecta a los datos reales.

## Variables de entorno

Copia `.env.example` a `.env.local` (este archivo no se sube al repositorio).

| Variable | Descripción |
|---|---|
| `VITE_OPENWEATHER_API_KEY` | Clave de [OpenWeather](https://openweathermap.org/api) para el widget del clima. Si falta, el widget muestra un error pero el resto de la app funciona. |

En Netlify se configuran en *Site configuration → Environment variables*. Las variables `VITE_*` se incluyen en el código del navegador: no son secretas, restringe la clave por dominio en el proveedor.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run preview` | Sirve localmente la compilación de producción |
| `npm run lint` | Revisa el código con ESLint (sin advertencias permitidas) |

## Firebase

**Authentication:** proveedor *Correo electrónico/contraseña* habilitado.

**Firestore** — colecciones:

- `institutions/{id}`: `nombre`, `categoria`, `estado`, `fechaIngreso`, `fechaVencimiento`, `motivoSuspension`, `comentarios[]`, `historial[]`, `creadoPor`, `fechaCreacion`.
- `users/{uid}`: `email`, `nombre`, `rol` (`admin` | `usuario`), `activo`, `pendiente`, `permisos` `{ xml, seguimiento, editar, auditoria, eliminar }`.

**Reglas de seguridad:** el archivo [`firestore.rules`](firestore.rules) define quién puede leer y escribir. **Hay que publicarlo**:

- Firebase Console → Firestore Database → *Reglas* → pegar el contenido → *Publicar*, o
- `firebase deploy --only firestore:rules` (con Firebase CLI configurado).

Si cambias el correo del super administrador, actualízalo en **dos** lugares: `src/utils/permissions.js` y `firestore.rules`.

**Primer arranque:** inicia sesión con el correo del super administrador; su perfil se crea solo. Desde *Menú → Usuarios* aprueba a las personas que ya tenían cuenta y agrega las nuevas.

## Despliegue en Netlify

| Ajuste | Valor |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node | 20 o superior |
| Variables de entorno | `VITE_OPENWEATHER_API_KEY` |

**Orden recomendado para un cambio de permisos:** publicar primero `firestore.rules` y después desplegar el código, para no dejar sin acceso a usuarios existentes.

## Estructura del proyecto

```
src/
├── App.jsx                    # Navegación entre vistas y control de acceso
├── version.js                 # Versión mostrada en el login y en el menú
├── components/                # Pantallas y componentes (panel, reporte, usuarios, modales)
├── context/                   # Tema (claro/oscuro) y avisos (toasts)
├── firebase/firebaseConfig.js # Inicialización de Firebase
├── hooks/                     # useAuth, useAccess, useInstitutions, useUsers, useDebounce
└── utils/                     # Reglas de negocio: filtros, KPIs, reporte, auditoría, permisos, Excel
firestore.rules                # Reglas de seguridad de Firestore
```

## Reglas de negocio

- **Días de vencimiento / atraso:** solo corren mientras la institución está en *Validación de XML* o *Revalidación de XML*. En *Activo*, *Suspendida* y *Sin Renovación Contrato* no se acumulan (se muestra N/A).
- **Vencidas:** instituciones en validación o revalidación con la fecha de vencimiento ya superada.
- **Panel de alertas:** excluye Activo, Suspendida y Sin Renovación Contrato; muestra vencidas y las que vencen en 8 días o menos (críticas ≤ 5 días).
- **KPI Total:** no incluye Activas ni Suspendidas.
- **Comentarios:** formato `**negrita**` y `*cursiva*`, guardado como texto plano.

## Solución de problemas

- **"Cuenta pendiente de aprobación" o "Cuenta inhabilitada":** un administrador debe habilitar el usuario en *Menú → Usuarios*. Si acabas de actualizar la app y ves esto con tu cuenta de siempre, comprueba que `firestore.rules` esté publicado.
- **"No se pudo leer la lista de usuarios":** las reglas de Firestore aún no incluyen la colección `users`. Publica `firestore.rules`.
- **El widget del clima muestra error:** falta o es inválida `VITE_OPENWEATHER_API_KEY`.
- **Cambios que no se reflejan en desarrollo:** reinicia `npm run dev`.
