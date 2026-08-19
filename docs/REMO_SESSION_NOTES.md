# REMO / EventOS — Notas de sesión

Punto de pausa antes de cambiar a otro repositorio.  
**Actualizado:** 19 ago 2026

## Repositorio

| | |
|---|---|
| **GitHub** | https://github.com/eorangel/EventOS-Remo-Rent |
| **Local** | `C:\Users\ERICK ORTIZ\Projects\eventos` |
| **Rama** | `main` (sincronizada con `origin/main`) |
| **Git (GitHub Desktop)** | `C:\Users\ERICK ORTIZ\AppData\Local\GitHubDesktop\app-3.6.3\resources\app\git\cmd\git.exe` |

### Últimos commits en main

| Commit | Descripción |
|--------|-------------|
| `26cdac9` | UI cotizaciones responsiva + PDF profesional (menús, platillos, totales alineados) |
| `cf1449f` | Catálogo servicios y menús banquete con platillos; integración en cotizaciones |
| `1a1f391` | Admin `/eventos`: cotizaciones de proveedores en CRM |
| `35e4774` | Reportes/dashboard proveedor con datos reales (cotizaciones, cobros) |
| `8dcde5a` | Catálogo: fotos URL, miniaturas, eliminar productos |

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
- Migración: `20260817223000_catalogo_servicios_banquetes`
- Modelos: `MenuBanqueteProveedor`, `PlatilloMenuBanquete`
- `CotizacionProveedorItem` extendido con `menuBanqueteProveedorId`, `servicioProveedorId`, `modalidadPrecioMenu`

## Retomar este proyecto

```powershell
cd "C:\Users\ERICK ORTIZ\Projects\eventos"
& "C:\Users\ERICK ORTIZ\AppData\Local\GitHubDesktop\app-3.6.3\resources\app\git\cmd\git.exe" pull origin main
```

1. Abrir carpeta `eventos` en Cursor (File → Open Folder)
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
