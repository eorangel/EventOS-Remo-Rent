import { ForbiddenException } from '@nestjs/common';
import { RolUsuario } from '@prisma/client';

export type AuthUser = {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
  proveedorId?: string | null;
};

const PROVEEDOR_ROLES: RolUsuario[] = [
  RolUsuario.ADMIN_PROVEEDOR,
  RolUsuario.OPERADOR_PROVEEDOR,
];

const PLATFORM_ROLES: RolUsuario[] = [
  RolUsuario.ADMIN,
  RolUsuario.COMERCIAL,
  RolUsuario.OPERATIVO,
  RolUsuario.COMPRAS,
  RolUsuario.FINANZAS,
];

export function isProveedorUser(rol: RolUsuario) {
  return PROVEEDOR_ROLES.includes(rol);
}

export function isPlatformUser(rol: RolUsuario) {
  return PLATFORM_ROLES.includes(rol);
}

export function requireProveedorUser(user: AuthUser): string {
  if (!isProveedorUser(user.rol) || !user.proveedorId) {
    throw new ForbiddenException('Acceso solo para usuarios de proveedor');
  }
  return user.proveedorId;
}

export function requirePlatformAdmin(user: AuthUser) {
  if (user.rol !== RolUsuario.ADMIN) {
    throw new ForbiddenException('Solo administradores de plataforma');
  }
}
