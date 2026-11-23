# PROMPTS Y MEMORIA DEL TRABAJO CON IA · MurciaGram

Este documento deja constancia de **cómo se ha usado la inteligencia artificial** en la fase de cuentas de MurciaGram: qué se pidió, qué se aceptó, qué se corrigió y cómo se verificó. No es una transcripción literal de la conversación, sino una reconstrucción ordenada de los prompts y las decisiones.

- **Herramienta:** OpenCode (agente de código en el escritorio).
- **Modelo:** Big Pickle.
- **Fecha:** noviembre de 2026.
- **Ámbito:** análisis del enunciado, diseño, implementación, pruebas y documentación.
- **Datos personales en los prompts:** ninguno. Todos los ejemplos usan nombres y correos ficticios (`ana.garcia@example.com`).

> [!IMPORTANT]
> La IA se ha usado como **asistente de programación**, no como sustituto del criterio humano. Cada cambio se ha leído, ejecutado y probado en el navegador. Los errores que la IA introdujo se documentan abajo junto con su corrección.

---

## 1. Método de trabajo

1. **Contexto primero.** Antes de escribir código se revisaron `index.html`, `styles.css`, `README.md` y `DOCUMENTACION.md` para no romper la identidad visual ni las convenciones existentes.
2. **Diseño antes que implementación.** Se creó `design.md` con tokens, tipografía, componentes y criterios de aceptación.
3. **Cambios pequeños y verificables.** Primero validación pura, luego interfaz, luego servicio de autenticación y, por último, las páginas.
4. **Verificación en tres capas.**
   - Sintaxis y HTML: `node --check`, `html-validate`.
   - Comportamiento: flujo real en Chrome con un servidor local.
   - Presentación: capturas, medición de desbordamiento y Lighthouse.
5. **Documentación al final, pero con datos reales.** Las cifras de `PRUEBAS.md` y `MEMORIA.md` salen de la campaña ejecutada, no de suposiciones.

---

## 2. Prompts principales

### Prompt 1 · Analizar el punto de partida

> «Vas a trabajar sobre una galería llamada MurciaGram. Antes de tocar nada, revisa `index.html`, `styles.css`, `README.md` y `DOCUMENTACION.md`. Resume la identidad visual, las convenciones de código y los puntos donde habría que insertar un enlace de cuenta. No escribas código todavía.»

**Resultado:** inventario de tokens, tipografías, breakpoints y estructura semántica. Se detectó que la cabecera no tenía acceso a cuenta y que el pie ya incluía enlaces legales.

**Decisión humana:** mantener la paleta y añadir un enlace discreto con icono de usuario, sin alterar la navegación principal.

---

### Prompt 2 · Crear el sistema de diseño

> «Crea `design.md` para la fase de cuentas. Debe incluir tokens de color y tipografía, espaciado, radios, sombras, componentes (campos, botones, alertas, insignias, timeline), estados, reglas responsive desde 320 px y criterios de aceptación. Reutiliza la identidad existente; no inventes una paleta nueva.»

**Resultado:** `design.md` con tablas de tokens, reglas de uso del color, jerarquía tipográfica, especificación de componentes y checklist.

**Decisión humana:** se mantuvieron las variables ya usadas en `styles.css` y se añadieron solo las semánticas necesarias (`--danger`, `--success`, `--warning`).

---

### Prompt 3 · Estilos compartidos

> «Implementa `auth.css` siguiendo `design.md`. Debe cubrir registro, acceso, cuenta y política de privacidad. Mobile-first real desde 320 px, sin frameworks, con foco visible, estados de error y respeto por `prefers-reduced-motion`. No dupliques estilos de la galería: reutiliza sus variables.»

**Resultado:** hoja de estilos con layout editorial de dos columnas, formularios, alertas, insignias, timeline, tabla legal y reglas responsive.

**Verificación:** se midió el ancho de todas las páginas entre 320 y 1440 px. Apareció un desbordamiento de la tabla legal a 320 px, que se corrigió después (ver sección 4).

---

### Prompt 4 · Validación pura

> «Escribe `js/validacion.js` sin dependencias del DOM. Incluye una expresión regular de correo razonable, validación de nombre con Unicode, contraseña de 8 a 64 con minúscula, mayúscula y número, confirmación, fecha de nacimiento con edad mínima de 14 años, dirección, código postal español de 5 dígitos, ciudad, provincia, teléfono opcional y aceptación de términos. Devuelve mensajes en español listos para mostrar.»

**Resultado:** funciones puras y constantes exportadas (`EMAIL_REGEX`, `PASSWORD_MIN`, `EDAD_MINIMA`).

**Decisión humana:** se añadieron comprobaciones que la IA no había incluido en la primera versión: puntos consecutivos en el correo, longitud máxima de la parte local y rechazo de fechas imposibles.

---

### Prompt 5 · Utilidades de interfaz

> «Crea `js/ui.js` para centralizar el marcado de campos, los mensajes de error, las alertas, el estado de carga, el botón de mostrar/ocultar contraseña, la barra de fortaleza y el formateo de fechas en español. Evita imports circulares con `auth-service.js`.»

**Resultado:** helpers reutilizables por las tres páginas. La fortaleza se calcula con una copia local de la lógica para no crear un ciclo de imports.

**Decisión humana:** se revisó que los errores se anunciaran con `role="alert"` y que el foco se moviera al primer campo inválido.

---

### Prompt 6 · Servicio de autenticación con modo demo

> «Implementa `js/auth-service.js` como fachada. Si `firebase-config.js` tiene valores reales, usa Firebase Authentication y Firestore con imports modulares desde la CDN v10.12.2. Si no, usa un modo demo en `localStorage`. En demo, nunca guardes la contraseña en claro: usa PBKDF2-SHA-256 con sal aleatoria. La API pública debe ser la misma en ambos modos.»

**Resultado:** `MODO`, `registrar`, `iniciarSesion`, `cerrarSesion`, `obtenerSesion`, `obtenerPerfil`, `obtenerAccesos`, `enviarVerificacion`, `recargarVerificacion`, `solicitarRestablecimiento` y `traducirErrorAuth`.

**Decisión humana:** se eligió PBKDF2 con 120 000 iteraciones y sal de 16 bytes. Se comprobó que el hash resultante no contiene la contraseña y que la sesión respeta “mantener sesión”.

**Error detectado:** la primera versión incluía la clave `permission-denied:` sin comillas en el objeto de traducción de errores. `node --check` no lo señaló, pero el navegador sí: `SyntaxError: Unexpected token '-'`. Se corrigió y se verificó el flujo completo.

---

### Prompt 7 · Páginas de registro y acceso

> «Crea `registro.html`, `login.html`, `js/registro.js` y `js/login.js`. Reutiliza el sistema de diseño, incluye aviso RGPD, validación por campo, resumen de errores, mostrar/ocultar contraseña, diálogo de recuperación y enlaces cruzados. Sin frameworks y con HTML semántico.»

**Resultado:** formularios completos con 11 campos obligatorios en el alta, ayudas contextuales, barra de fortaleza, diálogo `<dialog>` y redirecciones.

**Verificación:** se probaron envío vacío, correo inválido, contraseñas distintas, duplicado, acceso incorrecto y acceso correcto. Todos los mensajes aparecieron donde debían.

---

### Prompt 8 · Página de cuenta

> «Crea `cuenta.html` y `js/cuenta.js`. Debe proteger la página, mostrar avatar con iniciales, nombre, correo, fecha de alta, último acceso, número de accesos, datos del perfil, historial y cierre de sesión. Si el perfil falla, muestra un aviso pero no ocultes el historial. Renderiza con `textContent`.»

**Resultado:** página con estado de carga, insignias de modo, rejilla de perfil, timeline de accesos y panel de seguridad.

**Decisión humana:** se añadió la redirección a `login.html?sesion=requerida` y se comprobó que no se mostraba ningún dato antes de validar la sesión.

---

### Prompt 9 · Reglas de Firestore

> «Escribe `firestore.rules` para que cada usuario solo pueda leer y crear su propio perfil, nadie pueda listar usuarios, los accesos sean inmutables y todo lo demás se deniegue. Valida tipos, longitudes, formato de fecha, código postal y que el correo coincida con el token. Añade comentarios en español.»

**Resultado:** reglas con funciones `esPropietario`, `perfilValido` y `actualizacionValida`, más una denegación explícita global.

**Decisión humana:** se revisó que `consentimiento.fecha`, `creadoEn`, `actualizadoEn` y `ultimoAcceso` usen `request.time` y que el cliente envíe `serverTimestamp()`.

---

### Prompt 10 · Documentación y pruebas

> «Genera `GUIA-FIREBASE.md`, `PRUEBAS.md`, `PROMPTS.md` y `MEMORIA.md` en español. La guía debe ser apta para alguien sin experiencia en Firebase. Las pruebas deben incluir resultados reales, no inventados. La memoria debe explicar arquitectura, modelo de datos, seguridad, RGPD, accesibilidad, limitaciones y trabajo futuro.»

**Resultado:** los cuatro documentos, más la actualización de `README.md`, `DOCUMENTACION.md` y `LEEME.txt`.

**Decisión humana:** se sustituyeron las afirmaciones genéricas por cifras medidas (11 campos, 41 px de desbordamiento corregidos, 44 caracteres de hash, 100/100/100 en Lighthouse).

---

## 3. Prompts de corrección

Estos prompts se usaron después de detectar problemas reales:

| Problema | Prompt de corrección | Resultado |
| --- | --- | --- |
| Error de sintaxis en el navegador | «El módulo `auth-service.js` falla con `Unexpected token '-'` en la línea 600. Revisa el objeto de errores y corrige solo lo necesario.» | Clave entrecomillada; flujo verificado de nuevo. |
| 9 avisos de `html-validate` | «Corrige estos avisos sin cambiar el diseño: `aria-label` en listas, `for` redundante en labels que envuelven checkbox, `scope` en tablas y `autocomplete` inválido.» | Validación HTML en 0 errores. |
| Tabla legal con scroll horizontal | «A 320 px la página de privacidad mide 361 px. Haz que solo la tabla se desplace, con foco de teclado y nombre accesible.» | Contenedor `<section>` con `overflow-x`, `tabindex` y `aria-label`; 0 px de desbordamiento. |
| Texto largo en las cifras de cuenta | «Comprueba que las fechas largas de `.account-stats` no se recortan a 320 px.» | Sin recortes; se mantuvo el formato `es-ES`. |

---

## 4. Qué se aceptó, qué se cambió y qué se rechazó

### Aceptado

- La estructura de fachada de `auth-service.js`.
- El uso de `<dialog>` nativo para la recuperación.
- La separación `validacion.js` / `ui.js` / páginas.
- El modo demo con PBKDF2 en lugar de texto plano.
- Los tokens y componentes de `design.md`.

### Cambiado

- La expresión regular inicial del correo se endureció.
- La validación de edad se amplió para rechazar fechas futuras e imposibles.
- El mensaje de credenciales incorrectas se unificó para no revelar si el correo existe.
- La tabla de privacidad pasó de `div` con `role="region"` a `<section>` nativo por indicación de `html-validate`.

### Rechazado

- Guardar la contraseña en `localStorage` “solo para la demo”. Se sustituyó por hash PBKDF2.
- Duplicar todos los estilos de la galería en `auth.css`. Se reutilizaron variables.
- Usar `innerHTML` para pintar el perfil. Se usó `textContent`.
- Añadir un framework CSS para “ir más rápido”. Se mantuvo CSS propio.
- Inventar resultados de pruebas de Firebase real. Se dejaron marcados como pendientes.

---

## 5. Verificación humana

Cada entrega parcial se comprobó con al menos una de estas acciones:

- Leer el diff completo antes de aceptarlo.
- Ejecutar `node --check` sobre los módulos.
- Ejecutar `html-validate`.
- Abrir la página en Chrome y recorrer el flujo con datos ficticios.
- Inspeccionar `localStorage` para confirmar que no había contraseñas en claro.
- Medir el ancho del documento a 320, 360, 390, 768, 1024 y 1440 px.
- Revisar la consola en busca de errores.
- Ejecutar Lighthouse en registro, acceso y cuenta.

Los resultados están en `PRUEBAS.md` y las capturas en `docs/capturas/`.

---

## 6. Limitaciones del uso de IA

- La IA no puede verificar un proyecto Firebase real sin credenciales; por eso el modo demo y la guía paso a paso son parte de la solución.
- Puede generar código sintácticamente válido pero semánticamente incorrecto; el error de la clave sin comillas es un ejemplo.
- Puede pasar por alto problemas de accesibilidad que solo aparecen al validar el HTML o al medir el layout.
- No sustituye la revisión legal de la política de privacidad ni la sustitución del correo de contacto real.
- Los textos legales son una base académica; antes de publicar, deben revisarse con una persona responsable.

---

## 7. Declaración de transparencia

La IA se ha utilizado para **acelerar la escritura de código y documentación**, proponer alternativas y detectar errores. Las decisiones de diseño, la selección de requisitos, la verificación en navegador y la corrección de los fallos han sido revisadas por la autora del proyecto. Ningún dato personal real se ha introducido en los prompts ni en las pruebas.

Si el tribunal necesita más detalle sobre algún cambio, el historial de archivos y las capturas de `docs/` permiten reconstruir el proceso.
