import { useState } from 'react';
import Switch from './Switch';
import { EyeIcon, EyeOffIcon } from './Icons';
import { PERMISSIONS, emptyPermissions } from '../utils/permissions';

const inputClass =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white';

const AUTH_ERRORS = {
  'auth/email-already-in-use': 'Ese correo ya existe en Firebase. Pídele que inicie sesión una vez: aparecerá en la lista como pendiente y podrás habilitarlo.',
  'auth/invalid-email': 'El formato del correo no es válido.',
  'auth/weak-password': 'La contraseña es muy débil (mínimo 6 caracteres).',
  'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
};

const AddUserModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'usuario' });
  const [permisos, setPermisos] = useState(emptyPermissions());
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isAdminRole = form.rol === 'admin';
  const setField = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('La contraseña temporal debe tener al menos 6 caracteres.');
      return;
    }
    setSaving(true);
    try {
      await onCreate({ ...form, email: form.email.trim(), nombre: form.nombre.trim(), permisos });
    } catch (err) {
      console.error('Error al crear usuario:', err.code || err);
      setError(AUTH_ERRORS[err.code] || 'No se pudo crear el usuario. Intenta nuevamente.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Agregar usuario</h2>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Nombre</label>
            <input className={inputClass} value={form.nombre} onChange={setField('nombre')} placeholder="Nombre y apellido" required />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Correo</label>
            <input type="email" className={inputClass} value={form.email} onChange={setField('email')} placeholder="usuario@empresa.com" required />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Contraseña temporal</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`${inputClass} pr-10`}
                value={form.password}
                onChange={setField('password')}
                autoComplete="new-password"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-orange-600"
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mínimo 6 caracteres. Después puedes enviarle un correo para que la cambie.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Rol</label>
            <select className={inputClass} value={form.rol} onChange={setField('rol')}>
              <option value="usuario">Usuario (por defecto solo ve el Reporte de Instituciones)</option>
              <option value="admin">Administrador (mismos accesos que el super administrador)</option>
            </select>
          </div>

          <div className="rounded-md border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
            {PERMISSIONS.map((p) => {
              const dependsOnXml = p.key !== 'xml' && !isAdminRole && !permisos.xml;
              return (
                <div key={p.key} className={`flex items-center justify-between gap-3 px-3 py-2 ${p.key !== 'xml' ? 'pl-6' : ''}`}>
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {p.label}
                    {dependsOnXml && <span className="block text-xs text-gray-400">Requiere habilitar Seguimiento XML</span>}
                  </span>
                  <Switch
                    label={p.label}
                    checked={isAdminRole || permisos[p.key]}
                    disabled={isAdminRole || dependsOnXml}
                    onChange={(value) => setPermisos((prev) => ({ ...prev, [p.key]: value }))}
                  />
                </div>
              );
            })}
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60">
              {saving ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
