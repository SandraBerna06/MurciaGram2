/**
 * Configuración pública de Firebase · MurciaGram
 * ------------------------------------------------------------------
 * 1. Crea un proyecto en https://console.firebase.google.com/
 * 2. Añade una app web (</>).
 * 3. Copia el objeto firebaseConfig que muestra la consola y sustituye
 *    los valores de ejemplo de este archivo.
 * 4. Activa Authentication > Correo electrónico/contraseña y crea
 *    Cloud Firestore. Publica las reglas de `firestore.rules`.
 *
 * La configuración web de Firebase NO es un secreto: la protección real
 * está en las reglas de Firestore y en los dominios autorizados de Auth.
 * No pegues aquí claves de servicio ni credenciales de administrador.
 *
 * Mientras los valores sigan siendo los de ejemplo, la aplicación
 * funciona en MODO DEMOSTRACIÓN y guarda los datos solo en este navegador.
 */

export const firebaseConfig = {
  apiKey: "PEGA_AQUI_TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.firebasestorage.app",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
};

const VALORES_DE_EJEMPLO = new Set([
  "PEGA_AQUI_TU_API_KEY",
  "TU_PROYECTO.firebaseapp.com",
  "TU_PROYECTO",
  "TU_PROYECTO.firebasestorage.app",
  "TU_SENDER_ID",
  "TU_APP_ID",
]);

/** true solo cuando todos los valores son reales y no de ejemplo. */
export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (valor) => typeof valor === "string" && valor.trim() !== "" && !VALORES_DE_EJEMPLO.has(valor),
);

/** Nombres de colecciones y límites compartidos por el frontend. */
export const COLECCION_USUARIOS = "usuarios";
export const SUBCOLECCION_ACCESOS = "accesos";
export const MAX_ACCESOS_VISIBLES = 10;
