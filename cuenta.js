/**
 * Mi cuenta · MurciaGram
 * Protege la página, pinta el perfil y muestra el historial de accesos.
 */

import {
  ES_DEMO,
  cerrarSesion,
  enviarVerificacion,
  obtenerAccesos,
  obtenerPerfil,
  obtenerSesion,
  traducirErrorAuth,
} from "./auth-service.js";
import {
  actualizarAnio,
  aplicarModoDemo,
  formatearFecha,
  formatearFechaHora,
  iniciales,
  mostrarAlerta,
  ocultarAlerta,
  ponerCargando,
} from "./ui.js";

const estado = document.getElementById("account-status");
const listaAccesos = document.getElementById("access-list");
const accesosVacios = document.getElementById("access-empty");
const botonesSalir = document.querySelectorAll("[data-logout]");
const botonVerificar = document.getElementById("btn-verify");
const badgeVerificacion = document.getElementById("badge-verificacion");
const notaSeguridad = document.getElementById("security-note");
const cargando = document.getElementById("account-loading");
const contenido = document.getElementById("account-content");

function escribir(selector, valor) {
  document.querySelectorAll(selector).forEach((elemento) => {
    elemento.textContent = valor;
  });
}

function formatearNacimiento(valor) {
  if (!valor) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(valor))) {
    return new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(
      new Date(`${valor}T00:00:00`),
    );
  }
  return formatearFecha(valor);
}

function direccionCompleta(perfil) {
  const direccion = perfil?.direccion || {};
  const linea1 = direccion.calle || "";
  const linea2 = [direccion.codigoPostal, direccion.ciudad].filter(Boolean).join(" ");
  const linea3 = direccion.provincia || "";
  return [linea1, linea2, linea3].filter(Boolean).join(", ") || "—";
}

function renderPerfil(sesion, perfil) {
  const nombre = perfil?.nombre || "";
  const apellidos = perfil?.apellidos || "";
  const nombreCompleto = [nombre, apellidos].filter(Boolean).join(" ") || sesion.displayName || "Tu cuenta";
  const email = perfil?.email || sesion.email || "—";
  const consentimiento = perfil?.consentimiento;

  escribir("[data-user-name]", nombreCompleto);
  escribir("[data-user-email]", email);
  escribir("[data-user-initials]", iniciales(nombre, apellidos));
  escribir("[data-profile='nombre']", nombreCompleto);
  escribir("[data-profile='email']", email);
  escribir("[data-profile='nacimiento']", formatearNacimiento(perfil?.fechaNacimiento));
  escribir("[data-profile='telefono']", perfil?.telefono || "No indicado");
  escribir("[data-profile='direccion']", direccionCompleta(perfil));
  escribir(
    "[data-profile='comunicaciones']",
    perfil ? (perfil.comunicaciones ? "Sí, aceptadas" : "No") : "—",
  );
  escribir(
    "[data-profile='consentimiento']",
    consentimiento
      ? `Versión ${consentimiento.version || "1.0"} · ${formatearFecha(consentimiento.fecha)}`
      : "—",
  );
  escribir("[data-user-since]", formatearFecha(perfil?.creadoEn || sesion.metadata?.creationTime));

  document.title = `${nombreCompleto} · Mi cuenta · MurciaGram`;
}

function renderAccesos(accesos) {
  listaAccesos.replaceChildren();
  accesosVacios.hidden = accesos.length > 0;

  accesos.forEach((acceso) => {
    const item = document.createElement("li");
    item.className = "timeline__item";

    const punto = document.createElement("span");
    punto.className = "timeline__dot";
    punto.setAttribute("aria-hidden", "true");

    const cuerpo = document.createElement("div");
    const titulo = document.createElement("strong");
    titulo.className = "timeline__title";
    titulo.textContent = acceso.tipo === "registro" ? "Cuenta creada" : "Inicio de sesión";

    const fecha = document.createElement("time");
    fecha.className = "timeline__date";
    const fechaReal = acceso.fecha?.toDate?.() || (acceso.fecha ? new Date(acceso.fecha) : null);
    if (fechaReal && !Number.isNaN(fechaReal.getTime())) {
      fecha.dateTime = fechaReal.toISOString();
      fecha.textContent = formatearFechaHora(fechaReal);
    } else {
      fecha.textContent = "Fecha no disponible";
    }

    cuerpo.append(titulo, fecha);

    if (acceso.userAgent) {
      const meta = document.createElement("span");
      meta.className = "timeline__meta";
      const agente =
        String(acceso.userAgent).length > 82
          ? `${String(acceso.userAgent).slice(0, 82)}…`
          : String(acceso.userAgent);
      meta.textContent = `Navegador: ${agente}`;
      cuerpo.append(meta);
    }

    item.append(punto, cuerpo);
    listaAccesos.append(item);
  });
}

function renderUltimoAcceso(perfil, accesos) {
  const ultimo = accesos[0]?.fecha || perfil?.ultimoAcceso;
  const texto = ultimo ? formatearFechaHora(ultimo) : "—";
  escribir("[data-last-access]", texto);
  escribir("[data-access-count]", String(accesos.length));
}

function renderSeguridad(sesion, perfil) {
  if (ES_DEMO) {
    badgeVerificacion.hidden = true;
    botonVerificar.hidden = true;
    notaSeguridad.textContent =
      "Modo demostración: la contraseña se guarda como hash PBKDF2 en este navegador y no se envía a ningún servidor. Configura Firebase para probar la autenticación real.";
    return;
  }

  const verificado = Boolean(sesion.emailVerified);
  badgeVerificacion.hidden = false;
  badgeVerificacion.className = `badge ${verificado ? "badge--ok" : "badge--pending"}`;
  badgeVerificacion.textContent = verificado ? "Correo verificado" : "Correo sin verificar";
  botonVerificar.hidden = verificado;
  notaSeguridad.textContent = verificado
    ? "Tu correo está verificado. Firebase Authentication gestiona la contraseña; MurciaGram nunca la almacena en Firestore."
    : "Tu correo aún no está verificado. Revisa el mensaje que te enviamos al registrarte o solicita uno nuevo.";
  if (!perfil) {
    notaSeguridad.textContent +=
      " No se encontró el documento de perfil en Firestore: revisa que las reglas estén publicadas.";
  }
}

function mostrarMensajeDeEntrada() {
  const parametros = new URLSearchParams(window.location.search);
  if (parametros.get("alta") === "1") {
    mostrarAlerta(
      estado,
      "success",
      ES_DEMO
        ? "Cuenta de demostración creada. Puedes consultar el perfil y el historial guardados en este navegador."
        : "Tu cuenta se ha creado correctamente. Te hemos enviado un correo para verificar la dirección.",
      "¡Bienvenido a MurciaGram!",
    );
  } else if (parametros.get("bienvenida") === "1") {
    mostrarAlerta(
      estado,
      "success",
      "Has iniciado sesión correctamente. Este acceso ya aparece en tu historial.",
      "Sesión iniciada",
    );
  }
}

async function salir() {
  botonesSalir.forEach((boton) => {
    boton.disabled = true;
    boton.setAttribute("aria-busy", "true");
  });
  try {
    await cerrarSesion();
    window.location.replace("index.html");
  } catch (error) {
    console.error("[MurciaGram] Error al cerrar sesión:", error);
    botonesSalir.forEach((boton) => {
      boton.disabled = false;
      boton.removeAttribute("aria-busy");
    });
    mostrarAlerta(
      estado,
      "error",
      "No se pudo cerrar la sesión. Inténtalo de nuevo.",
      "Error al salir",
    );
  }
}

async function verificar() {
  ponerCargando(botonVerificar, true, "Enviando…");
  try {
    await enviarVerificacion();
    mostrarAlerta(
      estado,
      "success",
      "Te hemos enviado un nuevo correo de verificación. Revisa la bandeja de entrada y la carpeta de spam.",
      "Correo enviado",
    );
    estado.focus({ preventScroll: true });
  } catch (error) {
    console.error("[MurciaGram] Error al enviar la verificación:", error);
    const { mensaje } = traducirErrorAuth(error);
    mostrarAlerta(estado, "error", mensaje, "No se pudo enviar el correo");
  } finally {
    ponerCargando(botonVerificar, false);
  }
}

async function iniciar() {
  actualizarAnio();
  aplicarModoDemo(ES_DEMO);
  botonesSalir.forEach((boton) => boton.addEventListener("click", salir));
  botonVerificar.addEventListener("click", verificar);

  let sesion;
  try {
    sesion = await obtenerSesion();
  } catch (error) {
    console.error("[MurciaGram] Error al recuperar la sesión:", error);
    window.location.replace("login.html?sesion=requerida");
    return;
  }

  if (!sesion) {
    window.location.replace("login.html?sesion=requerida");
    return;
  }

  const [resultadoPerfil, resultadoAccesos] = await Promise.allSettled([
    obtenerPerfil(sesion.uid),
    obtenerAccesos(sesion.uid),
  ]);

  const perfil = resultadoPerfil.status === "fulfilled" ? resultadoPerfil.value : null;
  const accesos = resultadoAccesos.status === "fulfilled" ? resultadoAccesos.value : [];

  if (resultadoPerfil.status === "rejected") {
    console.error("[MurciaGram] No se pudo leer el perfil:", resultadoPerfil.reason);
    mostrarAlerta(
      estado,
      "error",
      "No se pudieron leer los datos del perfil. Comprueba que las reglas de Firestore estén publicadas y que tu sesión siga activa.",
      "Perfil no disponible",
    );
  }

  renderPerfil(sesion, perfil);
  renderAccesos(accesos);
  renderUltimoAcceso(perfil, accesos);
  renderSeguridad(sesion, perfil);
  mostrarMensajeDeEntrada();

  cargando.hidden = true;
  contenido.hidden = false;
}

iniciar();
