import { useState } from 'react';
import Switch from './Switch';
import AddUserModal from './AddUserModal';
import ThemeToggle from './ThemeToggle';
import { useToast } from '../context/ToastContext';
import { useUsers, updateUserProfile, sendResetEmail, createUserAccount } from '../hooks/useUsers';
import { PERMISSIONS, ROLES, isSuperAdminEmail } from '../utils/permissions';

const Icon = ({ children, size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const BackIcon = () => <Icon><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Icon>;
const PlusIcon = () => <Icon><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>;
const MailIcon = () => <Icon size={16}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></Icon>;

const ROLE_BADGE = {
  superadmin: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  usuario: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const UsersView = ({ currentUser, onBack }) => {
  const toast = useToast();
  const { users, loading, error } = useUsers(true);
  const [showAdd, setShowAdd] = useState(false);

  const run = async (action, errorMessage) => {
    try {
      await action();
    } catch (error) {
      console.error(errorMessage, error);
      toast.error(errorMessage);
    }
  };

  const setActive = (u, value) =>
    run(() => updateUserProfile(u.uid, { activo: value, ...(value ? { pendiente: false } : {}) }), 'No se pudo cambiar el estado del usuario.');

  const setRole = (u, rol) => run(() => updateUserProfile(u.uid, { rol }), 'No se pudo cambiar el rol.');

  const setPermission = (u, key, value) =>
    run(() => updateUserProfile(u.uid, { [`permisos.${key}`]: value }), 'No se pudo cambiar el permiso.');

  const handleReset = (u) =>
    run(async () => {
      await sendResetEmail(u.email);
      toast.success(`Se envió un correo de restablecimiento a ${u.email}`);
    }, 'No se pudo enviar el correo de restablecimiento.');

  const handleCreate = async (data) => {
    await createUserAccount(data, currentUser.email);
    setShowAdd(false);
    toast.success(`Usuario ${data.email} creado`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-gradient-to-r from-[#fa8b31] via-[#f59e0b] to-[#ea580c] dark:from-gray-900 dark:via-orange-900 dark:to-gray-900 shadow-lg px-5 py-5 text-white">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors">
              <BackIcon /> Volver al panel
            </button>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button onClick={() => setShowAdd(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors">
                <PlusIcon /> Agregar usuario
              </button>
            </div>
          </div>
          <div className="text-center mt-4">
            <h1 className="text-2xl md:text-3xl font-bold drop-shadow-md tracking-tight">Gestión de usuarios</h1>
            <p className="mt-1 text-white/95">Controla quién accede al sistema y qué puede hacer</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6">
        <div className="mb-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200 text-sm p-3">
          Los usuarios normales ven por defecto el <strong>Reporte de Instituciones</strong>. Habilita <strong>Seguimiento XML Instituciones BICSA</strong> para darles acceso al panel, y luego elige qué botones pueden usar. Los administradores tienen los mismos accesos que el super administrador.
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-12">Cargando usuarios...</p>
        ) : error ? (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-5">
            <h2 className="font-bold mb-1">No se pudo leer la lista de usuarios</h2>
            <p className="text-sm">
              Firestore rechazó la consulta ({error.code || 'error'}). Lo más probable es que todavía no estén publicadas las reglas de seguridad:
              copia el contenido de <code className="font-mono">firestore.rules</code> en Firebase Console → Firestore Database → Reglas y pulsa Publicar.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40 text-left text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Rol</th>
                  <th className="px-4 py-3 font-semibold text-center">Activo</th>
                  {PERMISSIONS.map((p) => (
                    <th key={p.key} className={`px-3 py-3 font-semibold text-center ${p.key === 'xml' ? 'min-w-[8rem]' : ''}`} title={p.label}>
                      {p.key === 'xml' ? <>Seguimiento XML<br />Instituciones BICSA</> : p.short}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold text-center">Clave</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSuper = isSuperAdminEmail(u.email);
                  const isSelf = u.uid === currentUser.uid;
                  const role = isSuper ? 'superadmin' : u.rol || 'usuario';
                  const fullAccess = role === 'admin' || role === 'superadmin';
                  const locked = isSuper || isSelf; // no se puede inhabilitar ni cambiar el rol de uno mismo ni del super admin
                  const perms = u.permisos || {};

                  return (
                    <tr key={u.uid} className={`border-t border-gray-100 dark:border-gray-700 align-middle ${!u.activo ? 'bg-gray-50/60 dark:bg-gray-900/30' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900 dark:text-white flex flex-wrap items-center gap-2">
                          {u.nombre || u.email}
                          {isSelf && <span className="text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-2 py-0.5 rounded-full">Tú</span>}
                          {u.pendiente && <span className="text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 px-2 py-0.5 rounded-full">Pendiente de aprobación</span>}
                        </div>
                        {u.nombre && <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>}
                      </td>
                      <td className="px-4 py-3">
                        {isSuper ? (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGE.superadmin}`}>{ROLES.superadmin}</span>
                        ) : (
                          <select
                            value={role}
                            disabled={locked}
                            onChange={(e) => setRole(u, e.target.value)}
                            aria-label={`Rol de ${u.email}`}
                            className={`text-xs font-semibold px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-60 ${ROLE_BADGE[role]}`}
                          >
                            <option value="usuario">{ROLES.usuario}</option>
                            <option value="admin">{ROLES.admin}</option>
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Switch label={`Activo: ${u.email}`} checked={isSuper || u.activo === true} disabled={locked} onChange={(v) => setActive(u, v)} />
                      </td>
                      {PERMISSIONS.map((p) => {
                        const needsXml = p.key !== 'xml' && !fullAccess && !perms.xml;
                        return (
                          <td key={p.key} className="px-3 py-3 text-center">
                            <div className="flex justify-center">
                              <Switch
                                label={`${p.label}: ${u.email}`}
                                checked={fullAccess || perms[p.key] === true}
                                disabled={fullAccess || needsXml}
                                onChange={(v) => setPermission(u, p.key, v)}
                                color={p.key === 'eliminar' ? 'bg-red-500' : 'bg-green-500'}
                              />
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center">
                        {!isSuper || isSelf ? (
                          <button
                            onClick={() => handleReset(u)}
                            title="Enviar correo para restablecer contraseña"
                            aria-label={`Enviar correo de restablecimiento a ${u.email}`}
                            className="p-2 rounded-md text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
                          >
                            <MailIcon />
                          </button>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Inhabilitar a un usuario le impide entrar al sistema. Las cuentas de Firebase Authentication no se eliminan desde aquí.
        </p>
      </main>

      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} onCreate={handleCreate} />}
    </div>
  );
};

export default UsersView;
