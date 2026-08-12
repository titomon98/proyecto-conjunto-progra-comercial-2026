// Utilidades de sesion del modulo usuarios.
//
// Unico lugar del frontend que lee y escribe las llaves "token" y "usuario" de
// localStorage. Antes cada pantalla las manejaba por su cuenta y se
// contradecian: Login guardaba, App leia sin validar y Usuarios leia otra vez
// sin saber si lo guardado servia.

const LLAVE_TOKEN = 'token';
const LLAVE_USUARIO = 'usuario';

// El backend firma el token con expiresIn 8h (usuarios.service.js). Aqui se lee
// el "exp" del payload SIN verificar la firma: verificar es tarea del backend
// (auth.middleware.js). Esto solo sirve para no mandar peticiones que ya
// sabemos que van a responder 401.
export function tokenVencido(token) {
  if (!token) return true;

  const payload = token.split('.')[1];
  if (!payload) return true;

  try {
    // Un JWT viene en base64url: hay que devolver los caracteres cambiados y el
    // relleno "=" antes de que atob lo acepte.
    const base64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payload.length / 4) * 4, '=');

    const datos = JSON.parse(atob(base64));

    // Un token sin "exp" no caduca por si solo: que decida el backend.
    if (!datos.exp) return false;

    return datos.exp * 1000 <= Date.now();
  } catch {
    // Token con forma rara, o escrito por otra app en este mismo origen.
    return true;
  }
}

export function guardarSesion(token, usuario) {
  if (token) localStorage.setItem(LLAVE_TOKEN, token);
  if (usuario) localStorage.setItem(LLAVE_USUARIO, JSON.stringify(usuario));
}

export function limpiarSesion() {
  localStorage.removeItem(LLAVE_TOKEN);
  localStorage.removeItem(LLAVE_USUARIO);
}

// Devuelve el token solo si sigue vigente; si ya vencio deja la sesion limpia y
// devuelve null, para que quien lo pidio mande al usuario de vuelta al login.
export function leerToken() {
  const token = localStorage.getItem(LLAVE_TOKEN);

  if (tokenVencido(token)) {
    limpiarSesion();
    return null;
  }

  return token;
}
