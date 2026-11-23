<img src="assets/banner.svg" alt="MurciaGram · El Pinterest de la Región de Murcia" width="100%">

# MurciaGram

**Descubre la Región de Murcia, un municipio a la vez.**

Una galería visual, libre y sencilla, para conocer ocho lugares de la Región de Murcia a través de sus fotografías, su historia y su gastronomía.

<p align="center">
  <a href="https://sandraberna06.github.io/MurciaGram2/">
    <img src="https://img.shields.io/badge/Abrir_MurciaGram-ver_la_web-0f5f5c?style=for-the-badge&logo=githubpages&logoColor=white" alt="Abrir MurciaGram">
  </a>
  <a href="https://github.com/SandraBerna06/MurciaGram2">
    <img src="https://img.shields.io/badge/Repositorio-P%C3%BAblico-181717?style=for-the-badge&logo=github&logoColor=white" alt="Repositorio público en GitHub">
  </a>
</p>

> **Web pública (GitHub Pages):** **https://sandraberna06.github.io/MurciaGram2/**
>
> Este repositorio es **público**: cualquiera puede ver el código, abrir la web y probar el registro de usuarios. No hace falta instalar nada.

> [!IMPORTANT]
> Para que la web funcione, el repositorio debe conservar **la estructura de carpetas**: `js/`, `assets/img/`, `docs/capturas/`, `docs/informes/` y `scripts/`. Si se suben todos los archivos sueltos a la raíz, las imágenes y los módulos JavaScript no se encuentran. Consulta [Publicar la web](#publicar-la-web).

---

## ¿Qué es MurciaGram?

MurciaGram es una **galería de inspiración visual** inspirada en Pinterest. Reúne en una sola página ocho municipios de la Región de Murcia y muestra, para cada uno, una fotografía, una descripción breve y un enlace a su web oficial.

Nació como un **proyecto académico de HTML5 y CSS3**, pero está pensado para que cualquiera pueda consultarlo: turistas, estudiantes, vecinos o curiosos que quieran hacerse una idea rápida de lo que ofrece la región.

La galería sigue siendo estática, pero ahora incluye **cuentas de usuario**: registro, acceso, perfil e historial de accesos con Firebase Authentication y Cloud Firestore. No hay anuncios ni rastreadores de terceros.

---

## Qué puedes hacer

- **Explorar los ocho municipios** en una galería de tarjetas.
- **Pasar el ratón o tocar una tarjeta** para ver su descripción, el botón de *me gusta* y el acceso a la web oficial del ayuntamiento.
- **Guardar tu ruta:** pulsa “Guardar en mi ruta” y la tarjeta cambia de color para que la recuerdes.
- **Crear tu cuenta** con nombre, apellidos, correo, contraseña, fecha de nacimiento y dirección postal.
- **Iniciar sesión** y consultar tu perfil, la fecha de alta, el último acceso y tu historial reciente.
- **Consultar desde cualquier dispositivo:** móvil, tablet u ordenador, con un diseño que se adapta.
- **Imprimir la página** y llevarte una versión limpia en papel, sin menús ni botones.

> Los botones de *me gusta* y de guardar son **visuales**: funcionan con CSS, sin JavaScript, y no se guardan al cerrar la página. La idea es que sirvan de base para una futura versión interactiva.

---

## Cuentas y privacidad

| Página | Para qué sirve |
| --- | --- |
| [`registro.html`](registro.html) | Crear una cuenta con validación por campo y aviso RGPD/LOPDGDD. |
| [`login.html`](login.html) | Iniciar sesión, mantenerla en el dispositivo y solicitar un restablecimiento. |
| [`cuenta.html`](cuenta.html) | Ver el perfil, las cifras de uso y el historial de accesos. |
| [`privacidad.html`](privacidad.html) | Política de privacidad completa: datos, finalidad, derechos y conservación. |

- **Contraseñas:** las gestiona **Firebase Authentication**. MurciaGram nunca las guarda en Firestore ni en su propio almacenamiento.
- **Perfil e historial:** se guardan en Cloud Firestore bajo `usuarios/{uid}` y `usuarios/{uid}/accesos`, con reglas que solo permiten al propietario leer y crear sus datos.
- **Modo demostración:** mientras `js/firebase-config.js` conserve los valores de ejemplo, la app funciona sin backend y guarda los datos solo en el navegador. La contraseña se protege con PBKDF2-SHA-256 y una sal aleatoria. El aviso amarillo de las páginas indica cuándo está activo.
- **Para activar Firebase:** sigue [`GUIA-FIREBASE.md`](GUIA-FIREBASE.md). En cuanto pegues una configuración real, el modo demo se desactiva automáticamente.

La política de privacidad incluye un correo de contacto de ejemplo (`privacidad@murciagram.es`) que **debe sustituirse antes de publicar** fuera del ámbito académico.

### Estado del backend

| Entorno | Estado | Evidencia |
| --- | --- | --- |
| Modo demostración local | ✅ Probado de extremo a extremo | [`PRUEBAS.md`](PRUEBAS.md) |
| Firebase Authentication + Firestore | ⏳ Código listo, pendiente de configuración real | [`GUIA-FIREBASE.md`](GUIA-FIREBASE.md) |

En cuanto se pegue una `firebaseConfig` real y se publiquen las reglas, conviene repetir la tabla de pruebas pendientes y actualizar esta sección con la fecha.

---

## Documentación de la fase de cuentas

| Documento | Contenido |
| --- | --- |
| [`design.md`](design.md) | Sistema de diseño: tokens, tipografía, componentes, estados y responsive. |
| [`MEMORIA.md`](MEMORIA.md) | Memoria académica: objetivos, arquitectura, modelo de datos, seguridad, RGPD y conclusiones. |
| [`GUIA-FIREBASE.md`](GUIA-FIREBASE.md) | Configuración paso a paso de Firebase, reglas, emuladores y problemas frecuentes. |
| [`PRUEBAS.md`](PRUEBAS.md) | Campaña de pruebas, resultados y enlaces a capturas e informes Lighthouse. |
| [`PROMPTS.md`](PROMPTS.md) | Prompts de IA, decisiones, errores detectados y verificación humana. |

Las capturas están en [`docs/capturas/`](docs/capturas/) y los informes de Lighthouse en [`docs/informes/`](docs/informes/).

---

## Los ocho municipios

| Municipio | Categoría | Qué no te puedes perder |
| --- | --- | --- |
| **Lorca** | Cultura · Interior | La Fortaleza del Sol y su Semana Santa |
| **Cartagena** | Cultura · Costa | El teatro romano y el puerto milenario |
| **Caravaca de la Cruz** | Cultura · Noroeste | El Real Alcázar-Santuario y los Caballos del Vino |
| **Murcia** | Gastronomía · Huerta | La Catedral y la huerta murciana |
| **Águilas** | Costa · Mediterráneo | Sus calas turquesa y el carnaval |
| **Mazarrón** | Costa · Bahía | Las Gredas de Bolnuevo y sus playas |
| **Cieza** | Naturaleza · Vega Alta | La floración del valle del Segura |
| **Jumilla** | Gastronomía · Altiplano | Sus viñedos y el vino Monastrell |

---

## Cómo navegar

| Dispositivo | Qué encontrarás |
| --- | --- |
| **Móvil** | Una columna de tarjetas a pantalla completa y un menú de municipios al principio. |
| **Tablet** | Dos columnas para comparar destinos de un vistazo. |
| **Ordenador** | Una barra lateral fija con los municipios y una galería fluida a la derecha. |

Consejos rápidos:

1. Entra en **https://sandraberna06.github.io/MurciaGram2/**.
2. Desplázate por la galería o usa los enlaces de municipios.
3. Pasa el ratón por una foto (o tócala en el móvil) para leer su descripción.
4. Pulsa el corazón si quieres marcarla y el enlace para visitar la web oficial.
5. Si quieres una cuenta, pulsa **Acceder** en la cabecera y elige **Crear una cuenta**.

También puedes recorrer toda la página **solo con el teclado**: la tecla `Tab` va resaltando cada enlace y botón con un contorno dorado.

---

## Accesibilidad

El proyecto cuida detalles que facilitan el uso a todo el mundo:

- Textos alternativos descriptivos en todas las fotografías.
- Contraste de color revisado para cumplir **WCAG AA**.
- Foco visible y navegación completa por teclado.
- Formularios con etiquetas visibles, errores anunciados y foco en el primer campo inválido.
- Botones de mostrar/ocultar contraseña con `aria-pressed` y etiqueta dinámica.
- Respeto por la opción del sistema **“reducir movimiento”**.
- Versión de impresión sin elementos decorativos.
- Lighthouse: **100 en accesibilidad** en registro, acceso y cuenta.

> El zoom del navegador está desactivado porque así lo pedía el enunciado académico. En una web real se recomendaría permitirlo.

---

## Un proyecto académico

MurciaGram se ha construido sin frameworks y con un enfoque artesanal, con estos ingredientes:

- **HTML5 semántico**: `header`, `nav`, `main`, `aside`, `footer`, `article`, `figure` y `figcaption`, sin `div` de maquetación.
- **CSS3 moderno**: Flexbox, CSS Grid, variables, `:has()`, `:checked`, transiciones con `cubic-bezier` y media queries con sintaxis de rangos.
- **Diseño mobile-first**: la versión móvil es la base; tablet y escritorio se añaden con mejoras progresivas.
- **JavaScript modular**: validación pura, utilidades de interfaz y una fachada de autenticación que funciona con Firebase o en modo demostración.
- **Firebase Authentication + Cloud Firestore**, con reglas de seguridad, verificación de correo y registro de accesos.
- **Privacidad desde el diseño**: minimización de datos, consentimiento versionado y política RGPD/LOPDGDD.
- **Imágenes responsive** con `<picture>`, versiones de 400 px y 1000 px, y carga diferida.
- **Estilos de impresión** para obtener una página limpia en papel.
- **ImageMagick** para recortar y optimizar las fotografías, con una tarea automatizada en VS Code.

Si te interesa el detalle técnico —estructura del CSS, breakpoints, flujo de imágenes o despliegue— consulta **[DOCUMENTACION.md](DOCUMENTACION.md)**.

---

## Créditos de las imágenes

Las fotografías proceden de **Wikimedia Commons** y se han recortado y optimizado para el proyecto. Cada imagen conserva su licencia original.

| Municipio | Fotografía original | Autoría | Licencia |
| --- | --- | --- | --- |
| Lorca | [Fortaleza del Sol (Lorca)](<https://commons.wikimedia.org/wiki/File:Lorca_-_2011-12-17_Fortaleza_del_Sol_(Lorca)_001.jpg>) | Luiyo | CC BY-SA 2.0 |
| Cartagena | [Teatro romano de Cartagena](https://commons.wikimedia.org/wiki/File:Teatro_romano_de_Cartagena,_Espa%C3%B1a,_2022-07-16,_DD_02.jpg) | Diego Delso | CC BY-SA 4.0 |
| Caravaca de la Cruz | [Vista de Caravaca de la Cruz](https://commons.wikimedia.org/wiki/File:Lots_of_buildings_with_mission_tile_roofs_in_Caravaca_de_la_Cruz,_Noroeste,_Murcia,_Spain,_2025_February.jpg) | Ximonic (Simo Räsänen) | CC BY-SA 4.0 |
| Murcia | [Sábado Santo en Murcia](https://commons.wikimedia.org/wiki/File:S%C3%A1bado_Santo_en_Murcia_19-04-2014_edited.jpg) | nesimo | CC BY-SA 2.0 |
| Águilas | [Tormenta sobre Águilas](<https://commons.wikimedia.org/wiki/File:Storm_over_Aguilas_(Spain)_-_panoramio.jpg>) | HunTeR | CC BY-SA 3.0 |
| Mazarrón | [Gredas de Bolnuevo](https://commons.wikimedia.org/wiki/File:Enchanted_City_of_Bolnuevo.jpg) | Martinvl | CC BY-SA 4.0 |
| Cieza | [Cieza desde la Sierra de Ascoy](https://commons.wikimedia.org/wiki/File:Cieza_desde_la_Sierra_de_Ascoy.jpg) | Ramón Cutanda López | CC BY 2.0 |
| Jumilla | [Plaza de Arriba de Jumilla](https://commons.wikimedia.org/wiki/File:Jumilla._Plaza_de_Arriba.JPG) | Enrique Íñiguez Rodríguez (Qoan) | CC BY-SA 3.0 |

Si reutilizas una fotografía, conserva la atribución y la licencia indicadas.

---

## Ver el proyecto en local

No es necesario para consultar la web, pero si quieres abrirlo en tu ordenador:

```bash
git clone https://github.com/SandraBerna06/MurciaGram2.git
cd MurciaGram2
```

Después, en VS Code, abre la carpeta y usa **Live Server** sobre `index.html`. También puedes ejecutar:

```bash
npx serve .
```

> [!IMPORTANT]
> Las páginas de registro, acceso y cuenta usan módulos ES y `crypto.subtle`. Deben abrirse por **HTTP o HTTPS** (`http://localhost`), no con `file://`. El modo demostración necesita un contexto seguro para calcular el hash de la contraseña.

Para conectar un proyecto Firebase real, sigue [`GUIA-FIREBASE.md`](GUIA-FIREBASE.md). Si prefieres probar sin crear nada, abre `registro.html` desde el servidor local: el aviso amarillo indica que estás en modo demostración.

---

## Publicar la web

El repositorio `SandraBerna06/MurciaGram2` es público. Para que GitHub Pages sirva la web:

1. Sube **las carpetas completas**, no los archivos sueltos. La raíz debe quedar así:
   ```text
   MurciaGram2/
   ├── index.html
   ├── registro.html
   ├── login.html
   ├── cuenta.html
   ├── privacidad.html
   ├── styles.css
   ├── auth.css
   ├── js/
   ├── assets/
   ├── docs/
   ├── scripts/
   └── ...
   ```
2. En GitHub entra en **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Selecciona la rama **`main`** y la carpeta **`/ (root)`**. Guarda.
5. Espera 1–2 minutos y abre **https://sandraberna06.github.io/MurciaGram2/**.
6. Comprueba que `https://sandraberna06.github.io/MurciaGram2/registro.html` carga y que la galería muestra **“Acceder”** en la cabecera.

> Si los archivos están todos en la raíz del repositorio, borra esa subida y vuelve a arrastrar **las carpetas** desde el ZIP de entrega. Las rutas relativas (`assets/img/…`, `js/…`, `docs/…`) son obligatorias.

---

## Licencia

- **Código** (`index.html`, `styles.css`, `auth.css`, `js/`, scripts y páginas de cuenta): proyecto académico; puede reutilizarse con fines educativos citando la autoría.
- **Fotografías**: cada una mantiene su licencia de Wikimedia Commons (CC BY o CC BY-SA, según la tabla).
- **Tipografías**: fuentes del sistema, sin archivos externos.

---

<p align="center">
  Proyecto de <a href="https://github.com/SandraBerna06">@SandraBerna06</a> · Región de Murcia · 2026
  <br>
  <a href="https://sandraberna06.github.io/MurciaGram2/">sandraberna06.github.io/MurciaGram2</a>
</p>
