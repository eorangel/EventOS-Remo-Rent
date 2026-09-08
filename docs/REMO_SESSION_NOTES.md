# REMO / EventOS — Notas de sesión

Punto de pausa / retoma de trabajo.  
**Actualizado:** 8 sep 2026 — pausa tras dominios, Resend y editor de contratos

## Repositorio

| | |
|---|---|
| **GitHub** | https://github.com/eorangel/EventOS-Remo-Rent |
| **Local (única carpeta de trabajo)** | `C:\Users\ERICK ORTIZ\Projects\eventos` |
| **Rama** | `main` @ `b3da936` (sincronizada con `origin/main`) |
| **Git (GitHub Desktop)** | `C:\Users\ERICK ORTIZ\AppData\Local\GitHubDesktop\app-3.6.3\resources\app\git\cmd\git.exe` |

> **Importante:** No usar `Documents\GitHub\EventOS-Remo-Rent` — es un clon duplicado sin `.env` ni Docker configurados. Trabajar siempre en `Projects\eventos`.

### Últimos commits en main

| Commit | Descripción |
|--------|-------------|
| `b3da936` | fix(web): escuchar en PORT de Railway para dominio custom |
| `9b7a796` | fix(web): acordeón de cláusulas + campos a ancho completo |
| `e26b2cf` | feat(web): editor de contratos con vista previa en tiempo real |
| `93528e9` | docs: punto de pausa 25 ago — Resend pendiente en Railway |
| `4ed11e5` | Envío de correos vía **Resend** (Railway bloquea SMTP saliente) |

## Producción — URLs

| Servicio | URL actual | Dominio propio (estado) |
|----------|------------|-------------------------|
| Landing | https://remoconecta.com | ✅ Vercel — Valid Configuration |
| Landing (alt) | https://eventosremorent.vercel.app | Sigue activa |
| Portal web | https://app.remoconecta.com | ✅ Login carga (Railway puerto 8080) |
| Portal web (alt) | https://web-production-8e240.up.railway.app | Sigue activa |
| API | https://api-production-af34e.up.railway.app | ✅ Funciona |
| API (custom) | https://api.remoconecta.com | ⚠️ 502 — dominio custom API pendiente |

Railway auto-deploy al push en `main`. Verificar en **Deployments** que el commit más reciente esté en **Success**.

## Dominio remoconecta.com (Cloudflare)

DNS en **Cloudflare**, registros principales (todos **DNS only / nube gris**):

| Name | Type | Target |
|------|------|--------|
| `@` | CNAME | `9c2d4514c6cace42.vercel-dns-017.com` (landing) |
| `www` | CNAME | idem Vercel |
| `app` | CNAME | `hhof47wu.up.railway.app` (portal web) |
| `api` | CNAME | `6gbwy8s6.up.railway.app` (API) |
| `send` | MX + TXT | Resend (Amazon SES) |
| `resend._domainkey` | TXT | DKIM Resend |
| `_railway-verify.app` | TXT | Verificación Railway web |
| `_railway-verify.api` | TXT | Verificación Railway api |

**Railway custom domains:** puerto **8080** (default) en web y api.

## Correo — Resend (completado)

- Cuenta Resend: `remo.conecta@gmail.com`
- Dominio **`remoconecta.com`** → **Verified** en Resend
- Enviar a `remo.conecta@gmail.com` con `onboarding@resend.dev` → probado OK
- Para clientes externos (Hotmail, etc.): usar remitente `@remoconecta.com`

| Variable Railway (servicio **api**) | Valor producción |
|-------------------------------------|------------------|
| `RESEND_API_KEY` | Configurada |
| `RESEND_FROM` | `Remo&Rent <contratos@remoconecta.com>` ← confirmar en Railway |

## Trabajo completado en esta sesión (sep 2026)

### Editor de contratos (`/proveedor/contratos`)
- Vista previa en tiempo real (panel derecho)
- Plantilla precargada con 6 cláusulas por tipo de servicio
- Acordeón **+ / −** por cláusula
- Campos cliente sincronizados con preview
- Eliminada opción **Cargar archivo** (solo editor)
- Sección **Enviar por correo** a ancho completo
- Inputs `w-full` global en CSS

### Infraestructura / dominios
- Resend + dominio verificado en Cloudflare
- Landing en **remoconecta.com** (Vercel)
- **app.remoconecta.com** operativo (login carga)
- Fix Next.js: `next start -H 0.0.0.0 -p ${PORT:-3000}` para Railway

## Pendiente al retomar (prioridad)

1. **API custom domain** — `api.remoconecta.com` da 502; verificar puerto 8080 en Railway → api → Networking (recrear dominio si hace falta)
2. **Variable web + redeploy** — en Railway servicio **web**:
   - `NEXT_PUBLIC_API_URL=https://api-production-af34e.up.railway.app` (temporal hasta que api custom funcione)
   - Luego cambiar a `https://api.remoconecta.com`
   - **Redeploy obligatorio** del servicio web (`NEXT_PUBLIC_*` se embebe en build)
3. **Variables api** (confirmar en Railway):
   ```
   CORS_ORIGIN=https://app.remoconecta.com
   WEB_PUBLIC_URL=https://app.remoconecta.com
   API_PUBLIC_URL=https://api.remoconecta.com
   RESEND_FROM=Remo&Rent <contratos@remoconecta.com>
   ```
4. **Vercel landing** — `NEXT_PUBLIC_APP_URL=https://app.remoconecta.com` (tipo Config, no Secret) + redeploy
5. **Probar login** en `https://app.remoconecta.com/login` tras redeploy web
6. **Probar envío contrato** a correo externo (Hotmail) con `RESEND_FROM` @remoconecta.com

## Retomar este proyecto

```powershell
cd "C:\Users\ERICK ORTIZ\Projects\eventos"
& "C:\Users\ERICK ORTIZ\AppData\Local\GitHubDesktop\app-3.6.3\resources\app\git\cmd\git.exe" pull origin main
npm run db:up    # si Docker no está corriendo
npm run db:migrate
```

1. Abrir carpeta **`C:\Users\ERICK ORTIZ\Projects\eventos`** en Cursor
2. Verificar Railway deploys (web + api) en **Success**
3. Variables locales: `apps/api/.env`, `apps/web/.env.local` (no están en git)

## Ideas pendientes (no bloqueantes)

- Al marcar cobro **Pagado** → cotización **Aprobada**
- Miniaturas en selector de productos al cotizar
- Bloqueadores P0 go-live (register, JWT hardening)
- Actualizar `PlatformPreview.tsx` (landing) — URLs hardcodeadas a `.railway.app`

## Abrir otro repositorio en Cursor

1. **File → Open Folder…** (o **Open Recent**)
2. Elegir la carpeta del otro proyecto
3. Este repo queda intacto en `Projects\eventos`
