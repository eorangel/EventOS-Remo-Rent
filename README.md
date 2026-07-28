# EventOS — Sistema Operativo para Eventos

Plataforma tecnológica para **Remo&Rent**. El **Evento** es el centro del sistema.

## Stack

- **Frontend:** Next.js 15 + Tailwind CSS
- **Backend:** NestJS 11 + Prisma
- **Base de datos:** PostgreSQL 16

## Sprint 1 (completado)

- Autenticación con roles (Admin, Comercial, Operativo, Compras, Finanzas)
- Módulo de Clientes (expediente + historial)
- Módulo de Eventos (ciclo de vida completo)
- Dashboard con KPIs operativos

## Fase 5A (actual)

- **Red de proveedores** — expediente completo, catálogo de productos, cobertura, servicios y capacidad
- **Captura de datos** — completitud de perfil, verificación, origen de captura
- **KPIs de catálogo** — proveedores, productos, fotos, cobertura geográfica

## Sprint 4 (completado)

- **Finanzas** — anticipos, pagos, gastos, saldos y rentabilidad por evento
- **Documentos** — cotizaciones, contratos, recibos y actas (imprimibles / PDF)
- **KPIs avanzados** — ingresos, cobranza pendiente, rentabilidad y ocupación de inventario

## Sprint 3 (completado)

- **Agenda** — calendario semanal de montajes, eventos y desmontajes
- **Logística** — vehículos, conductor, equipo, rutas, checklist operativo
- **Subarrendos** — seguimiento de pedidos a proveedores externos
- Integración operativa desde el detalle del evento

## Sprint 2 (completado)

- **Inventario** — productos, existencias, disponibilidad por fechas
- **Proveedores** — propios y subarrendamiento
- **Cotizaciones** — ítems, costo, margen, precio, utilidad; ligadas al evento
- Validación de disponibilidad y soporte de subarrendo

## Requisitos

- Node.js 20+
- Docker Desktop (para PostgreSQL)
- npm 10+

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
copy .env.example .env
copy .env.example apps\api\.env

# 3. Levantar PostgreSQL
npm run db:up

# 4. Migrar y sembrar datos demo
npm run db:migrate
npm run db:seed

# 5. Iniciar API y Web (terminales separadas)
npm run dev:api
npm run dev:web
```

- **Web:** http://localhost:3000
- **API:** http://localhost:3001/api

### Credenciales demo

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Admin | admin@remorent.mx | admin123 |
| Comercial | comercial@remorent.mx | comercial123 |

## Estructura

```
eventos/
├── apps/
│   ├── api/          # NestJS — API REST
│   └── web/          # Next.js — interfaz interna
├── docker-compose.yml
└── package.json      # Monorepo npm workspaces
```

## Roadmap

| Sprint | Módulos |
|--------|---------|
| 1 ✅ | Auth, Clientes, Eventos, Dashboard |
| 2 ✅ | Inventario, Proveedores, Cotizaciones |
| 3 ✅ | Agenda, Logística, Subarrendos |
| 4 ✅ | Finanzas, Documentos, KPIs avanzados |
| 5A ✅ | Red de proveedores — catálogo e inventario |
| 5B | Buscador y descubrimiento de inventario |

## Principios

1. **El Evento es el centro** — todo orbita alrededor del Event Engine
2. **Modularidad** — cada módulo evoluciona de forma independiente
3. **API First** — toda funcionalidad expuesta vía REST
4. **Escalabilidad** — diseñado para miles de eventos simultáneos
