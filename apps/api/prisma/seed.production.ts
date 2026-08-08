import { PrismaClient, RolUsuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedPlans } from './seed.shared';

const prisma = new PrismaClient();

/** Seed mínimo para producción: solo admin + catálogo de planes SaaS. */
export async function seedProduction() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@remorent.mx' },
    update: {},
    create: {
      email: 'admin@remorent.mx',
      passwordHash,
      nombre: 'Administrador',
      rol: RolUsuario.ADMIN,
    },
  });

  await seedPlans(prisma);

  console.log('Seed producción completado:', {
    admin: admin.email,
    planes: ['BASICO', 'PRO', 'ENTERPRISE'],
  });
}

if (require.main === module) {
  seedProduction()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
