# 🎁 Web de cumpleaños

Una página estática (HTML + CSS + JavaScript, sin instalación ni build) con un regalo que, al abrirlo, lanza globos, confeti, música y un mensaje de cumpleaños. Lista para publicar en **GitHub Pages**.

## Archivos

```
index.html   → estructura de la página
styles.css   → diseño y animaciones
script.js    → confeti, globos, música y personalización
```

## 1. Personalizar

Abre `script.js` y edita el bloque `CONFIG` que está al principio:

```js
const CONFIG = {
  nombre: "María",
  mensaje: "Que este día esté lleno de risas, sorpresas y mucho pastel. ¡Que se cumplan todos tus deseos!",
  firma: "Con cariño ❤️",
};
```

Cambia el nombre, el mensaje y la firma. Se guarda solo en esos tres campos; no hace falta tocar nada más.

También puedes cambiar el nombre sin editar el código usando la URL:

```
https://tu-usuario.github.io/tu-repo/?nombre=Ana
```

Útil si quieres enviar la misma página a varias personas. Puedes combinar varios parámetros:

```
https://tu-usuario.github.io/tu-repo/?nombre=Ana&motion=1
```

`motion=1` fuerza los globos y el confeti aunque el dispositivo tenga activada la opción de accesibilidad «reducir movimiento» (si no se indica, se respeta esa preferencia y se muestra una versión más tranquila).

### Otros detalles que puedes cambiar

- **Título de la pestaña y descripción:** en `index.html`, etiquetas `<title>` y `<meta name="description">`.
- **Colores:** en `styles.css`, variables al principio (`--pink`, `--gold`, `--purple`, etc.).
- **Música:** se sintetiza con Web Audio y no depende de archivos. El botón 🔊 arriba a la derecha permite silenciarla.

## 2. Publicar en GitHub Pages (sin terminal)

1. Entra en [github.com](https://github.com) y crea un repositorio **público** (por ejemplo, `cumple`).
2. Pulsa **Add file → Upload files** y sube `index.html`, `styles.css`, `script.js` (el `README.md` es opcional).
3. Haz clic en **Commit changes**.
4. Ve a **Settings → Pages**.
5. En *Build and deployment*, elige **Deploy from a branch**.
6. En *Branch*, selecciona `main` y la carpeta `/ (root)`. Pulsa **Save**.
7. Espera un minuto. La página estará en:

```
https://TU-USUARIO.github.io/TU-REPO/
```

Cada vez que subas un cambio, GitHub Pages lo actualizará automáticamente.

## 3. Publicar con Git (opcional, desde esta carpeta)

Si ya tienes Git instalado y un repositorio creado en GitHub:

```bash
git init
git add .
git commit -m "Web de cumpleaños"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

Después activa Pages como en el paso 2.

## Notas

- La música solo empieza tras un clic (los navegadores lo exigen); el botón de sonido está arriba a la derecha.
- Respeta la opción de accesibilidad «reducir movimiento» del sistema.
- Funciona en móvil y escritorio.
- Las fuentes se cargan de Google Fonts; si no hay internet, se usan fuentes del sistema y todo lo demás sigue funcionando.
