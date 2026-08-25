# REMO / EventOS — Notas de sesión

Punto de pausa / retoma de trabajo.  
**Actualizado:** 25 ago 2026 — pausa para trabajar en otro repositorio

## Repositorio

| | |
|---|---|
| **GitHub** | https://github.com/eorangel/EventOS-Remo-Rent |
| **Local (única carpeta de trabajo)** | `C:\Users\ERICK ORTIZ\Projects\eventos` |
| **Rama** | `main` @ `4ed11e5` (sincronizada con `origin/main`) |
| **Git (GitHub Desktop)** | `C:\Users\ERICK ORTIZ\AppData\Local\GitHubDesktop\app-3.6.3\resources\app\git\cmd\git.exe` |

> **Importante:** No usar `Documents\GitHub\EventOS-Remo-Rent` — es un clon duplicado sin `.env` ni Docker configurados. Trabajar siempre en `Projects\eventos`.

### Últimos commits en main

| Commit | Descripción |
|--------|-------------|
| `4ed11e5` | Envío de correos vía **Resend** (Railway bloquea SMTP saliente) |
| `4bb2e10` | Errores SMTP claros + adjuntos PDF en contratos |
| `b70b964` | Import MailModule — fix deploy API en Railway |
| `c46d6ae` | Guardar/PDF en plantilla de contrato nueva |
| `38d27c9` | Módulo contratos proveedor completo |

## Producción

| Servicio | URL |
|----------|-----|
| Portal web (Railway) | https://web-production-8e240.up.railway.app |
| API (Railway) | https://api-production-af34e.up.railway.app |
| Landing (Vercel) | https://eventosremorent.vercel.app |

Railway auto-deploy al push en `main`. Verificar en **Deployments** que el commit más reciente esté en **Success**.

## Trabajo completado en esta fase

### Catálogo proveedor (`/proveedor/catalogo`)
- Pestañas **Productos** | **Servicios y banquetes**
- CRUD servicios genéricos (`/portal/servicios`)
- CRUD menús banquete con platillos por sección (`/portal/menus-banquete`)
- Precio menú: por persona y/o por evento

### Cotizaciones
- Agregar productos, servicios y menús desde catálogo
- Modalidad precio menú (por persona / por evento)
- UI responsiva móvil/tablet (panel catálogo, tarjetas, barra fija guardar)
- PDF al cliente: tabla alineada, badges, platillos del menú, totales en caja

### API / DB
- Migraciones aplicadas localmente (24 ago 2026):
  - `20260817223000_catalogo_servicios_banquetes`
  - `20260824200000_plantillas_contrato_proveedor`
  - `20260824210000_contratos_emitidos_email`
- Modelos nuevos: `PlantillaContratoProveedor`, `ContratoEmitidoProveedor`
- MailModule + **Resend API** (HTTPS) para envío en Railway; SMTP solo local
- Producción: `prisma migrate deploy` corre al iniciar la API (`start:prod`)

### Contratos proveedor (`/proveedor/contratos`)
- Plantillas por tipo de servicio (editor interactivo o archivo PDF/DOC)
- PDF listo para firmar
- Generación desde cotización **Aprobada**
- Envío por email al cliente

## Correo en producción — pendiente al retomar

Railway **bloquea SMTP saliente** (Gmail `smtp.gmail.com:587` → *Connection timeout*).  
Las variables SMTP en el servicio **api** están bien; el bloqueo es de la plataforma.

**Solución implementada:** Resend por API (`RESEND_API_KEY` + `RESEND_FROM`).

| Variable Railway (servicio **api**) | Valor sugerido |
|-------------------------------------|----------------|
| `RESEND_API_KEY` | API key de https://resend.com (`re_...`) |
| `RESEND_FROM` | `"Remo&Rent" <onboarding@resend.dev>` (pruebas) o dominio verificado |

- Cuenta Gmail `remo.conecta@gmail.com`: sirve como **reply-to** y para recibir; no como SMTP en Railway.
- Con `onboarding@resend.dev` solo se puede enviar al correo con el que te registraste en Resend.
- Para clientes reales (ej. Hotmail): verificar dominio en Resend.

Variables SMTP actuales en Railway pueden quedarse; si existe `RESEND_API_KEY`, se usa Resend.

## Retomar este proyecto

```powershell
cd "C:\Users\ERICK ORTIZ\Projects\eventos"
& "C:\Users\ERICK ORTIZ\AppData\Local\GitHubDesktop\app-3.6.3\resources\app\git\cmd\git.exe" pull origin main
npm run db:up    # si Docker no está corriendo
npm run db:migrate
```

1. Abrir carpeta **`C:\Users\ERICK ORTIZ\Projects\eventos`** en Cursor (File → Open Folder)
2. Verificar Railway deploy tras `git pull`
3. Variables locales: `apps/api/.env`, `apps/web/.env.local` (no están en git)

## Ideas pendientes (no bloqueantes)

- Configurar **Resend** en Railway y probar envío de contrato por email
- Al marcar cobro **Pagado** → cotización **Aprobada**
- Dominios propios (`remorent.mx`, `app.remorent.mx`, `api.remorent.mx`)
- Miniaturas en selector de productos al cotizar
- Bloqueadores P0 go-live (register, JWT hardening) cuando se retome

## Abrir otro repositorio en Cursor

1. **File → Open Folder…** (o **Open Recent** si ya lo usaste)
2. Elegir la carpeta del otro proyecto
3. Este repo queda intacto en `Projects\eventos`; no hace falta cerrar nada especial
