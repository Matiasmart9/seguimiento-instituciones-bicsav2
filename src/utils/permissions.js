// Roles y permisos.
// - Super administrador: se identifica por su correo (no se puede quitar ni modificar desde la app).
// - Administrador: mismos accesos que el super administrador (incluye gestionar usuarios).
// - Usuario: por defecto solo ve el Reporte de Instituciones; el resto se habilita con interruptores.
export const SUPER_ADMIN_EMAIL = 'matiasmart7@gmail.com';

export const ROLES = {
  superadmin: 'Super administrador',
  admin: 'Administrador',
  usuario: 'Usuario',
};

// Interruptores que un administrador puede activar a un usuario normal
export const PERMISSIONS = [
  { key: 'xml', label: 'Seguimiento XML Instituciones BICSA', short: 'Panel XML' },
  { key: 'seguimiento', label: 'Seguimiento', short: 'Seguimiento' },
  { key: 'editar', label: 'Editar', short: 'Editar' },
  { key: 'auditoria', label: 'Auditoría', short: 'Auditoría' },
  { key: 'eliminar', label: 'Eliminar', short: 'Eliminar' },
];

export const emptyPermissions = () => Object.fromEntries(PERMISSIONS.map((p) => [p.key, false]));
export const fullPermissions = () => Object.fromEntries(PERMISSIONS.map((p) => [p.key, true]));

export const isSuperAdminEmail = (email) => (email || '').toLowerCase() === SUPER_ADMIN_EMAIL;

// Perfil que se crea la primera vez que alguien inicia sesión sin perfil:
// queda pendiente hasta que un administrador lo apruebe.
export const newProfileFor = (user) =>
  isSuperAdminEmail(user.email)
    ? { email: user.email, nombre: 'Super administrador', rol: 'superadmin', activo: true, pendiente: false, permisos: fullPermissions(), fechaCreacion: new Date().toISOString() }
    : { email: user.email, nombre: '', rol: 'usuario', activo: false, pendiente: true, permisos: emptyPermissions(), fechaCreacion: new Date().toISOString() };

// Accesos efectivos de la sesión actual. `can.*` ya incluye la condición de tener acceso al panel.
export const resolveAccess = (user, profile) => {
  const none = { xml: false, seguimiento: false, editar: false, auditoria: false, eliminar: false };
  if (!user) return { loaded: false, role: null, isSuperAdmin: false, isAdmin: false, active: false, pending: false, can: none };

  if (isSuperAdminEmail(user.email)) {
    return { loaded: true, role: 'superadmin', isSuperAdmin: true, isAdmin: true, active: true, pending: false, can: fullPermissions() };
  }

  if (!profile) return { loaded: false, role: null, isSuperAdmin: false, isAdmin: false, active: false, pending: false, can: none };

  const active = profile.activo === true;
  const isAdmin = active && profile.rol === 'admin';
  const perms = profile.permisos || {};
  const can = isAdmin
    ? fullPermissions()
    : {
        xml: active && perms.xml === true,
        seguimiento: active && perms.xml === true && perms.seguimiento === true,
        editar: active && perms.xml === true && perms.editar === true,
        auditoria: active && perms.xml === true && perms.auditoria === true,
        eliminar: active && perms.xml === true && perms.eliminar === true,
      };

  return { loaded: true, role: profile.rol, isSuperAdmin: false, isAdmin, active, pending: profile.pendiente === true, can };
};
