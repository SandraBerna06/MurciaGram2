/**
 * Servicio de autenticación · MurciaGram
 * ------------------------------------------------------------------
 * - Firebase Authentication + Cloud Firestore cuando `firebase-config.js`
 *   contiene una configuración real.
 * - Modo demostración local cuando no la contiene. En ese modo la
 *   contraseña NUNCA se guarda en claro: se deriva con PBKDF2-SHA-256
 *   y una sal aleatoria. Los datos viven solo en este navegador.
 *
 * API pública:
 *   MODO, registrar, iniciarSesion, cerrarSesion, obtenerSesion,
 *   obtenerPerfil, obtenerAccesos, enviarVerificacion,
 *   solicitarRestablecimiento, traducirErrorAuth
 */

import {
  firebaseConfig,
  isFirebaseConfigured,
  COLECCION_USUARIOS,
  SUBCOLECCION_ACCESOS,
  MAX_ACCESOS_VISIBLES,
} from "./firebase-config.js";
import { normalizarEmail } from "./validacion.js";

const VERSION_FIREBASE = "10.12.2";
const BASE_CDN = `https://www.gstatic.com/firebasejs/${VERSION_FIREBASE}`;
const CLAVE_USUARIOS_DEMO = "murciagram.demo.usuarios.v1";
const CLAVE_SESION_DEMO = "murciagram.demo.sesion.v1";
const ITERACIONES_PBKDF2 = 120000;
const VERSION_CONSENTIMIENTO = "1.0";
const MAX_ACCESOS_DEMO = 20;

export const MODO = isFirebaseConfigured ? "firebase" : "demo";
export const ES_DEMO = MODO === "demo";

let promesaFirebase = null;

function cargarFirebase() {
  if (!isFirebaseConfigured) return Promise.resolve(null);
  if (!promesaFirebase) {
    promesaFirebase = (async () => {
      const [appMod, authMod, fsMod] = await Promise.all([
        import(`${BASE_CDN}/firebase-app.js`),
        import(`${BASE_CDN}/firebase-auth.js`),
        import(`${BASE_CDN}/firebase-firestore.js`),
      ]);
      const app = appMod.initializeApp(firebaseConfig);
      return {
        authMod,
        fsMod,
        auth: authMod.getAuth(app),
        db: fsMod.getFirestore(app),
      };
    })().catch((error) => {
      promesaFirebase = null;
      console.error("[MurciaGram] No se pudo inicializar Firebase:", error);
      throw crearError(
        "firebase/carga",
        "No se pudo cargar Firebase. Revisa tu conexión y la configuración del proyecto.",
      );
    });
  }
  return promesaFirebase;
}

/* ============================================================
   Utilidades internas
   ============================================================ */

function crearError(codigo, mensaje) {
  const error = new Error(mensaje);
  error.code = codigo;
  return error;
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ahoraISO() {
  return new Date().toISOString();
}

function infoDispositivo() {
  return String(navigator.userAgent || "").slice(0, 160);
}

function idAleatorio() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function bytesABase64(bytes) {
  let binario = "";
  bytes.forEach((byte) => {
    binario += String.fromCharCode(byte);
  });
  return btoa(binario);
}

function base64ABytes(base64) {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i += 1) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

async function hashPassword(password, saltBase64) {
  if (!globalThis.crypto?.subtle) {
    throw crearError(
      "demo/crypto",
      "El modo demostración necesita abrirse desde localhost o HTTPS. Usa Live Server o `npx serve .`.",
    );
  }
  const encoder = new TextEncoder();
  const clave = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: base64ABytes(saltBase64),
      iterations: ITERACIONES_PBKDF2,
      hash: "SHA-256",
    },
    clave,
    256,
  );
  return bytesABase64(new Uint8Array(bits));
}

function leerUsuariosDemo() {
  try {
    const bruto = localStorage.getItem(CLAVE_USUARIOS_DEMO);
    const datos = bruto ? JSON.parse(bruto) : {};
    return datos && typeof datos === "object" ? datos : {};
  } catch (error) {
    console.warn("[MurciaGram] No se pudo leer el almacenamiento demo:", error);
    return {};
  }
}

function guardarUsuariosDemo(usuarios) {
  localStorage.setItem(CLAVE_USUARIOS_DEMO, JSON.stringify(usuarios));
}

function guardarSesionDemo(uid, recordar) {
  localStorage.removeItem(CLAVE_SESION_DEMO);
  sessionStorage.removeItem(CLAVE_SESION_DEMO);
  const almacen = recordar ? localStorage : sessionStorage;
  almacen.setItem(CLAVE_SESION_DEMO, JSON.stringify({ uid, creadoEn: ahoraISO() }));
}

function limpiarSesionDemo() {
  localStorage.removeItem(CLAVE_SESION_DEMO);
  sessionStorage.removeItem(CLAVE_SESION_DEMO);
}

function uidSesionDemo() {
  for (const almacen of [localStorage, sessionStorage]) {
    try {
      const bruto = almacen.getItem(CLAVE_SESION_DEMO);
      if (!bruto) continue;
      const sesion = JSON.parse(bruto);
      if (sesion?.uid) return sesion.uid;
    } catch {
      /* Sesión corrupta: se ignora y se limpia al final. */
    }
  }
  return null;
}

function perfilDemoPublico(usuario) {
  if (!usuario) return null;
  const { passwordHash, salt, ...publico } = usuario;
  return publico;
}

function datosPerfil(datos) {
  return {
    nombre: datos.nombre.trim(),
    apellidos: datos.apellidos.trim(),
    email: normalizarEmail(datos.email),
    fechaNacimiento: datos.fechaNacimiento,
    telefono: datos.telefono?.trim() || null,
    direccion: {
      calle: datos.calle.trim(),
      codigoPostal: datos.codigoPostal.trim(),
      ciudad: datos.ciudad.trim(),
      provincia: datos.provincia.trim(),
    },
    comunicaciones: Boolean(datos.comunicaciones),
    consentimiento: {
      aceptado: true,
      fecha: ahoraISO(),
      version: VERSION_CONSENTIMIENTO,
    },
  };
}

/* ============================================================
   Implementación del modo demostración
   ============================================================ */

async function demoRegistrar(datos) {
  await esperar(550);
  const usuarios = leerUsuariosDemo();
  const email = normalizarEmail(datos.email);
  const existente = Object.values(usuarios).find((usuario) => usuario.email === email);
  if (existente) {
    throw crearError("demo/duplicado", "Ya existe una cuenta de demostración con ese correo.");
  }

  const salt = bytesABase64(globalThis.crypto.getRandomValues(new Uint8Array(16)));
  const passwordHash = await hashPassword(datos.password, salt);
  const uid = `demo_${idAleatorio()}`;
  const fecha = ahoraISO();
  const base = datosPerfil(datos);

  const usuario = {
    uid,
    ...base,
    consentimiento: { ...base.consentimiento, fecha },
    passwordHash,
    salt,
    creadoEn: fecha,
    actualizadoEn: fecha,
    ultimoAcceso: fecha,
    verificado: false,
    accesos: [
      {
        id: idAleatorio(),
        tipo: "registro",
        fecha,
        userAgent: infoDispositivo(),
      },
    ],
  };

  usuarios[uid] = usuario;
  guardarUsuariosDemo(usuarios);
  guardarSesionDemo(uid, true);
  return { user: perfilDemoPublico(usuario) };
}

async function demoIniciarSesion({ email, password, recordar }) {
  await esperar(500);
  const usuarios = leerUsuariosDemo();
  const usuario = Object.values(usuarios).find(
    (candidato) => candidato.email === normalizarEmail(email),
  );
  if (!usuario) {
    throw crearError("demo/credenciales", "El correo o la contraseña no son correctos.");
  }
  const hash = await hashPassword(password, usuario.salt);
  if (hash !== usuario.passwordHash) {
    throw crearError("demo/credenciales", "El correo o la contraseña no son correctos.");
  }

  const fecha = ahoraISO();
  usuario.ultimoAcceso = fecha;
  usuario.actualizadoEn = fecha;
  usuario.accesos = [
    { id: idAleatorio(), tipo: "login", fecha, userAgent: infoDispositivo() },
    ...(Array.isArray(usuario.accesos) ? usuario.accesos : []),
  ].slice(0, MAX_ACCESOS_DEMO);
  usuarios[usuario.uid] = usuario;
  guardarUsuariosDemo(usuarios);
  guardarSesionDemo(usuario.uid, Boolean(recordar));
  return { user: perfilDemoPublico(usuario) };
}

/* ============================================================
   Implementación de Firebase
   ============================================================ */

async function firebaseActual() {
  const fb = await cargarFirebase();
  if (!fb) throw crearError("firebase/no-configurado", "Firebase no está configurado.");
  if (typeof fb.auth.authStateReady === "function") await fb.auth.authStateReady();
  else {
    await new Promise((resolve) => {
      const unsubscribe = fb.authMod.onAuthStateChanged(fb.auth, () => {
        unsubscribe();
        resolve();
      });
    });
  }
  return fb;
}

function usuarioFirebasePublico(user) {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    emailVerified: Boolean(user.emailVerified),
    provider: "firebase",
    metadata: {
      creationTime: user.metadata?.creationTime || null,
      lastSignInTime: user.metadata?.lastSignInTime || null,
    },
  };
}

async function registrarAccesoFirebase(fb, uid, tipo) {
  const { addDoc, collection, serverTimestamp } = fb.fsMod;
  try {
    await addDoc(collection(fb.db, COLECCION_USUARIOS, uid, SUBCOLECCION_ACCESOS), {
      tipo,
      fecha: serverTimestamp(),
      userAgent: infoDispositivo(),
    });
  } catch (error) {
    // El acceso no debe impedir el registro o el login si falla el historial.
    console.warn("[MurciaGram] No se pudo registrar el acceso:", error?.code || error);
  }
}

async function firebaseRegistrar(datos) {
  const fb = await firebaseActual();
  const { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } = fb.authMod;
  const { doc, setDoc, serverTimestamp } = fb.fsMod;

  let credencial;
  try {
    credencial = await createUserWithEmailAndPassword(fb.auth, datos.email, datos.password);
  } catch (error) {
    // Normaliza errores antiguos y nuevos de Firebase Auth.
    if (error?.code === "auth/invalid-login-credentials") error.code = "auth/invalid-credential";
    throw error;
  }

  const base = datosPerfil(datos);
  try {
    await updateProfile(credencial.user, {
      displayName: `${base.nombre} ${base.apellidos}`.trim(),
    });

    await setDoc(doc(fb.db, COLECCION_USUARIOS, credencial.user.uid), {
      ...base,
      consentimiento: {
        aceptado: true,
        fecha: serverTimestamp(),
        version: VERSION_CONSENTIMIENTO,
      },
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
      ultimoAcceso: serverTimestamp(),
    });

    await registrarAccesoFirebase(fb, credencial.user.uid, "registro");

    // Un fallo al enviar la verificación no invalida la cuenta creada.
    sendEmailVerification(credencial.user).catch((error) => {
      console.warn("[MurciaGram] No se pudo enviar la verificación:", error?.code || error);
    });

    return { user: usuarioFirebasePublico(credencial.user) };
  } catch (error) {
    console.error("[MurciaGram] Error al guardar el perfil:", error);
    throw crearError(
      "auth/perfil-no-guardado",
      "La cuenta se creó, pero no se pudieron guardar los datos del perfil. Revisa las reglas de Firestore o contacta con soporte.",
    );
  }
}

async function firebaseIniciarSesion({ email, password, recordar }) {
  const fb = await firebaseActual();
  const {
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    signInWithEmailAndPassword,
  } = fb.authMod;
  const { doc, updateDoc, serverTimestamp } = fb.fsMod;

  await setPersistence(
    fb.auth,
    recordar ? browserLocalPersistence : browserSessionPersistence,
  );
  const credencial = await signInWithEmailAndPassword(fb.auth, email, password);
  await registrarAccesoFirebase(fb, credencial.user.uid, "login");

  try {
    await updateDoc(doc(fb.db, COLECCION_USUARIOS, credencial.user.uid), {
      ultimoAcceso: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  } catch (error) {
    console.warn("[MurciaGram] No se pudo actualizar el último acceso:", error?.code || error);
  }

  return { user: usuarioFirebasePublico(credencial.user) };
}

/* ============================================================
   API pública
   ============================================================ */

export async function registrar(datos) {
  return ES_DEMO ? demoRegistrar(datos) : firebaseRegistrar(datos);
}

export async function iniciarSesion({ email, password, recordar = false }) {
  return ES_DEMO
    ? demoIniciarSesion({ email, password, recordar })
    : firebaseIniciarSesion({ email, password, recordar });
}

export async function cerrarSesion() {
  if (ES_DEMO) {
    limpiarSesionDemo();
    return;
  }
  const fb = await firebaseActual();
  await fb.authMod.signOut(fb.auth);
}

export async function obtenerSesion() {
  if (ES_DEMO) {
    const uid = uidSesionDemo();
    if (!uid) return null;
    const usuario = leerUsuariosDemo()[uid];
    if (!usuario) {
      limpiarSesionDemo();
      return null;
    }
    return {
      uid: usuario.uid,
      email: usuario.email,
      displayName: `${usuario.nombre} ${usuario.apellidos}`.trim(),
      emailVerified: false,
      provider: "demo",
      metadata: { creationTime: usuario.creadoEn, lastSignInTime: usuario.ultimoAcceso },
    };
  }
  const fb = await firebaseActual();
  return usuarioFirebasePublico(fb.auth.currentUser);
}

export async function obtenerPerfil(uid) {
  if (!uid) return null;
  if (ES_DEMO) return perfilDemoPublico(leerUsuariosDemo()[uid] || null);
  const fb = await firebaseActual();
  const { doc, getDoc } = fb.fsMod;
  const instantanea = await getDoc(doc(fb.db, COLECCION_USUARIOS, uid));
  return instantanea.exists() ? { uid: instantanea.id, ...instantanea.data() } : null;
}

export async function obtenerAccesos(uid) {
  if (!uid) return [];
  if (ES_DEMO) {
    const usuario = leerUsuariosDemo()[uid];
    return Array.isArray(usuario?.accesos) ? [...usuario.accesos] : [];
  }
  const fb = await firebaseActual();
  const { collection, query, orderBy, limit, getDocs } = fb.fsMod;
  const consulta = query(
    collection(fb.db, COLECCION_USUARIOS, uid, SUBCOLECCION_ACCESOS),
    orderBy("fecha", "desc"),
    limit(MAX_ACCESOS_VISIBLES),
  );
  const resultado = await getDocs(consulta);
  return resultado.docs.map((documento) => ({ id: documento.id, ...documento.data() }));
}

export async function enviarVerificacion() {
  if (ES_DEMO) {
    throw crearError(
      "demo/no-disponible",
      "El modo demostración no envía correos. Configura Firebase para verificar direcciones reales.",
    );
  }
  const fb = await firebaseActual();
  if (!fb.auth.currentUser) {
    throw crearError("auth/no-sesion", "No hay una sesión activa.");
  }
  await fb.authMod.sendEmailVerification(fb.auth.currentUser);
}

export async function recargarVerificacion() {
  if (ES_DEMO) return false;
  const fb = await firebaseActual();
  if (!fb.auth.currentUser) return false;
  await fb.auth.currentUser.reload();
  return Boolean(fb.auth.currentUser.emailVerified);
}

export async function solicitarRestablecimiento(email) {
  if (ES_DEMO) {
    throw crearError(
      "demo/no-disponible",
      "El modo demostración no envía correos de recuperación. Configura Firebase para usar esta función.",
    );
  }
  const fb = await firebaseActual();
  await fb.authMod.sendPasswordResetEmail(fb.auth, normalizarEmail(email));
}

/* ============================================================
   Traducción de errores para la interfaz
   ============================================================ */

export function traducirErrorAuth(error) {
  const codigo = String(error?.code || "");
  const generico = {
    mensaje: "No se pudo completar la operación. Inténtalo de nuevo en unos minutos.",
    campo: null,
  };

  const tabla = {
    "auth/email-already-in-use": {
      mensaje: "Ya existe una cuenta con este correo. Prueba a iniciar sesión.",
      campo: "email",
    },
    "auth/invalid-email": {
      mensaje: "El correo electrónico no tiene un formato válido.",
      campo: "email",
    },
    "auth/weak-password": {
      mensaje: "La contraseña es demasiado débil. Usa al menos 8 caracteres con mayúsculas, minúsculas y números.",
      campo: "password",
    },
    "auth/missing-password": {
      mensaje: "Escribe tu contraseña.",
      campo: "password",
    },
    "auth/user-not-found": {
      mensaje: "El correo o la contraseña no son correctos.",
      campo: null,
    },
    "auth/wrong-password": {
      mensaje: "El correo o la contraseña no son correctos.",
      campo: null,
    },
    "auth/invalid-credential": {
      mensaje: "El correo o la contraseña no son correctos.",
      campo: null,
    },
    "auth/user-disabled": {
      mensaje: "Esta cuenta está deshabilitada. Contacta con soporte si crees que es un error.",
      campo: null,
    },
    "auth/too-many-requests": {
      mensaje: "Demasiados intentos seguidos. Espera unos minutos antes de volver a probar.",
      campo: null,
    },
    "auth/network-request-failed": {
      mensaje: "No hay conexión con el servicio de autenticación. Revisa tu red e inténtalo de nuevo.",
      campo: null,
    },
    "auth/operation-not-allowed": {
      mensaje: "El acceso con correo y contraseña no está habilitado en Firebase Authentication.",
      campo: null,
    },
    "auth/unauthorized-domain": {
      mensaje: "Este dominio no está autorizado en Firebase Authentication. Añádelo en la consola de Firebase.",
      campo: null,
    },
    "auth/requires-recent-login": {
      mensaje: "Por seguridad, vuelve a iniciar sesión antes de realizar esta operación.",
      campo: null,
    },
    "auth/perfil-no-guardado": {
      mensaje: error?.message || generico.mensaje,
      campo: null,
    },
    "firebase/carga": {
      mensaje: error?.message || generico.mensaje,
      campo: null,
    },
    "firebase/no-configurado": {
      mensaje: "Firebase no está configurado. Revisa js/firebase-config.js.",
      campo: null,
    },
    "demo/duplicado": {
      mensaje: "Ya existe una cuenta de demostración con este correo. Inicia sesión o usa otro correo.",
      campo: "email",
    },
    "demo/credenciales": {
      mensaje: "El correo o la contraseña no son correctos.",
      campo: null,
    },
    "demo/no-disponible": {
      mensaje: error?.message || "Esta función no está disponible en modo demostración.",
      campo: null,
    },
    "demo/crypto": {
      mensaje: error?.message || "El modo demostración necesita un contexto seguro (localhost o HTTPS).",
      campo: null,
    },
    "permission-denied": {
      mensaje: "No tienes permisos para leer o escribir estos datos. Revisa las reglas de Firestore.",
      campo: null,
    },
    unavailable: {
      mensaje: "No se pudo conectar con Firestore. Comprueba tu conexión y que la base de datos esté creada.",
      campo: null,
    },
  };

  return tabla[codigo] || { ...generico, mensaje: error?.message || generico.mensaje };
}
