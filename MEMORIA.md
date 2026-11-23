# MEMORIA · Sistema de cuentas de MurciaGram

**Proyecto:** MurciaGram · El Pinterest de la Región de Murcia
**Fase:** registro, autenticación y cuenta de usuario
**Autora del proyecto:** Sandra Berna
**Curso académico:** 2025–2026
**Fecha de cierre de esta memoria:** 16 de noviembre de 2026

---

## Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Objetivos y alcance](#2-objetivos-y-alcance)
3. [Requisitos y grado de cumplimiento](#3-requisitos-y-grado-de-cumplimiento)
4. [Tecnologías utilizadas](#4-tecnologías-utilizadas)
5. [Arquitectura y estructura de archivos](#5-arquitectura-y-estructura-de-archivos)
6. [Diseño visual y experiencia de usuario](#6-diseño-visual-y-experiencia-de-usuario)
7. [Modelo de datos](#7-modelo-de-datos)
8. [Flujo de registro](#8-flujo-de-registro)
9. [Flujo de acceso y sesión](#9-flujo-de-acceso-y-sesión)
10. [Validación en cliente](#10-validación-en-cliente)
11. [Seguridad](#11-seguridad)
12. [Privacidad y RGPD](#12-privacidad-y-rgpd)
13. [Accesibilidad](#13-accesibilidad)
14. [Modo demostración](#14-modo-demostración)
15. [Pruebas y evidencias](#15-pruebas-y-evidencias)
16. [Despliegue](#16-despliegue)
17. [Limitaciones y trabajo futuro](#17-limitaciones-y-trabajo-futuro)
18. [Conclusiones](#18-conclusiones)
19. [Bibliografía y recursos](#19-bibliografía-y-recursos)

---

## 1. Resumen ejecutivo

MurciaGram nació como una galería estática de ocho municipios de la Región de Murcia, construida con HTML5 y CSS3. Esta fase añade una **capa completa de cuentas**: registro, inicio de sesión, perfil, historial de accesos, cierre de sesión y una política de privacidad adaptada al RGPD y a la LOPDGDD.

La solución se apoya en **Firebase Authentication** para las credenciales y **Cloud Firestore** para el perfil y el historial. Como no se dispone de un proyecto Firebase real en el momento de la entrega, se ha implementado además un **modo demostración local** que reproduce todo el flujo sin enviar datos a ningún servidor. El cambio entre ambos modos es automático: depende únicamente de si `js/firebase-config.js` contiene valores reales o de ejemplo.

El resultado mantiene la identidad visual de la galería, cumple los requisitos del enunciado, supera la validación HTML, no presenta desbordamiento horizontal entre 320 y 1440 px y obtiene **100/100/100** en Lighthouse (accesibilidad, buenas prácticas y SEO) en las tres páginas nuevas.

---

## 2. Objetivos y alcance

### 2.1. Objetivo general

Diseñar e implementar un sistema de registro y autenticación coherente con MurciaGram, seguro, accesible y documentado, que permita crear una cuenta, acceder a ella y consultar los datos personales y el historial de accesos.

### 2.2. Objetivos específicos

1. Mantener la coherencia visual con la galería existente.
2. Validar los datos en el cliente antes de enviarlos.
3. Delegar la gestión de contraseñas en Firebase Authentication.
4. Guardar en Firestore solo el perfil y los metadatos necesarios.
5. Ofrecer mensajes de error claros y accesibles.
6. Proteger la página de cuenta frente a accesos sin sesión.
7. Informar sobre el tratamiento de datos conforme al RGPD y la LOPDGDD.
8. Documentar el proceso, las pruebas, los prompts de IA y el despliegue.
9. Permitir probar todo el flujo aunque no exista un proyecto Firebase.

### 2.3. Fuera del alcance

- Edición completa del perfil desde la interfaz (las reglas de Firestore ya la permiten para algunos campos, pero no hay formulario).
- Recuperación de contraseña real en modo demostración.
- Inicio de sesión con Google, GitHub u otros proveedores.
- Panel de administración o listado de usuarios.
- Notificaciones por correo distintas de la verificación y el restablecimiento de Firebase.

---

## 3. Requisitos y grado de cumplimiento

| Requisito del enunciado | Implementación | Estado |
| --- | --- | --- |
| Formulario de registro con nombre, apellidos, correo, contraseña ×2, fecha de nacimiento y dirección | `registro.html` + `js/registro.js` | ✅ |
| Campos opcionales (teléfono y comunicaciones) | Incluidos y validados | ✅ |
| Validación del correo con expresión regular | `EMAIL_REGEX` en `js/validacion.js` | ✅ |
| Mostrar y ocultar contraseña | Botones con `aria-pressed` en registro y acceso | ✅ |
| Campos obligatorios y mensajes de error | Validación por campo + resumen general | ✅ |
| Aviso RGPD/LOPDGDD | Aviso en el formulario + `privacidad.html` | ✅ |
| Formulario de acceso con correo y contraseña | `login.html` + `js/login.js` | ✅ |
| Enlaces entre registro y acceso | En ambas páginas y en el pie | ✅ |
| Icono de cuenta en la galería | `.account-link` en `index.html` | ✅ |
| Firebase Authentication con correo y contraseña | `js/auth-service.js` | ✅ (código listo) |
| Perfil en Cloud Firestore | `usuarios/{uid}` | ✅ (código listo) |
| Historial de accesos | `usuarios/{uid}/accesos` | ✅ |
| No guardar contraseñas en Firestore | Solo `passwordHash` y `salt` en el modo demo local | ✅ |
| `design.md` | Sistema de diseño completo | ✅ |
| Reglas de Firestore | `firestore.rules` | ✅ |
| Documentación de despliegue y configuración | `GUIA-FIREBASE.md` | ✅ |
| Prompts y memoria de IA | `PROMPTS.md` | ✅ |
| Capturas y pruebas | `docs/capturas/`, `docs/informes/`, `PRUEBAS.md` | ✅ |

---

## 4. Tecnologías utilizadas

| Tecnología | Uso | Motivo |
| --- | --- | --- |
| HTML5 semántico | Estructura de las cinco páginas | Accesibilidad y mantenibilidad |
| CSS3 | `styles.css` (galería) y `auth.css` (cuentas) | Coherencia visual sin frameworks |
| JavaScript ES2022 | Módulos nativos, `async/await`, `crypto.subtle` | Sin proceso de compilación |
| Firebase JS SDK 10.12.2 | Auth y Firestore desde CDN | Compatible con módulos ES y GitHub Pages |
| Firebase Authentication | Correo y contraseña, verificación, restablecimiento | No gestionamos contraseñas |
| Cloud Firestore | Perfil e historial de accesos | Base de datos documental con reglas |
| PBKDF2-SHA-256 | Hash de contraseñas en modo demo | Evitar texto plano en `localStorage` |
| `localStorage` / `sessionStorage` | Datos y sesión de demostración | Probar sin backend |
| html-validate 8 | Validación del HTML | Detectar errores de marcado y ARIA |
| Lighthouse | Auditoría de accesibilidad, SEO y buenas prácticas | Evidencia objetiva |
| Chrome 157 + Node.js 22 | Pruebas funcionales y de responsive | Entorno reproducible |

No se ha usado ningún framework de interfaz ni gestor de paquetes en producción. El proyecto sigue siendo **estático**: se puede publicar en GitHub Pages o en Firebase Hosting sin compilar.

---

## 5. Arquitectura y estructura de archivos

```text
murciagram/
├── index.html                 # Galería + acceso a la cuenta en la cabecera
├── registro.html              # Formulario de alta
├── login.html                 # Formulario de acceso + diálogo de recuperación
├── cuenta.html                # Perfil, cifras e historial de accesos
├── privacidad.html            # Política RGPD/LOPDGDD
├── styles.css                 # Diseño original de la galería
├── auth.css                   # Estilos de cuentas, formularios y legal
├── design.md                  # Sistema de diseño (tokens, componentes, estados)
├── GUIA-FIREBASE.md           # Configuración y despliegue de Firebase
├── MEMORIA.md                 # Este documento
├── PROMPTS.md                 # Prompts y verificación del trabajo con IA
├── PRUEBAS.md                 # Campaña de pruebas y evidencias
├── firestore.rules            # Reglas de seguridad de Firestore
├── firebase.json              # Hosting, reglas y emuladores
├── firestore.indexes.json     # Índices (sin índices compuestos obligatorios)
├── js/
│   ├── firebase-config.js     # Configuración pública y detección de demo
│   ├── auth-service.js        # Fachada Firebase / demostración
│   ├── validacion.js          # Validaciones puras reutilizables
│   ├── ui.js                  # Errores, alertas, carga, fechas y contraseñas
│   ├── registro.js            # Lógica del formulario de alta
│   ├── login.js               # Lógica del acceso y del restablecimiento
│   └── cuenta.js              # Protección, perfil e historial
├── docs/
│   ├── capturas/              # Capturas de escritorio y móvil
│   └── informes/              # Informes Lighthouse
├── assets/                    # Imágenes, favicon y banner
└── scripts/                   # Optimización de imágenes
```

### 5.1. Separación de responsabilidades

- **`validacion.js`** no toca el DOM. Son funciones puras que devuelven un mensaje de error o cadena vacía. Esto permite reutilizarlas y probarlas.
- **`ui.js`** concentra la manipulación de la interfaz: marcar campos, mostrar alertas, cambiar el estado de carga, alternar la visibilidad de la contraseña y formatear fechas.
- **`auth-service.js`** es la única puerta de entrada al backend. Las páginas no saben si detrás hay Firebase o el modo demo.
- **`registro.js`, `login.js` y `cuenta.js`** orquestan cada página: recogen datos, validan, llaman al servicio y pintan el resultado.

Esta separación evita dependencias circulares y facilita cambiar el backend sin reescribir las páginas.

---

## 6. Diseño visual y experiencia de usuario

El sistema de diseño está documentado en **`design.md`**. Los puntos principales son:

### 6.1. Identidad

- Paleta mediterránea: crema (`#f7f0e5`), verde profundo (`#0f5f5c`), terracota (`#c2410c`) y dorado (`#e7a92f`).
- Titulares con serif del sistema; interfaz con sans-serif del sistema. Sin fuentes externas, por privacidad y rendimiento.
- Esquinas generosas, sombras suaves y bordes de baja opacidad.
- Microinteracciones de 150–250 ms que respetan `prefers-reduced-motion`.

### 6.2. Composición de las páginas de cuenta

- **Registro y acceso:** panel editorial a la izquierda (frase, ventajas y foto de Cieza) y formulario a la derecha. En móvil, el panel editorial se reduce y el formulario ocupa el ancho completo.
- **Cuenta:** cabecera con avatar de iniciales, nombre, correo e insignias; tres cifras (miembro desde, último acceso, accesos recientes); rejilla con datos personales e historial; panel de seguridad y botón de salida.
- **Privacidad:** documento legal con índice, tablas y avisos destacados.

### 6.3. Estados de los componentes

| Componente | Estados |
| --- | --- |
| Campo | Normal, foco, válido, inválido, deshabilitado |
| Botón principal | Normal, hover, foco, activo, cargando, deshabilitado |
| Alerta | Información, éxito, error |
| Contraseña | Visible / oculta, con barra de fortaleza y requisitos |
| Insignia | Verificado, pendiente, modo demostración |

Los estados nunca dependen solo del color: añaden icono, texto o borde.

### 6.4. Decisiones de interacción

- Las etiquetas son siempre visibles; no se usan placeholders como sustituto.
- Los errores aparecen bajo el campo y, además, en un resumen general con foco.
- El botón de envío se bloquea mientras se procesa y cambia su texto (“Creando cuenta…”, “Entrando…”).
- Los mensajes de éxito se anuncian con `role="alert"` y reciben el foco.
- La página de cuenta muestra un esqueleto de carga (“Cargando tu cuenta…”) antes de pintar los datos.

---

## 7. Modelo de datos

### 7.1. Firestore

```text
usuarios/{uid}
├── nombre: string
├── apellidos: string
├── email: string                 # Coincide con el correo de Authentication
├── fechaNacimiento: string       # ISO 8601: YYYY-MM-DD
├── telefono: string | null
├── direccion: map
│   ├── calle: string
│   ├── codigoPostal: string      # 5 dígitos
│   ├── ciudad: string
│   └── provincia: string
├── comunicaciones: boolean
├── consentimiento: map
│   ├── aceptado: true
│   ├── fecha: timestamp
│   └── version: string           # "1.0"
├── creadoEn: timestamp
├── actualizadoEn: timestamp
└── ultimoAcceso: timestamp

usuarios/{uid}/accesos/{accesoId}
├── tipo: "registro" | "login"
├── fecha: timestamp
└── userAgent: string             # Máximo 160 caracteres en cliente
```

No se guarda el correo en la subcolección de accesos: se obtiene del perfil. Tampoco se guarda la contraseña, ni su hash, en Firestore.

### 7.2. Modo demostración

En `localStorage` se guarda un objeto por usuario bajo la clave `murciagram.demo.usuarios.v1`:

```json
{
  "demo_...": {
    "uid": "demo_...",
    "nombre": "Ana",
    "apellidos": "García López",
    "email": "ana.garcia@example.com",
    "passwordHash": "…base64 de 44 caracteres…",
    "salt": "…base64 de 16 bytes…",
    "accesos": [
      { "id": "…", "tipo": "registro", "fecha": "2026-11-16T…", "userAgent": "…" }
    ]
  }
}
```

La sesión se guarda en `murciagram.demo.sesion.v1`, en `localStorage` o `sessionStorage` según la casilla “Mantener la sesión en este dispositivo”.

### 7.3. Límites

- Se conservan como máximo **20 accesos** por usuario en modo demo y se muestran los **10 últimos** en Firebase.
- El `userAgent` se recorta a 160 caracteres antes de guardarlo.
- Las fechas se almacenan en ISO 8601 y se formatean con `Intl.DateTimeFormat("es-ES")`.

---

## 8. Flujo de registro

1. La persona entra en `registro.html`.
2. Si ya hay una sesión activa, `registro.js` redirige a `cuenta.html`.
3. Si Firebase no está configurado, se muestra el aviso de modo demostración.
4. Al escribir, se actualizan la barra de fortaleza y los requisitos de la contraseña.
5. Al enviar:
   1. Se oculta cualquier alerta anterior.
   2. Se validan los 11 campos obligatorios y la casilla de privacidad.
   3. Si hay errores, se muestra un resumen, se marcan los campos y se enfoca el primero.
   4. Si todo es válido, se deshabilita el botón y se muestra “Creando cuenta…”.
   5. `registrar()` elige Firebase o demo.
   6. **Firebase:** crea el usuario, actualiza el `displayName`, guarda el perfil, registra el acceso y envía la verificación.
   7. **Demo:** normaliza el correo, comprueba duplicados, genera sal y hash PBKDF2, guarda el usuario y crea la sesión.
   8. Se muestra el mensaje de bienvenida y, tras 1,5 s, se redirige a `cuenta.html?alta=1`.
6. Si algo falla, se traduce el error, se marca el campo correspondiente y se vuelve a habilitar el botón. El botón nunca queda bloqueado.

### 8.1. Tratamiento de errores

`traducirErrorAuth()` convierte los códigos de Firebase (`auth/email-already-in-use`, `auth/weak-password`, `auth/invalid-credential`, `permission-denied`, `unavailable`…) en mensajes en español con un campo asociado. Los errores desconocidos usan un mensaje genérico y se registran en consola para depuración.

---

## 9. Flujo de acceso y sesión

1. La persona entra en `login.html`.
2. Si ya hay sesión, se redirige a `cuenta.html`.
3. Si llega con `?sesion=requerida`, se muestra el aviso “Necesitas una sesión”.
4. Al enviar:
   1. Se valida que el correo tenga formato y que la contraseña no esté vacía.
   2. Se llama a `iniciarSesion({ email, password, recordar })`.
   3. **Firebase:** se elige `browserLocalPersistence` o `browserSessionPersistence`, se autentica, se registra el acceso y se actualiza `ultimoAcceso`.
   4. **Demo:** se busca el usuario, se deriva el hash con su sal y se compara. Si coincide, se añade un acceso y se guarda la sesión.
   5. Se redirige a `cuenta.html?bienvenida=1`.
5. Si las credenciales fallan, se muestra un mensaje genérico (“El correo o la contraseña no son correctos”) para no revelar si el correo existe.
6. El cierre de sesión elimina la sesión y vuelve a la galería.

### 9.1. Protección de la página de cuenta

`cuenta.js` comprueba la sesión antes de pintar nada. Si no existe, redirige a `login.html?sesion=requerida`. Si el perfil no se puede leer, la página sigue mostrando el historial y un aviso que sugiere revisar las reglas de Firestore.

### 9.2. Recuperación de contraseña

El diálogo usa `<dialog>` nativo con cierre por botón, por clic en el fondo y por `Esc`. En Firebase llama a `sendPasswordResetEmail`; en demo explica que la función no está disponible y por qué.

---

## 10. Validación en cliente

| Campo | Reglas principales | Mensaje de ejemplo |
| --- | --- | --- |
| Nombre y apellidos | 2–60 caracteres, letras Unicode, espacios, guiones y apóstrofos | “El nombre debe tener al menos 2 caracteres.” |
| Correo | `EMAIL_REGEX`, máximo 254, parte local ≤ 64, sin puntos consecutivos | “El correo no tiene un formato válido…” |
| Contraseña | 8–64, minúscula, mayúscula y número | “La contraseña debe incluir una minúscula, una mayúscula y un número.” |
| Confirmación | Igual a la contraseña | “Las contraseñas no coinciden. Revísalas.” |
| Fecha de nacimiento | Fecha real, no futura, edad ≥ 14 y ≤ 120 | “Debes tener al menos 14 años para crear una cuenta.” |
| Teléfono (opcional) | 7–15 dígitos, permite `+`, espacios, paréntesis y guiones | “El teléfono debe tener entre 7 y 15 dígitos.” |
| Dirección | 5–120 caracteres, al menos una letra o número | “La dirección es demasiado corta.” |
| Código postal | Exactamente 5 dígitos | “El código postal debe tener exactamente 5 dígitos.” |
| Ciudad y provincia | 2–60 caracteres | “La ciudad no puede superar los 60 caracteres.” |
| Privacidad | Casilla obligatoria | “Debes aceptar la política de privacidad…” |

La validación del cliente mejora la experiencia, pero **no sustituye** la validación del servidor. Las reglas de Firestore vuelven a comprobar tipos, longitudes, formato del correo y consentimiento.

### 10.1. Barra de fortaleza

`puntuarPassword()` otorga hasta 4 puntos por longitud, minúscula, mayúscula y número, con un punto extra si hay símbolo o al menos 12 caracteres. La barra y las cuatro reglas se actualizan en cada pulsación. La puntuación es orientativa: la validación real exige los cuatro requisitos básicos.

---

## 11. Seguridad

### 11.1. Credenciales

- Las contraseñas **nunca** se escriben en Firestore ni en el almacenamiento propio de MurciaGram en modo Firebase.
- Firebase Authentication aplica sus propios controles: hash con sal, límites de intentos y verificación de correo.
- En modo demostración no se guarda la contraseña: se deriva con **PBKDF2-SHA-256**, 120 000 iteraciones, sal aleatoria de 16 bytes y salida de 256 bits. El hash se compara en tiempo de acceso.
- El mensaje de credenciales incorrectas es genérico para no filtrar qué correos existen.

### 11.2. Reglas de Firestore

- Solo el propietario autenticado puede leer su perfil.
- Nadie puede listar todos los usuarios (`allow list: if false`).
- La creación exige que el correo del documento coincida con el token de Authentication.
- Los accesos son inmutables: solo se crean, nunca se actualizan ni se borran.
- Cualquier ruta no contemplada se deniega explícitamente.
- El perfil no se puede borrar desde la aplicación.

### 11.3. Otras medidas

- Renderizado con `textContent`, no con `innerHTML`, para los datos del usuario (evita XSS).
- `rel="noopener noreferrer"` en enlaces que abren pestañas nuevas.
- `referrer` limitado a `strict-origin-when-cross-origin`.
- Cabeceras de seguridad en `firebase.json`: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy` y `Permissions-Policy`.
- `noindex, nofollow` en las páginas de cuenta.
- La configuración web de Firebase se considera pública; no se incluyen claves de servicio.

### 11.4. Riesgos aceptados y limitaciones

- En modo demo, cualquier persona con acceso al navegador puede leer los datos guardados. Es un modo de prueba, no un entorno de producción.
- No hay límite de intentos en el modo demo. Firebase sí lo aplica en producción.
- No se implementa doble factor ni verificación por teléfono.
- La recuperación de contraseña real depende de Firebase y de un remitente configurado.

---

## 12. Privacidad y RGPD

### 12.1. Datos tratados

- Identificación: nombre, apellidos y correo.
- Verificación de edad: fecha de nacimiento.
- Contacto postal: calle, código postal, ciudad y provincia.
- Contacto telefónico opcional.
- Preferencias: comunicaciones comerciales opcionales.
- Seguridad: identificador, fechas de alta y acceso, navegador.
- Credenciales: gestionadas por Firebase Authentication; la contraseña no se guarda en Firestore.

### 12.2. Base jurídica y finalidad

- **Ejecución del servicio** para crear y mantener la cuenta.
- **Consentimiento** para el tratamiento de datos y para las comunicaciones opcionales.
- **Interés legítimo** en mantener la seguridad del servicio y registrar accesos.

No se elaboran perfiles publicitarios, no se venden datos y no se toman decisiones automatizadas con efectos jurídicos.

### 12.3. Minimización y conservación

- Solo se piden los datos necesarios para el enunciado y para la gestión de la cuenta.
- La fecha de nacimiento no se muestra públicamente.
- El historial se limita a los últimos accesos y no se usa para publicidad.
- Los datos se conservan mientras exista la cuenta; el usuario puede solicitar su supresión.

### 12.4. Derechos

La política de privacidad informa de los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad, y del derecho a reclamar ante la **AEPD**. El correo de contacto es `privacidad@murciagram.es`; **es un marcador de posición** y debe sustituirse antes de publicar fuera del ámbito académico.

### 12.5. Encargados del tratamiento

Firebase Authentication y Cloud Firestore (Google Cloud) actúan como proveedores técnicos. La ubicación recomendada de Firestore es europea (`europe-southwest1` o `europe-west1`).

### 12.6. Edad mínima

Se exige tener al menos **14 años**, coherente con el tratamiento de datos en España. La fecha se valida en cliente y el formulario informa de que no se muestra en el perfil público.

### 12.7. Consentimiento versionado

El perfil guarda `consentimiento: { aceptado, fecha, version }`. La versión actual es `1.0`. Si en el futuro cambia la política, se puede pedir una nueva aceptación comparando versiones.

---

## 13. Accesibilidad

- HTML semántico (`header`, `main`, `section`, `nav`, `footer`, `fieldset`, `legend`).
- Un solo `h1` por página y jerarquía de encabezados coherente.
- Etiquetas asociadas a todos los campos; los `fieldset` agrupan la dirección.
- `aria-describedby` enlaza ayudas y errores con su campo.
- Errores con `role="alert"` y foco programático.
- Botones de contraseña con `aria-pressed` y etiqueta que cambia (“Mostrar” / “Ocultar”).
- Foco visible de alto contraste.
- Navegación completa por teclado; el diálogo usa `<dialog>` nativo.
- Contraste WCAG AA en textos y controles.
- Respeto por `prefers-reduced-motion`.
- La tabla de privacidad tiene un contenedor desplazable con foco y nombre accesible.
- Lighthouse: **100 en accesibilidad** en registro, acceso y cuenta.

---

## 14. Modo demostración

### 14.1. Por qué existe

El enunciado pide Firebase, pero no siempre se dispone de un proyecto real durante la corrección. El modo demo permite probar el flujo completo sin credenciales y sin enviar datos personales a Internet.

### 14.2. Cómo funciona

- Se activa automáticamente si `isFirebaseConfigured` es `false`.
- Los datos se guardan en `localStorage`.
- La sesión se guarda en `localStorage` o `sessionStorage` según la casilla.
- La contraseña se protege con PBKDF2-SHA-256 y sal aleatoria.
- Las páginas muestran un aviso amarillo y la cuenta una insignia “Modo demostración”.
- Las funciones que dependen de correo (verificación y restablecimiento) explican que no están disponibles.

### 14.3. Cómo pasar a Firebase

1. Crear el proyecto y la app web.
2. Pegar la configuración en `js/firebase-config.js`.
3. Activar correo/contraseña en Authentication.
4. Crear Firestore y publicar `firestore.rules`.
5. Recargar. El aviso desaparece y la app usa Firebase.

Los pasos detallados están en `GUIA-FIREBASE.md`.

### 14.4. Qué no demuestra el modo demo

- No prueba las reglas de Firestore.
- No prueba el envío real de correos.
- No prueba la persistencia entre dispositivos.
- No sustituye una auditoría de seguridad de Firebase.

---

## 15. Pruebas y evidencias

La campaña completa está en **`PRUEBAS.md`**. Resumen:

- 9 pruebas de registro y 7 de acceso, todas correctas en modo demo.
- Validación HTML sin errores.
- Sintaxis de los siete módulos correcta.
- Sin desbordamiento horizontal entre 320 y 1440 px.
- Sin errores de consola.
- Lighthouse 100/100/100 en las tres páginas nuevas.
- Capturas de escritorio y móvil en `docs/capturas/`.
- Informes Lighthouse en `docs/informes/`.

Durante la campaña se encontraron y corrigieron:

1. Una clave de objeto sin comillas en `auth-service.js` (`permission-denied`), que impedía cargar el módulo.
2. Nueve avisos de `html-validate` (ARIA, `for` redundante, `scope`, `autocomplete`).
3. Un desbordamiento de 41 px en la tabla de privacidad a 320 px.

Esto se documenta en `PROMPTS.md` como parte del proceso de verificación.

---

## 16. Despliegue

### 16.1. GitHub Pages

El proyecto sigue siendo estático. Basta con subir todos los archivos y activar Pages en la rama `main`. Las rutas son relativas, así que funciona en un subdirectorio.

### 16.2. Firebase Hosting

```bash
firebase login
firebase init hosting   # public: "."
firebase deploy --only hosting
```

Antes de publicar:

- Pegar la configuración real.
- Publicar las reglas.
- Añadir el dominio a los dominios autorizados de Authentication.
- Sustituir el correo de privacidad de ejemplo.
- Revisar la política de privacidad con los datos reales del responsable.

### 16.3. Servidor local

```bash
npx serve .
```

Las páginas de cuenta usan módulos ES y `crypto.subtle`, por lo que deben abrirse por HTTP o HTTPS. `file://` no es un entorno válido para probar el modo demo.

---

## 17. Limitaciones y trabajo futuro

### Limitaciones actuales

- El backend real no se ha podido probar de extremo a extremo por falta de credenciales.
- No hay formulario de edición del perfil.
- No hay eliminación de cuenta desde la interfaz.
- No hay proveedores sociales.
- No hay límite de intentos en modo demo.
- El correo de privacidad es un marcador de posición.
- El zoom del navegador sigue desactivado en la galería por requisito del enunciado original.

### Mejoras propuestas

1. Formulario de edición de teléfono, dirección y comunicaciones usando la regla `actualizacionValida` ya preparada.
2. Botón de eliminación de cuenta con confirmación y borrado del perfil y los accesos.
3. Inicio de sesión con Google.
4. Conexión a los emuladores de Firebase para pruebas automáticas.
5. Pruebas unitarias de `validacion.js` con un runner ligero.
6. Recuperación de contraseña con plantilla propia y remitente verificado.
7. Panel de administración separado, nunca dentro del cliente.
8. Internacionalización de los textos (español/inglés).
9. Política de conservación y borrado automático documentada.
10. Sustituir el correo de ejemplo por un buzón real y revisar el texto legal con asesoramiento.

---

## 18. Conclusiones

La fase de cuentas queda **funcionalmente completa en modo demostración** y **preparada para Firebase**. La separación entre validación, interfaz y servicio permite entender y mantener el código sin frameworks, y el modo demo evita que la entrega dependa de credenciales externas.

El trabajo ha permitido comprobar que la accesibilidad y la seguridad no son capas añadidas al final: condicionan las etiquetas, los mensajes, el orden del foco, la forma de guardar las contraseñas y las reglas de la base de datos. Las pruebas y las capturas dejan constancia de lo que se ha verificado y de lo que queda pendiente, sin ocultar limitaciones.

Como siguiente paso natural, basta con pegar una configuración real de Firebase y repetir la tabla de pruebas marcadas como pendientes. La estructura ya está lista para ello.

---

## 19. Bibliografía y recursos

- MDN Web Docs · HTML, CSS, JavaScript, `crypto.subtle`, `<dialog>`: <https://developer.mozilla.org/es/>
- Firebase Documentation · Authentication: <https://firebase.google.com/docs/auth>
- Firebase Documentation · Cloud Firestore y reglas de seguridad: <https://firebase.google.com/docs/firestore>
- Firebase JS SDK v10 · Modular API: <https://firebase.google.com/docs/web/modular-upgrade>
- W3C · Web Content Accessibility Guidelines (WCAG) 2.2: <https://www.w3.org/TR/WCAG22/>
- AEPD · RGPD y LOPDGDD: <https://www.aepd.es/>
- html-validate: <https://html-validate.org/>
- Lighthouse: <https://developer.chrome.com/docs/lighthouse/overview>
- OWASP · Password Storage Cheat Sheet: <https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html>
