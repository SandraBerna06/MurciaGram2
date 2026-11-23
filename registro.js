/**
 * Registro · MurciaGram
 * Validación en cliente + creación de cuenta en Firebase o modo demo.
 */

import {
  MODO,
  ES_DEMO,
  obtenerSesion,
  registrar,
  traducirErrorAuth,
} from "./auth-service.js";
import {
  validarEmail,
  validarNombre,
  validarPassword,
  validarConfirmacion,
  validarFechaNacimiento,
  validarDireccion,
  validarCodigoPostal,
  validarCiudad,
  validarProvincia,
  validarTelefono,
  validarTerminos,
} from "./validacion.js";
import {
  actualizarAnio,
  actualizarIndicadoresPassword,
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

const form = document.getElementById("form-registro");
const boton = document.getElementById("btn-registro");
const estado = document.getElementById("form-status");

const campos = {
  nombre: { input: document.getElementById("nombre"), validador: (v) => validarNombre(v, "El nombre") },
  apellidos: { input: document.getElementById("apellidos"), validador: (v) => validarNombre(v, "Los apellidos") },
  email: { input: document.getElementById("email"), validador: validarEmail },
  password: { input: document.getElementById("password"), validador: validarPassword },
  password2: {
    input: document.getElementById("password2"),
    validador: (v) => validarConfirmacion(document.getElementById("password").value, v),
  },
  fechaNacimiento: { input: document.getElementById("fechaNacimiento"), validador: validarFechaNacimiento },
  telefono: { input: document.getElementById("telefono"), validador: validarTelefono },
  calle: { input: document.getElementById("calle"), validador: validarDireccion },
  codigoPostal: { input: document.getElementById("codigoPostal"), validador: validarCodigoPostal },
  ciudad: { input: document.getElementById("ciudad"), validador: validarCiudad },
  provincia: { input: document.getElementById("provincia"), validador: validarProvincia },
};

const terminos = document.getElementById("terminos");
const comunicaciones = document.getElementById("comunicaciones");
const password = document.getElementById("password");
const password2 = document.getElementById("password2");
const strength = document.getElementById("strength");
const strengthLabel = document.getElementById("strength-label");
const passwordRules = document.getElementById("password-rules");

let enviando = false;

function hoyISO() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

function inicializarFechas() {
  const campo = campos.fechaNacimiento.input;
  campo.max = hoyISO();
  campo.min = "1900-01-01";
}

function inicializarToggles() {
  document.querySelectorAll("[data-toggle-password]").forEach((botonToggle) => {
    const input = document.getElementById(botonToggle.dataset.togglePassword);
    configurarTogglePassword(botonToggle, input);
  });
}

function inicializarEventos() {
  Object.values(campos).forEach(({ input, validador }) => {
    const comprobar = () => {
      const contenedor = input.closest(".field, .check-field");
      if (contenedor?.classList.contains("is-invalid")) validarCampo(input, validador);
    };
    input.addEventListener("blur", () => validarCampo(input, validador));
    input.addEventListener("input", comprobar);
    input.addEventListener("change", comprobar);
  });

  password.addEventListener("input", () => {
    actualizarIndicadoresPassword(password, {
      strength,
      label: strengthLabel,
      rules: passwordRules,
    });
    if (password2.value) {
      validarCampo(password2.input, campos.password2.validador);
    }
  });

  terminos.addEventListener("change", () => {
    validarCampo(terminos, (_, input) => validarTerminos(input.checked));
  });

  comunicaciones.addEventListener("change", () => {
    limpiarErrorCampo(comunicaciones);
  });
}

function validarTodo() {
  const invalidos = [];
  Object.values(campos).forEach(({ input, validador }) => {
    if (!validarCampo(input, validador)) invalidos.push(input);
  });
  if (!validarCampo(terminos, (_, input) => validarTerminos(input.checked))) {
    invalidos.push(terminos);
  }
  return invalidos;
}

function datosDelFormulario() {
  return {
    nombre: campos.nombre.input.value.trim(),
    apellidos: campos.apellidos.input.value.trim(),
    email: campos.email.input.value.trim().toLowerCase(),
    password: campos.password.input.value,
    fechaNacimiento: campos.fechaNacimiento.input.value,
    telefono: campos.telefono.input.value.trim(),
    calle: campos.calle.input.value.trim(),
    codigoPostal: campos.codigoPostal.input.value.trim(),
    ciudad: campos.ciudad.input.value.trim(),
    provincia: campos.provincia.input.value.trim(),
    comunicaciones: comunicaciones.checked,
  };
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (enviando) return;
  ocultarAlerta(estado);

  const invalidos = validarTodo();
  if (invalidos.length > 0) {
    const cantidad = invalidos.length;
    mostrarAlerta(
      estado,
      "error",
      cantidad === 1
        ? "Revisa el campo marcado y vuelve a enviar el formulario."
        : `Revisa los ${cantidad} campos marcados y vuelve a enviar el formulario.`,
      "Hay datos que corregir",
    );
    enfocarPrimerError(form);
    return;
  }

  enviando = true;
  ponerCargando(boton, true, "Creando cuenta…");

  try {
    await registrar(datosDelFormulario());
    mostrarAlerta(
      estado,
      "success",
      ES_DEMO
        ? "Cuenta de demostración creada. Los datos se guardan solo en este navegador."
        : "Te hemos enviado un correo de verificación. Revisa tu bandeja de entrada y la carpeta de spam.",
      ES_DEMO ? "¡Bienvenido a MurciaGram!" : "Tu cuenta está lista",
    );
    estado.focus({ preventScroll: true });
    setTimeout(() => {
      window.location.assign("cuenta.html?alta=1");
    }, 1500);
  } catch (error) {
    console.error("[MurciaGram] Error de registro:", error);
    enviando = false;
    ponerCargando(boton, false);
    const { mensaje, campo } = traducirErrorAuth(error);
    mostrarAlerta(estado, "error", mensaje, "No se pudo crear la cuenta");
    if (campo && campos[campo]) {
      mostrarErrorCampo(campos[campo].input, mensaje);
      campos[campo].input.focus();
    } else {
      estado.focus({ preventScroll: true });
    }
    estado.scrollIntoView({ block: "center", behavior: "smooth" });
  }
});

async function iniciar() {
  actualizarAnio();
  aplicarModoDemo(ES_DEMO);
  inicializarFechas();
  inicializarToggles();
  inicializarEventos();
  actualizarIndicadoresPassword(password, { strength, label: strengthLabel, rules: passwordRules });

  // Si ya hay una sesión, no tiene sentido volver a registrarse.
  try {
    const sesion = await obtenerSesion();
    if (sesion) window.location.replace("cuenta.html");
  } catch (error) {
    console.warn("[MurciaGram] No se pudo comprobar la sesión:", error);
  }

  if (MODO === "demo") {
    console.info("[MurciaGram] Modo demostración activo: no se envía nada a Firebase.");
  }
}

iniciar();
