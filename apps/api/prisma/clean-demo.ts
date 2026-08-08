import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@remorent.mx';

/**
 * Elimina todos los datos demo de la base, conservando solo el admin y el catálogo de planes.
 * Ejecutar en producción: npx ts-node prisma/clean-demo.ts
 */
export async function cleanDemoData() {
  await prisma.$transaction(async (tx) => {
    await tx.pagoSuscripcion.deleteMany();
    await tx.suscripcion.deleteMany();

    await tx.cotizacionProveedorItem.deleteMany();
    await tx.cotizacionProveedor.deleteMany();
    await tx.seguimientoCliente.deleteMany();
    await tx.eventoClienteProveedor.deleteMany();
    await tx.ordenCobro.deleteMany();
    await tx.configPasarelaProveedor.deleteMany();
    await tx.perfilEmpresaProveedor.deleteMany();
    await tx.fotoProductoProveedor.deleteMany();
    await tx.productoProveedor.deleteMany();
    await tx.coberturaProveedor.deleteMany();
    await tx.servicioProveedor.deleteMany();
    await tx.clienteProveedor.deleteMany();

    await tx.logisticaChecklistItem.deleteMany();
    await tx.logistica.deleteMany();
    await tx.actividadAgenda.deleteMany();
    await tx.subarrendo.deleteMany();
    await tx.documento.deleteMany();
    await tx.movimientoFinanciero.deleteMany();
    await tx.cotizacionItem.deleteMany();
    await tx.cotizacion.deleteMany();
    await tx.evento.deleteMany();
    await tx.cliente.deleteMany();
    await tx.producto.deleteMany();
    await tx.vehiculo.deleteMany();
    await tx.proveedor.deleteMany();

    await tx.usuario.deleteMany({
      where: { email: { not: ADMIN_EMAIL } },
    });
  });

  const admin = await prisma.usuario.findUnique({ where: { email: ADMIN_EMAIL } });
  const planes = await prisma.plan.count();

  console.log('Limpieza demo completada:', {
    admin: admin?.email ?? 'NO ENCONTRADO — ejecuta npm run prisma:seed:prod',
    planes,
    usuarios: await prisma.usuario.count(),
    proveedores: await prisma.proveedor.count(),
    clientes: await prisma.cliente.count(),
    eventos: await prisma.evento.count(),
  });
}

if (require.main === module) {
  cleanDemoData()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
