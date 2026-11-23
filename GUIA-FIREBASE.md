# GUÍA DE FIREBASE · MurciaGram

Esta guía explica cómo pasar del **modo demostración** (el que viene activo) a un backend real de **Firebase Authentication + Cloud Firestore**. No necesitas saber Firebase: sigue los pasos en orden.

> [!IMPORTANT]
> El proyecto funciona sin configurar nada. Mientras `js/firebase-config.js` conserve los valores de ejemplo, las páginas de registro, acceso y cuenta usan un modo demostración local y muestran un aviso amarillo. Ese modo sirve para probar la interfaz y el flujo completo, pero **no crea usuarios reales**.

---

## 1. Antes de empezar

Necesitas:

- Una cuenta de Google.
- Un navegador actualizado.
- Opcional, solo si quieres desplegar reglas desde la terminal: Node.js 18 o superior y `npm`.

No necesitas tarjeta de crédito para el plan gratuito Spark.

---

## 2. Crear el proyecto

1. Entra en <https://console.firebase.google.com/>.
2. Pulsa **Crear proyecto**.
3. Escribe un nombre, por ejemplo `murciagram`.
4. Acepta las condiciones y elige si quieres activar Google Analytics. Para este proyecto **no es necesario**; puedes desactivarlo.
5. Espera a que se cree y pulsa **Continuar**.

---

## 3. Registrar la aplicación web

1. En la página principal del proyecto, pulsa el icono **`</>`** (“Añadir aplicación web”).
2. Pon como apodo `MurciaGram Web`.
3. **No** marques Firebase Hosting todavía si solo quieres probar en local.
4. Pulsa **Registrar app**.
5. La consola muestra un objeto parecido a este:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "murciagram-xxxxx.firebaseapp.com",
  projectId: "murciagram-xxxxx",
  storageBucket: "murciagram-xxxxx.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
};
```

> La configuración web de Firebase **no es un secreto**. La seguridad real está en las reglas de Firestore y en los dominios autorizados. Nunca pegues en el proyecto claves de cuenta de servicio ni contraseñas de administrador.

---

## 4. Pegar la configuración en el proyecto

Abre `js/firebase-config.js` y sustituye los valores de ejemplo por los tuyos:

```js
export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "murciagram-xxxxx.firebaseapp.com",
  projectId: "murciagram-xxxxx",
  storageBucket: "murciagram-xxxxx.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
};
```

El detector `isFirebaseConfigured` comprueba que **todos** los valores son distintos de los de ejemplo. En cuanto guardes el archivo y recargues:

- desaparece el aviso de “Modo demostración”;
- el registro llama a Firebase Authentication;
- el perfil y los accesos se guardan en Cloud Firestore;
- la página de cuenta muestra la insignia “Firebase Auth”.

Si algún valor sigue siendo de ejemplo, la app vuelve al modo demostración automáticamente.

---

## 5. Activar el acceso con correo y contraseña

1. En el menú lateral, entra en **Compilación → Authentication**.
2. Pulsa **Comenzar**.
3. En la pestaña **Sign-in method**, habilita **Correo electrónico/contraseña**.
4. Deja activada la opción de correo y contraseña. No hace falta habilitar enlaces mágicos ni proveedores sociales.
5. Guarda.

### Dominios autorizados

1. En **Authentication → Settings → Authorized domains**.
2. `localhost` ya suele estar permitido.
3. Cuando publiques, añade el dominio real, por ejemplo `sandraberna06.github.io` o tu dominio de Firebase Hosting.

Sin el dominio autorizado, el registro fallará con `auth/unauthorized-domain`.

---

## 6. Crear Cloud Firestore

1. Entra en **Compilación → Firestore Database**.
2. Pulsa **Crear base de datos**.
3. Elige **Modo de producción** (las reglas del proyecto ya limitan el acceso).
4. Selecciona una ubicación cercana, por ejemplo `europe-southwest1` (Madrid) o `europe-west1` (Bélgica).
   - La ubicación **no se puede cambiar** después.
5. Crea la base de datos.

La aplicación usa esta estructura:

```text
usuarios/{uid}
  nombre, apellidos, email, fechaNacimiento, telefono,
  direccion: { calle, codigoPostal, ciudad, provincia },
  comunicaciones, consentimiento: { aceptado, fecha, version },
  creadoEn, actualizadoEn, ultimoAcceso

usuarios/{uid}/accesos/{accesoId}
  tipo: "registro" | "login"
  fecha
  userAgent
```

Las contraseñas **no se guardan aquí**. Las gestiona Firebase Authentication y MurciaGram nunca las escribe en Firestore.

---

## 7. Publicar las reglas de seguridad

### Opción A · Desde la consola (la más rápida)

1. Entra en **Firestore Database → Reglas**.
2. Abre `firestore.rules` del proyecto.
3. Copia todo su contenido y pégalo en el editor.
4. Pulsa **Publicar**.

### Opción B · Con Firebase CLI

Instala la CLI si no la tienes:

```bash
npm install -g firebase-tools
firebase login
```

Desde la carpeta del proyecto:

```bash
firebase use --add          # elige tu proyecto
firebase deploy --only firestore:rules
```

El archivo `firebase.json` ya apunta a `firestore.rules` y `firestore.indexes.json`.

### Qué permiten las reglas

| Ruta | Lectura | Creación | Modificación | Borrado |
| --- | --- | --- | --- | --- |
| `usuarios/{uid}` | Solo el propietario | Solo el propietario, con datos válidos | Solo campos permitidos | Nunca |
| `usuarios/{uid}/accesos/{id}` | Solo el propietario | Solo el propietario, registros inmutables | Nunca | Nunca |
| Cualquier otra ruta | Denegada | Denegada | Denegada | Denegada |

Además, la creación del perfil comprueba que el correo del documento coincide con el correo autenticado (`request.auth.token.email`), que la fecha de nacimiento tiene formato ISO, que el código postal tiene cinco dígitos y que el consentimiento se firma con la hora del servidor.

---

## 8. Verificar el correo (opcional pero recomendado)

Al registrarse, la app llama a `sendEmailVerification`. Firebase envía un correo con un enlace de verificación.

1. En **Authentication → Templates**, personaliza la plantilla **Verificación de correo** en español.
2. Cambia el remitente y el asunto si quieres.
3. La página de cuenta muestra “Correo sin verificar” y permite reenviar el mensaje.

> En el plan Spark, Firebase usa un remitente genérico. Para usar un dominio propio hay que configurar SMTP en el plan Blaze.

---

## 9. Probar el flujo real

1. Sirve el proyecto por HTTP (no abras los HTML con `file://`, porque los módulos ES y `crypto.subtle` no funcionan igual):

   ```bash
   npx serve .
   ```

2. Abre `http://localhost:3000/registro.html`.
3. Comprueba que **no** aparece el aviso de modo demostración.
4. Crea una cuenta con un correo real.
5. Revisa en la consola de Firebase:
   - **Authentication → Users**: debe aparecer el usuario.
   - **Firestore → usuarios**: debe existir el documento con el perfil.
   - **usuarios/{uid}/accesos**: debe haber un registro `registro`.
6. Cierra sesión, vuelve a entrar y comprueba que se añade un acceso `login`.

---

## 10. Probar con los emuladores (opcional)

Si no quieres tocar el proyecto real mientras desarrollas:

```bash
firebase emulators:start
```

`firebase.json` ya define los puertos:

| Servicio | Puerto |
| --- | --- |
| Authentication | 9099 |
| Firestore | 8080 |
| Emulator UI | 4000 |

Para que la app use los emuladores hay que conectar el SDK con `connectAuthEmulator` y `connectFirestoreEmulator` en `js/auth-service.js`. Esa conexión no está activada por defecto para no complicar la entrega; es una mejora sencilla si el profesor la pide.

---

## 11. Desplegar en Firebase Hosting (opcional)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

Respuestas recomendadas:

- **Public directory:** `.` (la raíz del proyecto).
- **Single-page app:** `No`.
- **Configurar despliegues automáticos con GitHub:** `No`, salvo que se pida.

Después:

```bash
firebase deploy --only hosting
```

`firebase.json` ya ignora `docs/`, `scripts/`, los archivos Markdown y las reglas, y añade cabeceras de seguridad (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`).

> Si publicas en GitHub Pages en lugar de Firebase Hosting, las reglas de Firestore se publican igualmente desde la consola o con `firebase deploy --only firestore:rules`.

---

## 12. Problemas frecuentes

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| Sigue apareciendo “Modo demostración” | Queda algún valor de ejemplo en `firebase-config.js` | Revisa los seis campos; deben ser todos reales. |
| `auth/unauthorized-domain` | El dominio no está autorizado | Añádelo en Authentication → Settings → Authorized domains. |
| `auth/operation-not-allowed` | El acceso con correo y contraseña está desactivado | Actívalo en Authentication → Sign-in method. |
| `permission-denied` al crear el perfil | Reglas antiguas o no publicadas | Publica `firestore.rules` y comprueba que el correo del documento coincide con el de Auth. |
| “La cuenta se creó, pero no se pudieron guardar los datos del perfil” | Firestore no existe o las reglas bloquean la escritura | Crea la base de datos y publica las reglas. |
| No llega el correo de verificación | Está en spam o el remitente genérico está limitado | Revisa spam; configura SMTP si necesitas un remitente propio. |
| `crypto.subtle` no disponible en modo demo | La página se abrió con `file://` | Usa `http://localhost` o HTTPS. |
| Los cambios de CSS/JS no se ven | Caché del navegador | Recarga con `Ctrl + F5`. |

---

## 13. Lista de comprobación final

- [ ] Proyecto creado en Firebase.
- [ ] App web registrada.
- [ ] `firebase-config.js` con los seis valores reales.
- [ ] Authentication con correo/contraseña activado.
- [ ] Dominio de pruebas autorizado.
- [ ] Cloud Firestore creado en una ubicación europea.
- [ ] `firestore.rules` publicado.
- [ ] Registro real probado y documento visible en Firestore.
- [ ] Acceso y cierre de sesión probados.
- [ ] Correo de verificación recibido o reenviado.
- [ ] Página `privacidad.html` revisada con el correo de contacto real antes de publicar.

Cuando termines, actualiza la sección “Estado del backend” de `README.md` y la tabla de pruebas de `PRUEBAS.md` para dejar constancia de que el modo real está verificado.
