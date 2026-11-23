/**
 * Inicio de sesión · MurciaGram
 * Validación en cliente, persistencia opcional y recuperación de contraseña.
 */

import {
  ES_DEMO,
  iniciarSesion,
  obtenerSesion,
  solicitarRestablecimiento,
  traducirErrorAuth,
} from "./auth-service.js";
import { validarEmail, validarLoginPassword } from "./validacion.js";
import {
  actualizarAnio,
  aplicarModoDemo,
  configurarTogglePassword,
  enfocarPrimerError,
  limpiarErrorCampo,
  mostrarAlerta,
  mostrarErrorCampo,
  ocultarAlerta,
  ponerCargando,
  validarCampo,
} from "./ui.js";

const form = document.getElementById("form-login");
const boton = document.getElementById("btn-login");
const estado = document.getElementById("form-status");
const email = document.getElementById("email");
const password = document.getElementById("password");
const recordar = document.getElementById("recordar");
const dialog = document.getElementById("dialog-reset");
const btnOlvide = document.getElementById("btn-olvide");
const btnCerrarDialogo = document.getElementById("btn-cerrar-reset");
const formReset = document.getElementById("form-reset");
const emailReset = document.getElementById("email-reset");
const estadoReset = document.getElementById("reset-status");
const botonReset = document.getElementById("btn-reset");

const campos = {
  email: { input: email, validador: validarEmail },
  password: { input: password, validador: validarLoginPassword },
};

let enviando = false;

function inicializarToggles() {
  document.querySelectorAll("[data-toggle-password]").forEach((botonToggle) => {
    const input = document.getElementById(botonToggle.dataset.togglePassword);
    configurarTogglePassword(botonToggle, input);
  });
}

function inicializarEventos() {
  Object.values(campos).forEach(({ input, validador }) => {
    input.addEventListener("blur", () => validarCampo(input, validador));
    input.addEventListener("input", () => {
      const contenedor = input.closest(".field");
      if (contenedor?.classList.contains("is-invalid")) validarCampo(input, validador);
    });
  });
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (enviando) return;
  ocultarAlerta(estado);

  const invalidos = [];
  Object.values(campos).forEach(({ input, validador }) => {
    if (!validarCampo(input, validador)) invalidos.push(input);
  });

  if (invalidos.length > 0) {
    mostrarAlerta(
      estado,
      "error",
      "Revisa el correo y la contraseña antes de continuar.",
      "Faltan datos",
    );
    enfocarPrimerError(form);
    return;
  }

  enviando = true;
  ponerCargando(boton, true, "Entrando…");

  try {
    await iniciarSesion({
      email: email.value.trim().toLowerCase(),
      password: password.value,
      recordar: recordar.checked,
    });
    window.location.assign("cuenta.html?bienvenida=1");
  } catch (error) {
    console.error("[MurciaGram] Error de acceso:", error);
    enviando = false;
    ponerCargando(boton, false);
    const { mensaje, campo } = traducirErrorAuth(error);
    mostrarAlerta(estado, "error", mensaje, "No se pudo iniciar sesión");
    if (campo && campos[campo]) {
      mostrarErrorCampo(campos[campo].input, mensaje);
      campos[campo].input.focus();
    } else {
      estado.focus({ preventScroll: true });
    }
    estado.scrollIntoView({ block: "center", behavior: "smooth" });
  }
});

/* ===== Recuperación de contraseña ===== */

function abrirDialogo() {
  ocultarAlerta(estadoReset);
  limpiarErrorCampo(emailReset);
  if (validarEmail(email.value) === "") emailReset.value = email.value.trim();
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  emailReset.focus({ preventScroll: true });
}

function cerrarDialogo() {
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

btnOlvide.addEventListener("click", abrirDialogo);
btnCerrarDialogo.addEventListener("click", cerrarDialogo);
dialog.addEventListener("click", (evento) => {
  if (evento.target === dialog) cerrarDialogo();
});

emailReset.addEventListener("blur", () => validarCampo(emailReset, validarEmail));
emailReset.addEventListener("input", () => {
  const contenedor = emailReset.closest(".field");
  if (contenedor?.classList.contains("is-invalid")) validarCampo(emailReset, validarEmail);
});

formReset.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  ocultarAlerta(estadoReset);
  if (!validarCampo(emailReset, validarEmail)) {
    enfocarPrimerError(formReset);
    return;
  }

  ponerCargando(botonReset, true, "Enviando…");
  try {
    await solicitarRestablecimiento(emailReset.value.trim().toLowerCase());
    mostrarAlerta(
      estadoReset,
      "success",
      "Si el correo está registrado, recibirás un enlace para elegir una nueva contraseña. Revisa también la carpeta de spam.",
      "Correo enviado",
    );
    formReset.querySelector("button[type='submit']")?.blur();
  } catch (error) {
    console.error("[MurciaGram] Error al solicitar el restablecimiento:", error);
    const { mensaje } = traducirErrorAuth(error);
    mostrarAlerta(estadoReset, "error", mensaje, "No se pudo enviar el correo");
  } finally {
    ponerCargando(botonReset, false);
  }
});

/* ===== Arranque ===== */

async function iniciar() {
  actualizarAnio();
  aplicarModoDemo(ES_DEMO);
  inicializarToggles();
  inicializarEventos();

  const parametros = new URLSearchParams(window.location.search);
  if (parametros.get("sesion") === "requerida") {
    mostrarAlerta(
      estado,
      "info",
      "Inicia sesión para consultar tu cuenta y tu historial de accesos.",
      "Necesitas una sesión",
    );
  }

  try {
    const sesion = await obtenerSesion();
    if (sesion) window.location.replace("cuenta.html");
  } catch (error) {
    console.warn("[MurciaGram] No se pudo comprobar la sesión:", error);
  }
}

iniciar();
