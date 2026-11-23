# design.md · Sistema de diseño de MurciaGram

> Documento de referencia para personas y agentes de IA. Define la identidad visual de
> **MurciaGram** y las reglas que deben cumplir la galería, el registro, el inicio de sesión
> y la página de cuenta. Cualquier componente nuevo debe reutilizar los tokens de este archivo.

- **Proyecto:** MurciaGram · El Pinterest de la Región de Murcia.
- **Versión:** 1.0 · noviembre de 2026.
- **Punto de partida:** identidad ya utilizada en `index.html` y `styles.css` (tarea anterior).
- **Implementación:** `styles.css` (galería) y `auth.css` (cuentas, formularios y documentación legal).
- **Principio rector:** Mediterráneo editorial. Papel crema, verde profundo, terracota y dorado;
  tipografía serif para titulares, sans-serif para interfaz; esquinas generosas y sombras suaves.

---

## 1. Principios de diseño

1. **Coherencia antes que novedad.** Los formularios parecen parte de la misma web que la galería:
   mismos colores, tipografías, radios, sombras y microinteracciones.
2. **Claridad.** Un formulario = una tarea. Etiquetas siempre visibles, ayudas breves y mensajes
   de error que explican qué corregir y cómo.
3. **Mobile-first real.** La base se diseña para 320 px y se amplía con mejoras progresivas.
4. **Accesibilidad.** Contraste WCAG AA, foco visible, navegación por teclado, áreas táctiles de
   al menos 44 × 44 px y alternativas textuales.
5. **Privacidad desde el diseño.** Solo se piden datos necesarios, se informa antes de enviar y
   nunca se almacena la contraseña en la aplicación.
6. **Movimiento con propósito.** Animaciones cortas para dar respuesta, nunca para retrasar la tarea.

---

## 2. Paleta de color

### 2.1. Colores de marca

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#f7f0e5` | Fondo general crema |
| `--bg-deep` | `#efe0cc` | Fondo de imágenes y zonas hundidas |
| `--surface` | `#fffdf9` | Tarjetas, formularios y cabecera |
| `--surface-2` | `#fbf4e9` | Campos, chips y fondos secundarios |
| `--ink` | `#142423` | Texto principal y botones oscuros |
| `--ink-soft` | `#3e504d` | Texto secundario de alta legibilidad |
| `--muted` | `#5f6e6a` | Texto de ayuda, metadatos |
| `--accent` | `#c2410c` | Terracota: enlaces, acentos y errores de marca |
| `--accent-dark` | `#9a3210` | Hover de terracota |
| `--accent-soft` | `#f7d9c9` | Fondo de hover y resaltados cálidos |
| `--teal` | `#0f5f5c` | Verde principal de acciones y foco |
| `--teal-dark` | `#0a4643` | Hover y superficies profundas |
| `--gold` | `#e7a92f` | Acento dorado, foco visible e insignias |
| `--line` | `rgba(20, 36, 35, .12)` | Bordes y separadores |

### 2.2. Colores semánticos (formularios)

| Token | Valor | Uso |
| --- | --- | --- |
| `--danger` | `#b42318` | Errores, bordes inválidos |
| `--danger-soft` | `#fef3f2` | Fondo de mensajes de error |
| `--danger-line` | `#f3b6b0` | Borde de mensajes de error |
| `--success` | `#067647` | Campos válidos, confirmaciones |
| `--success-soft` | `#ecfdf3` | Fondo de mensajes de éxito |
| `--warning` | `#b54708` | Avisos y modo demostración |
| `--warning-soft` | `#fffaeb` | Fondo de avisos |

### 2.3. Reglas de uso

- El **verde** comunica acción principal, seguridad y confianza. No se usa para errores.
- El **dorado** es acento y foco. Nunca se usa como color de texto sobre crema sin comprobar contraste.
- La **terracota** se reserva para enlaces, cifras y detalles editoriales. En formularios se usa
  para enlaces legales y pequeños acentos, no para botones primarios.
- Los estados nunca dependen solo del color: siempre llevan icono, texto o borde adicional.
- Degradados permitidos: `linear-gradient(140deg, var(--accent), var(--gold))` en la marca y
  `linear-gradient(135deg, var(--teal-dark), var(--teal))` en paneles oscuros.

---

## 3. Tipografía

### 3.1. Familias

| Token | Pila | Uso |
| --- | --- | --- |
| `--font-display` | `"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif` | Titulares, cifras grandes, marca |
| `--font-sans` | `"Segoe UI", system-ui, -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif` | Interfaz, cuerpo, formularios |

No se cargan fuentes externas: se usan pilas del sistema para evitar peticiones, mejorar el
rendimiento y respetar la privacidad. La marca alterna serif con la palabra *Gram* en cursiva
terracota (o dorada sobre fondo oscuro).

### 3.2. Jerarquía y escala

| Rol | Tamaño | Peso | Interlineado | Notas |
| --- | --- | --- | --- | --- |
| `h1` de formulario | `clamp(1.85rem, 6vw, 2.55rem)` | 700 serif | 1.02 | `letter-spacing: -.04em` |
| `h2` de panel visual | `clamp(1.7rem, 4.5vw, 2.6rem)` | 700 serif | 1.05 | Puede incluir `<em>` dorado |
| `h2` de sección | `clamp(1.4rem, 4vw, 2rem)` | 700 serif | 1.08 | Títulos de panel |
| `h3` / nombre de tarjeta | `1.05–1.35rem` | 700 serif | 1.15 | |
| Cuerpo | `.95–1rem` | 400 | 1.55–1.65 | Máximo ~68 caracteres por línea |
| Texto de formulario | `.9–.95rem` | 400 | 1.45 | Campos y ayudas |
| Etiqueta de campo | `.82rem` | 700 | 1.3 | Siempre visible |
| Metadatos / kicker | `.68–.78rem` | 700–850 | 1.4 | Mayúsculas y `letter-spacing: .09–.18em` |
| Eyebrow | `.7rem` | 800 | 1.4 | Terracota o dorado, mayúsculas |
| Error / ayuda | `.76–.82rem` | 500–600 | 1.45 | Sin mayúsculas forzadas |

### 3.3. Reglas

- Los titulares usan `text-wrap: balance`; los párrafos largos, `text-wrap: pretty`.
- No se usa texto justificado. No se baja de `.75rem` en contenido esencial.
- Los enlaces se subrayan o se distinguen por color y peso; nunca solo por color.
- Los mensajes de error se redactan en segunda persona, en positivo y sin culpabilizar:
  “Escribe un correo válido”, no “Correo incorrecto”.

---

## 4. Espaciado, tamaños y retícula

### 4.1. Escala de espaciado (base 4 px)

| Token | Valor | Uso |
| --- | --- | --- |
| `--space-1` | `.25rem` | Separaciones mínimas |
| `--space-2` | `.5rem` | Icono + texto |
| `--space-3` | `.75rem` | Campos compactos |
| `--space-4` | `1rem` | Separación base |
| `--space-5` | `1.25rem` | Padding de tarjetas en móvil |
| `--space-6` | `1.5rem` | Bloques |
| `--space-8` | `2rem` | Padding de tarjetas en escritorio |
| `--space-10` | `2.5rem` | Separación entre secciones |
| `--space-12` | `3rem` | Márgenes de página en escritorio |

### 4.2. Contenedores y anchuras

| Elemento | Ancho |
| --- | --- |
| Página de autenticación | `max-inline-size: 1180px`, padding lateral `1rem` (móvil) / `1.5rem` (tablet) |
| Tarjeta de formulario | `max-inline-size: 36rem` (registro) / `32rem` (login) |
| Página legal | `max-inline-size: 48rem` |
| Página de cuenta | `max-inline-size: 1100px` |
| Campos | `block-size` mínima `3rem`; texto `.95rem` |
| Área táctil mínima | `2.75rem` (44 px) |

### 4.3. Retícula responsive

- **Móvil (< 600 px):** una columna. El panel visual se convierte en una cabecera compacta
  de 200–240 px con la imagen y el titular; los beneficios se ocultan para priorizar el formulario.
- **Tablet (600–800 px):** una columna centrada; formularios a dos columnas para nombre/apellidos,
  fecha/teléfono y CP/ciudad. Cabecera en fila.
- **Escritorio (> 800 px):** dos columnas: panel visual pegajoso a la izquierda (≈ 45 %) y
  formulario a la derecha. En la galería se mantiene la barra lateral fija existente.
- **Escritorio amplio (> 1100 px):** se incrementa el aire, no el tamaño de letra del formulario.
- Los formularios nunca superan los 36rem de ancho para mantener la legibilidad.

---

## 5. Bordes, radios y sombras

| Token | Valor | Uso |
| --- | --- | --- |
| `--radius` | `1.35rem` | Tarjetas y paneles |
| `--radius-sm` | `.85rem` | Campos, avisos y chips |
| `--radius-pill` | `999px` | Botones, etiquetas y enlaces tipo píldora |
| `--border` | `1px solid var(--line)` | Bordes por defecto |
| `--border-field` | `1.5px solid var(--line)` | Campos de formulario |
| `--shadow` | `0 2px 4px rgba(20,36,35,.05), 0 16px 34px -18px rgba(20,36,35,.38)` | Tarjetas en reposo |
| `--shadow-hover` | `0 8px 16px rgba(20,36,35,.10), 0 34px 64px -22px rgba(20,36,35,.48)` | Elevación al interactuar |
| `--shadow-button` | `0 12px 22px -12px rgba(15,95,92,.8)` | Botón primario |

- Las tarjetas de formulario usan `--radius` + `1px` de borde y `--shadow`.
- El panel visual usa `--radius` + `.35rem` y `--shadow-hover`.
- Los campos usan `--radius-sm` y borde de 1,5 px para que el estado de foco sea evidente.
- No se usan sombras duras ni negras puras: siempre con tinte verde (`20, 36, 35`).

---

## 6. Componentes

### 6.1. Botón primario de autenticación (`.btn-auth`)

| Propiedad | Valor |
| --- | --- |
| Fondo | `var(--teal)` |
| Texto | `#fff`, `.95rem`, peso 800 |
| Forma | píldora, `min-block-size: 3.1rem`, ancho completo |
| Icono | 1.1rem, trazo 2, a la derecha o izquierda |
| Hover | `var(--teal-dark)` + `translateY(-1px)` |
| Activo | `translateY(0) scale(.99)` |
| Foco | `outline: 3px solid var(--gold); outline-offset: 3px` |
| Deshabilitado | opacidad `.65`, cursor `not-allowed`, sin sombra ni desplazamiento |
| Cargando | spinner blanco + texto “Creando cuenta…” / “Entrando…” |

### 6.2. Botón secundario (`.btn-auth--ghost`)

Fondo transparente, texto verde, borde verde al 25 %. Hover con fondo `#e9f2f0`.
Se usa para “Crear una cuenta nueva” y acciones que no son la tarea principal.

### 6.3. Campo de formulario (`.field`, `.input`, `.select`)

- Etiqueta arriba, siempre visible; asterisco terracota en obligatorios y `aria-required`.
- Icono decorativo a la izquierda en campos de identificación (`.field__icon`), padding izquierdo
  de `2.75rem`.
- Fondo `--surface-2`, borde `--border-field`, radio `.8rem`, altura mínima `3rem`.
- Placeholder con contraste ≥ 4.5:1 (`#8a9692` sobre `#fbf4e9`) y solo como ejemplo, nunca como
  sustituto de la etiqueta.
- Texto de ayuda debajo del campo, `.78rem`, color `--muted`.
- El campo de contraseña reserva `3.1rem` a la derecha para el botón de visibilidad.

### 6.4. Botón mostrar/ocultar contraseña

- Icono de ojo (24 × 24, trazo 2) dentro del campo, alineado a la derecha.
- Área táctil `2.5rem`; `aria-pressed` y `aria-label` cambian entre “Mostrar contraseña” y
  “Ocultar contraseña”.
- Fondo transparente en reposo; `--accent-soft` en hover; verde suave cuando la contraseña es visible.
- Nunca cambia el valor ni envía el formulario (`type="button"`).

### 6.5. Checkbox y consentimiento

- Checkbox nativo de `1.15rem` con `accent-color: var(--teal)` para conservar accesibilidad.
- Etiqueta completa clicable, texto `.83rem` e interlineado 1.5.
- Los enlaces legales son verdes, subrayados y se abren en pestaña nueva con `rel="noopener"`.
- El consentimiento obligatorio no se marca por defecto. Las comunicaciones comerciales son
  opcionales y también desmarcadas.

### 6.6. Fortaleza de contraseña

- Cuatro barras de `.32rem` separadas `.3rem`.
- Puntuación 1 = rojo (`#d92d20`), 2 = naranja (`#dc6803`), 3 = dorado (`#e7a92f`), 4 = verde
  (`#067647`).
- Texto `aria-live="polite"`: “Seguridad de la contraseña: débil / aceptable / buena / fuerte”.
- Lista de requisitos con icono de check; cada requisito cambia a verde al cumplirse.
- La fortaleza es orientativa; la validación bloqueante exige 8 caracteres, mayúscula, minúscula
  y número.

### 6.7. Avisos y mensajes

| Componente | Fondo | Borde | Icono |
| --- | --- | --- | --- |
| `.form-alert--error` | `--danger-soft` | `--danger-line` | Alerta |
| `.form-alert--success` | `--success-soft` | `#a6f4c5` | Check |
| `.form-alert--info` | `#eff8ff` | `#b2ddff` | Información |
| `.notice--demo` | `--warning-soft` | discontinuo `rgba(194,65,12,.35)` | Info |

- Los mensajes globales llevan `role="alert"` y `tabindex="-1"`.
- Los errores de campo se muestran bajo el campo, con `aria-invalid="true"` y `aria-describedby`.
- Nunca se usa una ventana `alert()` del navegador.

### 6.8. Página de cuenta

- Cabecera verde con degradado y círculos decorativos; avatar circular dorado con iniciales.
- Tarjetas `.panel` con radios, borde y sombra.
- Historial de accesos como línea de tiempo: punto dorado, título, fecha completa en español y
  agente de usuario truncado como metadato.
- Estado vacío del historial con texto claro y sin iconos decorativos innecesarios.

### 6.9. Diálogo de recuperación

- `<dialog>` nativo con `::backdrop` verde oscuro translúcido.
- Tarjeta blanca, mismo radio y sombra; botón de cierre de 44 px; foco atrapado por el navegador.
- Se cierra con Escape, con el botón de cierre o pulsando fuera.

---

## 7. Estados de los elementos

| Estado | Campo | Botón | Enlace |
| --- | --- | --- | --- |
| Normal | Borde `--line`, fondo `--surface-2` | Verde, sombra suave | Color de texto/terracota |
| Hover | Borde `rgba(15,95,92,.35)` | Verde oscuro, `-1px` | Subrayado y oscurecido |
| Foco (`:focus-visible`) | Borde verde + anillo dorado `4px` | Anillo dorado `3px` + offset | Anillo dorado y subrayado |
| Activo | Borde verde | `scale(.99)` | Color terracota oscuro |
| Válido | Borde verde al 55 % + icono verde | — | — |
| Error | Borde `--danger`, fondo `#fffafa`, icono rojo | — | — |
| Deshabilitado | Fondo `#f1ece3`, texto `--muted`, cursor `not-allowed` | Opacidad `.65`, sin sombra | Opacidad `.5`, sin subrayado |
| Cargando | — | Spinner + `aria-busy="true"` | — |

**Nunca se elimina el anillo de foco.** Si un componente necesita un foco distinto, se cambia el
color, no se oculta.

---

## 8. Iconografía y elementos gráficos

- **Estilo:** línea, 24 × 24, trazo 2, extremos y uniones redondeados, sin relleno.
- **Implementación:** sprite SVG inline con `<symbol>` y `<use>`; el color se hereda con
  `stroke: currentColor`.
- **Tamaños:** `1rem` dentro de texto, `1.15rem` en campos, `1.3rem` en botones redondos.
- **Iconos disponibles:** ubicación, corazón, enlace, marcador, flecha, sol, usuario, correo,
  candado, ojo, ojo tachado, calendario, casa, teléfono, check, alerta, información, escudo,
  salida, reloj y llave.
- **Decoración:** círculos concéntricos y halos dorados/verdes en paneles oscuros; la marca usa
  una gota-redondeada girada −7°. No se usan ilustraciones recargadas ni emojis como iconos de
  interfaz.
- **Imágenes:** fotografías reales de MurciaGram, siempre con `alt` descriptivo o `alt=""` si son
  decorativas. En autenticación, la imagen es ambiental y no transmite información necesaria.

---

## 9. Movimiento

| Interacción | Duración | Curva |
| --- | --- | --- |
| Hover de botón/enlace | 250–350 ms | `--ease-soft` |
| Elevación de tarjeta | 500 ms | `--ease-pop` |
| Aparición de overlay | 350 ms | `--ease-soft` |
| Spinner | 800 ms lineal | — |

- `--ease-pop: cubic-bezier(.34, 1.56, .64, 1)` para pequeños rebotes.
- `--ease-soft: cubic-bezier(.22, .61, .36, 1)` para color y opacidad.
- Se respeta `prefers-reduced-motion: reduce`: todas las transiciones se reducen a `.01ms`.

---

## 10. Accesibilidad

- Contraste mínimo 4.5:1 en texto normal y 3:1 en componentes grandes.
- Foco visible dorado sobre cualquier fondo.
- Un solo `<h1>` por página; jerarquía de encabezados sin saltos.
- Formularios con `<label for>`, `autocomplete`, `inputmode` cuando procede y `aria-describedby`.
- Errores anunciados con `role="alert"` y resumen global al enviar.
- Enlace “Saltar al contenido” en las páginas nuevas.
- El estado de mostrar contraseña se comunica con `aria-pressed`, no solo con el icono.
- Las imágenes decorativas llevan `alt=""`; las informativas, texto alternativo descriptivo.
- Objetivos táctiles de 44 px y separación suficiente.
- La página funciona con zoom al 200 % y a 320 px de ancho.

---

## 11. Voz y tono

- Cercano, claro y mediterráneo; tuteo coherente en toda la aplicación.
- Mensajes de error concretos y accionables: qué falta y cómo corregirlo.
- Nada de mayúsculas sostenidas en párrafos ni signos de exclamación múltiples.
- El modo demostración se explica sin ambigüedad: **“Modo demostración: los datos se guardan
  solo en este navegador”**.
- La información legal usa un tono sobrio y directo, sin tecnicismos innecesarios.

---

## 12. Implementación y mapa de archivos

| Necesidad | Archivo |
| --- | --- |
| Tokens de la galería | `styles.css` (`:root`) |
| Tokens y componentes de cuenta | `auth.css` (`:root` y secciones) |
| Registro | `registro.html` + `js/registro.js` |
| Inicio de sesión | `login.html` + `js/login.js` |
| Cuenta e historial | `cuenta.html` + `js/cuenta.js` |
| Privacidad y RGPD | `privacidad.html` |
| Configuración Firebase | `js/firebase-config.js` |
| Servicio de autenticación | `js/auth-service.js` |
| Validaciones puras | `js/validacion.js` |
| Utilidades de interfaz | `js/ui.js` |
| Reglas de seguridad | `firestore.rules` |

### 12.1. Convenciones CSS

- Metodología ligera tipo BEM: `.auth-card__head`, `.field__error`, `.timeline__item`.
- Mobile-first con media queries de rangos: `@media (width >= 600px)` y `@media (width > 800px)`.
- Variables para todo color, radio, sombra y duración; no se escriben valores mágicos nuevos.
- Estados con clases (`is-invalid`, `is-valid`, `is-loading`) y atributos ARIA.
- Sin `!important` salvo en utilidades de accesibilidad o sobreescrituras de `body` en páginas nuevas.

### 12.2. Criterios de aceptación visual

1. La cabecera y la marca son idénticas en galería, registro, login y cuenta.
2. Los formularios usan la misma paleta, tipografía, radios y sombras que las tarjetas.
3. El foco es visible en todos los controles y nunca se elimina.
4. Los errores se entienden sin depender del color.
5. A 320 px no hay desplazamiento horizontal y los botones siguen siendo cómodos.
6. El modo demostración se distingue claramente del modo Firebase.
7. La página de cuenta parece una extensión natural de la galería, no un panel ajeno.

---

## 13. Lo que no se debe hacer

- No introducir azules, morados o grises fríos ajenos a la paleta.
- No usar sombras negras duras, bordes de 3 px ni esquinas rectas en tarjetas.
- No ocultar etiquetas usando solo placeholders.
- No usar `alert()`, `confirm()` ni `prompt()` del navegador.
- No mostrar la contraseña por defecto ni guardarla en texto plano.
- No inventar datos de usuario, accesos o verificaciones en la interfaz.
- No prometer seguridad absoluta ni afirmar que se cumple el RGPD sin revisar la configuración
  real de Firebase y el aviso legal.
- No añadir librerías o fuentes externas si los tokens del sistema ya resuelven la necesidad.

---

*Este documento se mantiene junto al código y se usa como contexto en las instrucciones al agente
de IA. Cualquier cambio visual relevante debe actualizar primero `design.md` y después el CSS.*

