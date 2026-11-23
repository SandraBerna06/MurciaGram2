/**
 * Validaciones puras · MurciaGram
 * Sin dependencias del DOM para poder probarlas y reutilizarlas.
 */

/** Expresión regular principal para el correo electrónico. */
export const EMAIL_REGEX =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;
export const EDAD_MINIMA = 14;

export function normalizarEmail(valor) {
  return String(valor ?? "").trim().toLowerCase();
}

export function validarEmail(valor) {
  const email = String(valor ?? "").trim();
  if (!email) return "Escribe tu correo electrónico.";
  if (email.length > 254) return "El correo electrónico es demasiado largo.";
  if (!EMAIL_REGEX.test(email)) {
    return "El correo no tiene un formato válido. Ejemplo: nombre@dominio.com";
  }
  const [local, dominio] = email.split("@");
  if (!local || local.length > 64) return "La parte anterior a la @ no es válida.";
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
    return "El correo no puede tener puntos consecutivos al principio o al final.";
  }
  if (!dominio || dominio.startsWith(".") || dominio.endsWith(".") || dominio.includes("..")) {
    return "El dominio del correo no es válido.";
  }
  return "";
}

/** Valida un nombre o apellido con letras Unicode, espacios, guiones y apóstrofos. */
export function validarNombre(valor, etiqueta = "El nombre") {
  const texto = String(valor ?? "").trim();
  if (!texto) return `Escribe ${etiqueta.toLowerCase()}.`;
  if (texto.length < 2) return `${etiqueta} debe tener al menos 2 caracteres.`;
  if (texto.length > 60) return `${etiqueta} no puede superar los 60 caracteres.`;
  if (!/^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u.test(texto)) {
    return `${etiqueta} solo puede contener letras, espacios, guiones y apóstrofos.`;
  }
  return "";
}

export function evaluarPassword(valor) {
  const texto = String(valor ?? "");
  return {
    length: texto.length >= PASSWORD_MIN,
    max: texto.length <= PASSWORD_MAX,
    lower: /[a-z]/.test(texto),
    upper: /[A-Z]/.test(texto),
    digit: /\d/.test(texto),
    symbol: /[^A-Za-z0-9]/.test(texto),
    long: texto.length >= 12,
  };
}

export function validarPassword(valor) {
  const texto = String(valor ?? "");
  if (!texto) return "Crea una contraseña.";
  if (texto.length < PASSWORD_MIN) return `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`;
  if (texto.length > PASSWORD_MAX) return `La contraseña no puede superar los ${PASSWORD_MAX} caracteres.`;
  const checks = evaluarPassword(texto);
  if (!checks.lower || !checks.upper || !checks.digit) {
    return "La contraseña debe incluir una minúscula, una mayúscula y un número.";
  }
  return "";
}

/** Puntuación orientativa de 0 a 4 para la barra de fortaleza. */
export function puntuarPassword(valor) {
  const texto = String(valor ?? "");
  if (!texto) return 0;
  const checks = evaluarPassword(texto);
  let score = [checks.length, checks.lower, checks.upper, checks.digit].filter(Boolean).length;
  if (score >= 3 && (checks.symbol || checks.long)) score += 1;
  if (!checks.length) score = 1;
  if (!checks.max) score = Math.min(score, 1);
  return Math.max(1, Math.min(4, score));
}

export function etiquetaFortaleza(score) {
  return {
    0: "Sin evaluar",
    1: "Débil",
    2: "Aceptable",
    3: "Buena",
    4: "Fuerte",
  }[score] ?? "Sin evaluar";
}

export function validarConfirmacion(password, confirmacion) {
  if (!String(confirmacion ?? "")) return "Repite la contraseña.";
  if (password !== confirmacion) return "Las contraseñas no coinciden. Revísalas.";
  return "";
}

/** Devuelve la edad cumplida o null si la fecha no es válida. */
export function calcularEdad(fechaISO) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fechaISO ?? ""))) return null;
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    return null;
  }
  const hoy = new Date();
  let edad = hoy.getFullYear() - anio;
  const diferenciaMes = hoy.getMonth() - (mes - 1);
  if (diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < dia)) edad -= 1;
  return edad;
}

export function validarFechaNacimiento(valor) {
  if (!valor) return "Indica tu fecha de nacimiento.";
  const edad = calcularEdad(valor);
  if (edad === null) return "La fecha de nacimiento no es válida.";
  if (edad < 0) return "La fecha de nacimiento no puede ser futura.";
  if (edad < EDAD_MINIMA) return `Debes tener al menos ${EDAD_MINIMA} años para crear una cuenta.`;
  if (edad > 120) return "Revisa la fecha: no parece una fecha real.";
  return "";
}

export function validarDireccion(valor) {
  const texto = String(valor ?? "").trim();
  if (!texto) return "Escribe tu dirección (calle y número).";
  if (texto.length < 5) return "La dirección es demasiado corta.";
  if (texto.length > 120) return "La dirección no puede superar los 120 caracteres.";
  if (!/[\p{L}\p{N}]/u.test(texto)) return "La dirección debe incluir letras o números.";
  return "";
}

export function validarCodigoPostal(valor) {
  const texto = String(valor ?? "").trim();
  if (!texto) return "Escribe el código postal.";
  if (!/^\d{5}$/.test(texto)) return "El código postal debe tener exactamente 5 dígitos.";
  return "";
}

export function validarCiudad(valor) {
  const texto = String(valor ?? "").trim();
  if (!texto) return "Escribe tu ciudad o municipio.";
  if (texto.length < 2) return "La ciudad debe tener al menos 2 caracteres.";
  if (texto.length > 60) return "La ciudad no puede superar los 60 caracteres.";
  return "";
}

export function validarProvincia(valor) {
  const texto = String(valor ?? "").trim();
  if (!texto) return "Indica la provincia.";
  if (texto.length < 2) return "La provincia no es válida.";
  if (texto.length > 60) return "La provincia no puede superar los 60 caracteres.";
  return "";
}

export function validarTelefono(valor) {
  const texto = String(valor ?? "").trim();
  if (!texto) return ""; // Opcional
  if (!/^\+?[\d\s().-]{7,20}$/.test(texto)) {
    return "El teléfono solo puede contener números, espacios, +, paréntesis y guiones.";
  }
  const digitos = texto.replace(/\D/g, "");
  if (digitos.length < 7 || digitos.length > 15) {
    return "El teléfono debe tener entre 7 y 15 dígitos.";
  }
  return "";
}

export function validarTerminos(aceptado) {
  return aceptado ? "" : "Debes aceptar la política de privacidad para crear la cuenta.";
}

export function validarLoginPassword(valor) {
  if (!String(valor ?? "")) return "Escribe tu contraseña.";
  return "";
}
