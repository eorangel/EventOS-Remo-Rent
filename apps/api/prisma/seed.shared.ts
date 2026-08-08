import type { PrismaClient } from '@prisma/client';

export async function seedPlans(prisma: PrismaClient) {
  await prisma.plan.upsert({
    where: { codigo: 'BASICO' },
    update: {},
    create: {
      id: 'seed-plan-basico',
      nombre: 'Básico',
      codigo: 'BASICO',
      precioMensual: 990,
      descripcion: 'Portal proveedor, clientes y cotizaciones',
    },
  });
  await prisma.plan.upsert({
    where: { codigo: 'PRO' },
    update: {},
    create: {
      id: 'seed-plan-pro',
      nombre: 'Pro',
      codigo: 'PRO',
      precioMensual: 2490,
      descripcion: 'Todo lo del Básico + reportes, pasarela de pago y agenda avanzada',
    },
  });
  await prisma.plan.upsert({
    where: { codigo: 'ENTERPRISE' },
    update: {},
    create: {
      id: 'seed-plan-enterprise',
      nombre: 'Enterprise',
      codigo: 'ENTERPRISE',
      precioMensual: 4990,
      descripcion: 'Multi-sucursal, soporte prioritario y API',
    },
  });
}
