import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Intentando login con:', email);
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login exitoso - useAuth manejará el estado');
      onLogin(); // Solo para callback, no es necesario para el estado
    } catch (err) {
      console.error('❌ Error de login:', err);
      let errorMessage = 'Error de autenticación. Verifica tus credenciales.';
      
      if (err.code === 'auth/invalid-email') {
        errorMessage = 'El formato del email es inválido.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No existe un usuario con este email.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'La contraseña es incorrecta.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión. Verifica tu internet.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-[#004C97] mb-6 text-center">
          Seguimiento XML Instituciones BICSA
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004C97]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004C97]"
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#004C97] text-white py-2 rounded-md hover:bg-[#003366] transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;