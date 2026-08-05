// Componente raiz de la aplicacion.
// Muestra el Login como pantalla principal del modulo de usuarios.

import Login from './modules/usuarios/Login';

export default function App() {
  const handleLoginSuccess = (data) => {
    console.log('Login exitoso:', data);
    // TODO: redirigir al dashboard o modulo principal
  };

  return <Login onLoginSuccess={handleLoginSuccess} />;
}
