import type { RolUsuario, Usuario } from './types';

const PROVEEDOR_ROLES: RolUsuario[] = ['ADMIN_PROVEEDOR', 'OPERADOR_PROVEEDOR'];

export function isProveedorUser(rol: RolUsuario) {
  return PROVEEDOR_ROLES.includes(rol);
}

export function getLoginRedirect(user: Usuario) {
  return isProveedorUser(user.rol) ? '/proveedor/dashboard' : '/dashboard';
}
