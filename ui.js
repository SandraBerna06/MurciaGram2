/**
 * Utilidades de interfaz · MurciaGram
 * Errores de campo, avisos, carga, contraseñas visibles y formato de fechas.
 */

export const ICONOS = {
  error: "i-alert",
  success: "i-check",
  info: "i-info",
};

function contenedorDe(input) {
  return input.closest(".field, .check-field");
}

/** Marca un campo como inválido y escribe el mensaje bajo el control. */
export function mostrarErrorCampo(input, mensaje) {
  const contenedor = contenedorDe(input);
  if (!contenedor) return;
  contenedor.classList.add("is-invalid");
  contenedor.classList.remove("is-valid");
  input.setAttribute("aria-invalid", "true");
  input.setCustomValidity(mensaje || "Valor no válido");
  const error = contenedor.querySelector(".field__error");
  if (error) error.textContent = mensaje;
}

/** Limpia el estado de error y, si se pide, marca el campo como válido. */
export function limpiarErrorCampo(input, marcarValido = false) {
  const contenedor = contenedorDe(input);
  if (!contenedor) return;
  contenedor.classList.remove("is-invalid");
  contenedor.classList.toggle("is-valid", Boolean(marcarValido));
  input.removeAttribute("aria-invalid");
  input.setCustomValidity("");
  const error = contenedor.querySelector(".field__error");
  if (error) error.textContent = "";
}

/**
 * Valida un control con una función (valor) => mensaje.
 * Devuelve true si es válido.
 */
export function validarCampo(input, validador, opciones = {}) {
  const mensaje = validador(input.value, input);
  if (mensaje) {
    mostrarErrorCampo(input, mensaje);
    return false;
  }
  const tieneValor = input.type === "checkbox" ? input.checked : String(input.value).trim() !== "";
  limpiarErrorCampo(input, opciones.marcarValido !== false && tieneValor);
  return true;
}

/** Lleva el foco al primer control inválido del formulario. */
export function enfocarPrimerError(formulario) {
  const invalido = formulario.querySelector(
    ".is-invalid input, .is-invalid select, .is-invalid textarea, [aria-invalid='true']",
  );
  if (invalido) {
    invalido.focus({ preventScroll: false });
    invalido.scrollIntoView({ block: "center", behavior: "smooth" });
  }
}

/** Muestra un aviso global dentro de un contenedor con role="alert". */
export function mostrarAlerta(elemento, tipo, mensaje, titulo = "") {
  if (!elemento) return;
  const icono = ICONOS[tipo] ?? ICONOS.info;
  elemento.hidden = false;
  elemento.className = `form-alert form-alert--${tipo}`;
  elemento.replaceChildren();

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "icon");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `#${icono}`);
  svg.append(use);

  const cuerpo = document.createElement("div");
  if (titulo) {
    const strong = document.createElement("strong");
    strong.textContent = titulo;
    cuerpo.append(strong);
  }
  const parrafo = document.createElement("p");
  parrafo.textContent = mensaje;
  cuerpo.append(parrafo);

  elemento.append(svg, cuerpo);
}

export function ocultarAlerta(elemento) {
  if (!elemento) return;
  elemento.hidden = true;
  elemento.replaceChildren();
}

/** Cambia el botón a estado de carga y lo restaura al terminar. */
export function ponerCargando(boton, cargando, texto = "Procesando…") {
  if (!boton) return;
  if (cargando) {
    boton.dataset.htmlOriginal = boton.innerHTML;
    boton.disabled = true;
    boton.setAttribute("aria-busy", "true");
    boton.replaceChildren();
    const spinner = document.createElement("span");
    spinner.className = "spinner";
    spinner.setAttribute("aria-hidden", "true");
    const etiqueta = document.createElement("span");
    etiqueta.textContent = texto;
    boton.append(spinner, etiqueta);
  } else {
    if (boton.dataset.htmlOriginal) boton.innerHTML = boton.dataset.htmlOriginal;
    boton.disabled = false;
    boton.removeAttribute("aria-busy");
    delete boton.dataset.htmlOriginal;
  }
}

/** Añade el comportamiento de mostrar/ocultar a un botón y su input. */
export function configurarTogglePassword(boton, input) {
  if (!boton || !input) return;
  const actualizar = (visible) => {
    input.type = visible ? "text" : "password";
    boton.setAttribute("aria-pressed", String(visible));
    const etiqueta = visible ? "Ocultar contraseña" : "Mostrar contraseña";
    boton.setAttribute("aria-label", etiqueta);
    boton.title = etiqueta;
    const use = boton.querySelector("use");
    if (use) use.setAttribute("href", visible ? "#i-eye-off" : "#i-eye");
    input.focus({ preventScroll: true });
    try {
      const fin = input.value.length;
      input.setSelectionRange(fin, fin);
    } catch {
      /* Algunos navegadores no permiten selección en type=password. */
    }
  };
  boton.addEventListener("click", () => {
    actualizar(input.type === "password");
  });
}

/** Actualiza barras, etiqueta y lista de requisitos de la contraseña. */
export function actualizarIndicadoresPassword(input, { strength, label, rules } = {}) {
  const valor = String(input?.value ?? "");
  if (strength) {
    const score = puntuarPasswordLocal(valor);
    strength.dataset.score = String(score);
    if (label) {
      label.textContent = valor
        ? `Seguridad de la contraseña: ${etiquetaFortalezaLocal(score).toLowerCase()}`
        : "Seguridad de la contraseña: sin evaluar";
    }
  }
  if (rules) {
    const checks = evaluarPasswordLocal(valor);
    const reglas = [
      ["length", checks.length],
      ["lower", checks.lower],
      ["upper", checks.upper],
      ["digit", checks.digit],
    ];
    reglas.forEach(([nombre, cumple]) => {
      const item = rules.querySelector(`[data-rule="${nombre}"]`);
      if (item) item.classList.toggle("is-met", cumple && valor.length > 0);
    });
  }
}

// Copias locales mínimas para evitar una dependencia circular con validacion.js.
function evaluarPasswordLocal(valor) {
  return {
    length: valor.length >= 8,
    max: valor.length <= 64,
    lower: /[a-z]/.test(valor),
    upper: /[A-Z]/.test(valor),
    digit: /\d/.test(valor),
    symbol: /[^A-Za-z0-9]/.test(valor),
    long: valor.length >= 12,
  };
}
function puntuarPasswordLocal(valor) {
  if (!valor) return 0;
  const checks = evaluarPasswordLocal(valor);
  let score = [checks.length, checks.lower, checks.upper, checks.digit].filter(Boolean).length;
  if (score >= 3 && (checks.symbol || checks.long)) score += 1;
  if (!checks.length) score = 1;
  if (!checks.max) score = Math.min(score, 1);
  return Math.max(1, Math.min(4, score));
}
function etiquetaFortalezaLocal(score) {
  return { 0: "Sin evaluar", 1: "Débil", 2: "Aceptable", 3: "Buena", 4: "Fuerte" }[score] ?? "Sin evaluar";
}

/** Muestra u oculta los avisos de modo demostración. */
export function aplicarModoDemo(esDemo) {
  document.querySelectorAll("[data-demo-banner]").forEach((elemento) => {
    elemento.hidden = !esDemo;
  });
  document.querySelectorAll("[data-modo-firebase]").forEach((elemento) => {
    elemento.hidden = esDemo;
  });
  document.querySelectorAll("[data-modo-demo]").forEach((elemento) => {
    elemento.hidden = !esDemo;
  });
}

/** Convierte Timestamp de Firestore, ISO o Date en Date. */
export function aFecha(valor) {
  if (!valor) return null;
  if (typeof valor.toDate === "function") return valor.toDate();
  if (valor instanceof Date) return valor;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export function formatearFecha(valor) {
  const fecha = aFecha(valor);
  if (!fecha) return "—";
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(fecha);
}

export function formatearFechaHora(valor) {
  const fecha = aFecha(valor);
  if (!fecha) return "—";
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(fecha);
}

export function iniciales(nombre = "", apellidos = "") {
  const partes = `${nombre} ${apellidos}`.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "MG";
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

/** Rellena todos los elementos [data-year] con el año actual. */
export function actualizarAnio() {
  const anio = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach((elemento) => {
    elemento.textContent = anio;
  });
}
