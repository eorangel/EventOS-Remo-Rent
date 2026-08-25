# REMO / EventOS — Notas de sesión

Punto de pausa / retoma de trabajo.  
**Actualizado:** 24 ago 2026

## Repositorio

| | |
|---|---|
| **GitHub** | https://github.com/eorangel/EventOS-Remo-Rent |
| **Local (única carpeta de trabajo)** | `C:\Users\ERICK ORTIZ\Projects\eventos` |
| **Rama** | `main` @ `38d27c9` (sincronizada con `origin/main`) |
| **Git (GitHub Desktop)** | `C:\Users\ERICK ORTIZ\AppData\Local\GitHubDesktop\app-3.6.3\resources\app\git\cmd\git.exe` |

> **Importante:** No usar `Documents\GitHub\EventOS-Remo-Rent` — es un clon duplicado sin `.env` ni Docker configurados. Trabajar siempre en `Projects\eventos`.

### Últimos commits en main

| Commit | Descripción |
|--------|-------------|
| `38d27c9` | Módulo contratos proveedor: plantillas, PDF, cotizaciones aprobadas, envío email |
| `f53ecab` | Notas de sesión y gitignore para cambio de repositorio |
| `26cdac9` | UI cotizaciones responsiva + PDF profesional |

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
- MailModule (SMTP) para envío de contratos por email
- Producción: `prisma migrate deploy` corre al iniciar la API (`start:prod`)

### Contratos proveedor (`/proveedor/contratos`)
- Plantillas por tipo de servicio (editor interactivo o archivo PDF/DOC)
- PDF listo para firmar
- Generación desde cotización **Aprobada**
- Envío por email al cliente

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

- Al marcar cobro **Pagado** → cotización **Aprobada**
- Dominios propios (`remorent.mx`, `app.remorent.mx`, `api.remorent.mx`)
- Miniaturas en selector de productos al cotizar
- Bloqueadores P0 go-live (register, JWT hardening) cuando se retome

## Abrir otro repositorio en Cursor

1. **File → Open Folder…** (o **Open Recent** si ya lo usaste)
2. Elegir la carpeta del otro proyecto
3. Este repo queda intacto en `Projects\eventos`; no hace falta cerrar nada especial
