# PRUEBAS · MurciaGram

Registro de las pruebas realizadas sobre el sistema de cuentas. El objetivo es que cualquiera pueda **repetir** lo que aquí se afirma y comprobar el resultado.

- **Fecha de la campaña:** 16 de noviembre de 2026.
- **Entorno:** Windows 11, Chrome 157.0.8103.78, Node.js 22.17.0.
- **Servidor local:** `http://127.0.0.1:4173` (servidor estático propio; también vale `npx serve .`).
- **Backend probado:** modo demostración local. El modo Firebase real queda pendiente de que se pegue una configuración válida; los pasos están en `GUIA-FIREBASE.md`.

---

## 1. Resumen

| Comprobación | Resultado |
| --- | --- |
| Validación HTML5 de las cinco páginas | ✅ Sin errores (`html-validate` 8) |
| Sintaxis de los siete módulos JavaScript | ✅ Sin errores (`node --check`) |
| Registro completo en modo demostración | ✅ Crea perfil, sesión e historial |
| Validación de campos vacíos | ✅ 11 campos marcados y foco en el primero |
| Correo inválido y contraseñas distintas | ✅ Mensajes específicos por campo |
| Mostrar/ocultar contraseña | ✅ Cambia `type` y `aria-pressed` |
| Correo duplicado (incluida mayúsculas) | ✅ Rechazado con mensaje en el campo |
| Acceso con contraseña incorrecta | ✅ Error, sin crear sesión |
| Acceso correcto | ✅ Redirige a la cuenta y añade un acceso |
| Sesión sin “mantener sesión” | ✅ Se guarda en `sessionStorage` |
| Sesión con “mantener sesión” | ✅ Se guarda en `localStorage` |
| Protección de `cuenta.html` sin sesión | ✅ Redirige a `login.html?sesion=requerida` |
| Cierre de sesión | ✅ Limpia la sesión y vuelve a la galería |
| Recuperación de contraseña en demo | ✅ Aviso claro de función no disponible |
| Contraseña en claro en el almacenamiento | ✅ No aparece; solo hash PBKDF2 y sal |
| Desbordamiento horizontal de 320 a 1440 px | ✅ Ninguna página supera el ancho |
| Errores de consola en las páginas | ✅ Ninguno |
| Lighthouse (registro, acceso y cuenta) | ✅ Accesibilidad 100 · Buenas prácticas 100 · SEO 100 |

---

## 2. Pruebas automáticas de estructura

### 2.1. Validación HTML

```bash
npx --yes html-validate@8 registro.html login.html cuenta.html privacidad.html index.html
```

Resultado: **exit 0**, sin mensajes. Se corrigieron durante la campaña:

- `aria-label` innecesario en dos listas (`ul`).
- `for` redundante en etiquetas que ya envuelven su checkbox.
- `scope="col"` ausente en los encabezados de la tabla de privacidad.
- `autocomplete="street-address"` cambiado a `address-line1` en un campo de una línea.
- Contenedor con `role="region"` sustituido por un `<section>` nativo.

### 2.2. Sintaxis JavaScript

```bash
Get-ChildItem js\*.js | ForEach-Object { node --check $_.FullName }
```

Resultado: los siete archivos (`auth-service.js`, `cuenta.js`, `firebase-config.js`, `login.js`, `registro.js`, `ui.js`, `validacion.js`) pasan sin errores.

> Durante las pruebas se detectó en el navegador un error real que `node --check` no señaló: una clave de objeto con guion (`permission-denied:`) sin comillas en `auth-service.js`. Se corrigió entrecomillándola y se volvió a probar el flujo completo. Queda documentado en `PROMPTS.md` como ejemplo de verificación humana.

### 2.3. Responsive sin desbordamiento

Se midió `document.documentElement.scrollWidth` frente a `window.innerWidth` en 320, 360, 390, 768, 1024 y 1440 px, con sesión y sin ella:

| Página | 320 | 360 | 390 | 768 | 1024 | 1440 |
| --- | --- | --- | --- | --- | --- | --- |
| `index.html` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `registro.html` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `login.html` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `cuenta.html` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `privacidad.html` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

La tabla de la política de privacidad se detectó con 41 px de desbordamiento a 320 px. Se envolvió en un contenedor desplazable con `tabindex="0"` y `aria-label`, y se repitió la medición: **0 px de desbordamiento**.

### 2.4. Lighthouse

| Página | Accesibilidad | Buenas prácticas | SEO |
| --- | --- | --- | --- |
| `registro.html` | 100 | 100 | 100 |
| `login.html` | 100 | 100 | 100 |
| `cuenta.html` | 100 | 100 | 100 |

Informes completos:

- [`docs/informes/lighthouse-registro.html`](docs/informes/lighthouse-registro.html)
- [`docs/informes/lighthouse-login.html`](docs/informes/lighthouse-login.html)
- [`docs/informes/lighthouse-cuenta.html`](docs/informes/lighthouse-cuenta.html)
- [`docs/informes/lighthouse-registro.json`](docs/informes/lighthouse-registro.json)

---

## 3. Pruebas funcionales del registro

Datos base usados en las pruebas:

| Campo | Valor |
| --- | --- |
| Nombre | Ana |
| Apellidos | García López |
| Correo | `ana.garcia@example.com` |
| Contraseña | `Abcdef12` |
| Fecha de nacimiento | `1995-04-12` |
| Teléfono | `600123456` |
| Dirección | Calle Mayor, 12, 3.º B |
| Código postal | `30001` |
| Ciudad | Murcia |
| Provincia | Murcia |
| Política de privacidad | Aceptada |

### R-01 · Envío completamente vacío

- **Acción:** pulsar “Crear mi cuenta” sin rellenar nada.
- **Esperado:** aviso general, errores por campo y foco en el primer campo.
- **Obtenido:** “Revisa los 11 campos marcados…”, 11 campos con `is-invalid`, foco en `nombre`.
- **Estado:** ✅

### R-02 · Correo con formato incorrecto

- **Acción:** escribir `ana@` y enviar.
- **Obtenido:** “El correo no tiene un formato válido. Ejemplo: nombre@dominio.com”.
- **Estado:** ✅

### R-03 · Contraseñas distintas

- **Acción:** `Abcdef12` y `Abcdef13`.
- **Obtenido:** “Las contraseñas no coinciden. Revísalas.” en `password2`.
- **Estado:** ✅

### R-04 · Barra de fortaleza y requisitos

- **Acción:** escribir `Abcdef12`.
- **Obtenido:** puntuación `4` (“Fuerte”) y las cuatro reglas (`length`, `lower`, `upper`, `digit`) con la clase `is-met`.
- **Estado:** ✅

### R-05 · Mostrar y ocultar contraseña

- **Acción:** pulsar el ojo del campo contraseña dos veces.
- **Obtenido:** `type` pasa de `password` a `text`; `aria-pressed` pasa a `true` y la etiqueta a “Ocultar contraseña”. Al volver a pulsar, regresa a `password` y `aria-pressed="false"`.
- **Estado:** ✅

### R-06 · Registro correcto

- **Acción:** enviar el formulario con los datos base.
- **Esperado:** alta, redirección y perfil visible.
- **Obtenido:**
  - redirección a `cuenta.html?alta=1`;
  - mensaje “¡Bienvenido a MurciaGram!”;
  - nombre “Ana García López” y correo correctos;
  - “Miembro desde 16 nov 2026”;
  - historial con 1 entrada: “Cuenta creada”;
  - insignia de modo demostración visible;
  - `localStorage` contiene `murciagram.demo.usuarios.v1` y `murciagram.demo.sesion.v1`.
- **Estado:** ✅

### R-07 · Contraseña no almacenada en claro

- **Acción:** inspeccionar el objeto del usuario en `localStorage`.
- **Obtenido:** no existe ninguna propiedad con `Abcdef12`; hay `passwordHash` (44 caracteres en base64) y `salt`. El hash se deriva con PBKDF2-SHA-256, 120 000 iteraciones y sal aleatoria de 16 bytes.
- **Estado:** ✅

### R-08 · Correo duplicado

- **Acción:** registrarse de nuevo con `ANA.GARCIA@example.com` (mayúsculas).
- **Obtenido:** “Ya existe una cuenta de demostración con este correo…”, campo de correo marcado y botón habilitado de nuevo. No se crea un segundo usuario.
- **Estado:** ✅

### R-09 · Fecha de nacimiento

- **Comprobado en código y en formulario:** el campo tiene `min="1900-01-01"` y `max` igual a la fecha actual; la validación exige al menos 14 años y rechaza fechas futuras o imposibles. El mensaje es “Debes tener al menos 14 años para crear una cuenta.”
- **Estado:** ✅

---

## 4. Pruebas funcionales del acceso

### L-01 · Protección de la página de cuenta

- **Acción:** abrir `cuenta.html` sin sesión.
- **Obtenido:** redirección a `login.html?sesion=requerida` y aviso “Necesitas una sesión”.
- **Estado:** ✅

### L-02 · Contraseña incorrecta

- **Acción:** correo correcto y contraseña `Incorrecta9`.
- **Obtenido:** “El correo o la contraseña no son correctos.”; no se crea ninguna sesión y la URL no cambia.
- **Estado:** ✅

### L-03 · Acceso correcto sin “mantener sesión”

- **Acción:** correo y contraseña correctos, casilla desmarcada.
- **Obtenido:** redirección a `cuenta.html?bienvenida=1`, mensaje “Sesión iniciada”, historial con 2 entradas (“Inicio de sesión” y “Cuenta creada”) y sesión en **`sessionStorage`**.
- **Estado:** ✅

### L-04 · Acceso correcto con “mantener sesión”

- **Acción:** misma operación con la casilla marcada.
- **Obtenido:** sesión en **`localStorage`**, historial con 3 entradas y persistencia al recargar.
- **Estado:** ✅

### L-05 · Cierre de sesión

- **Acción:** pulsar “Cerrar sesión” en la cuenta.
- **Obtenido:** se eliminan `murciagram.demo.sesion.v1` de ambos almacenes, se vuelve a `index.html` y el enlace de cabecera muestra “Acceder”.
- **Estado:** ✅

### L-06 · Recuperación de contraseña en modo demostración

- **Acción:** pulsar “¿Olvidaste tu contraseña?”, escribir el correo y enviar.
- **Obtenido:** el diálogo se abre, valida el correo y muestra “El modo demostración no envía correos de recuperación. Configura Firebase para usar esta función.”
- **Estado:** ✅ (comportamiento esperado en demo)

### L-07 · Validación del acceso

- **Acción:** enviar vacío.
- **Obtenido:** “Revisa el correo y la contraseña antes de continuar.”, con errores en ambos campos.
- **Estado:** ✅

---

## 5. Pruebas de diseño responsive

| Escenario | Comprobación | Resultado |
| --- | --- | --- |
| 320 px | Cabecera, formularios y tarjetas sin scroll horizontal | ✅ |
| 390 px | Registro en una columna, botones a ancho completo | ✅ |
| 768 px | Formularios centrados con ancho máximo | ✅ |
| 1440 px | Panel editorial + formulario en dos columnas | ✅ |
| Cuenta · 320 px | Cifras de “Miembro desde” y “Último acceso” sin recortes | ✅ |
| Privacidad · 320 px | Tabla con desplazamiento interno y foco visible | ✅ |

Capturas reales en `docs/capturas/`:

| Archivo | Contenido |
| --- | --- |
| `01-galeria-escritorio.png` | Galería con el acceso a la cuenta en la cabecera (1440 × 1200) |
| `02-galeria-movil.png` | Galería en móvil (390 × 844) |
| `03-registro-escritorio.png` | Registro completo en escritorio (1440 × 2400) |
| `04-registro-movil.png` | Registro en móvil (390 × 2100) |
| `05-login-escritorio.png` | Acceso en escritorio (1440 × 1100) |
| `06-login-movil.png` | Acceso en móvil (390 × 900) |
| `07-cuenta-escritorio.png` | Perfil, cifras e historial (1440 × 1400) |
| `08-cuenta-movil.png` | Cuenta en móvil (390 × 1900) |
| `09-privacidad-escritorio.png` | Política de privacidad (1440 × 2200) |
| `10-errores-registro.png` | Estado de error del registro con 11 campos marcados |
| `11-error-login.png` | Estado de error del acceso con credenciales incorrectas |
| `12-privacidad-movil.png` | Política de privacidad en móvil, con tabla desplazable (390 × 2000) |
| `13-cuenta-320.png` | Cuenta en el ancho mínimo soportado (320 × 1800) |

---

## 6. Pruebas pendientes de Firebase real

No se han podido ejecutar de extremo a extremo porque el proyecto no dispone de un proyecto Firebase con credenciales reales. Quedan preparadas y documentadas en `GUIA-FIREBASE.md`:

| Prueba | Cuándo se podrá hacer |
| --- | --- |
| Alta real con correo y contraseña | Al pegar `firebaseConfig` real |
| Documento `usuarios/{uid}` en Firestore | Tras publicar las reglas |
| Registro `accesos` tras alta y login | Tras crear la base de datos |
| Rechazo de lectura de perfiles ajenos | Con dos cuentas reales |
| Correo de verificación | Con Authentication configurado |
| Recuperación de contraseña | Con plantilla de correo y dominio autorizado |

Para marcarlas como verificadas, sigue la guía y actualiza esta tabla con la fecha y el resultado.

---

## 7. Cómo reproducir la campaña

```bash
# 1. Servir el proyecto por HTTP
npx serve .

# 2. Abrir en el navegador
#    http://localhost:3000/registro.html
#    http://localhost:3000/login.html
#    http://localhost:3000/cuenta.html

# 3. Validación HTML
npx --yes html-validate@8 registro.html login.html cuenta.html privacidad.html index.html

# 4. Sintaxis JS
Get-ChildItem js\*.js | ForEach-Object { node --check $_.FullName }
```

Para repetir las pruebas desde cero, abre las herramientas de desarrollo del navegador y ejecuta:

```js
localStorage.clear();
sessionStorage.clear();
```

Después recarga `registro.html`. El modo demostración volverá a estar vacío.

Las pruebas de navegador se ejecutaron con Chrome 157 y un servidor estático local. No se usaron datos personales reales: todos los nombres, correos y direcciones son ficticios.
