# 🚀 Guía Rápida de Despliegue en GitHub Pages

## Pasos para publicar la aplicación

### 1. Crear repositorio en GitHub
1. Ve a [GitHub](https://github.com) e inicia sesión
2. Haz clic en el botón "New" (Nuevo repositorio)
3. Nombra tu repositorio (ejemplo: `gestion-clientes`)
4. Marca como público o privado según prefieras
5. No agregues README, .gitignore o licencia (ya están incluidos)
6. Haz clic en "Create repository"

### 2. Subir archivos
Puedes usar GitHub Desktop, Git desde la terminal, o subir directamente desde la web:

#### Opción A: Desde la web de GitHub (más fácil)
1. En tu nuevo repositorio, haz clic en "uploading an existing file"
2. Arrastra TODOS los archivos y carpetas de este proyecto
3. Escribe un mensaje de commit (ejemplo: "Initial commit")
4. Haz clic en "Commit changes"

#### Opción B: Con Git desde terminal
```bash
# En la carpeta del proyecto
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

### 3. Activar GitHub Pages
1. Ve a tu repositorio en GitHub
2. Haz clic en "Settings" (Configuración)
3. En el menú lateral, haz clic en "Pages"
4. En "Source" (Origen), selecciona:
   - Branch: `main` (o `master`)
   - Folder: `/ (root)`
5. Haz clic en "Save" (Guardar)
6. Espera 2-5 minutos para que se despliegue
7. Verás un mensaje verde con la URL de tu aplicación

### 4. Acceder a tu aplicación
Tu aplicación estará disponible en:
```
https://TU-USUARIO.github.io/TU-REPOSITORIO/
```

## ✅ Verificación

Para verificar que todo funciona:
1. Abre la URL de tu aplicación
2. Deberías ver la pantalla de login
3. Inicia sesión con:
   - Usuario: `Nestor`
   - Contraseña: `1005`
4. Verifica que puedas acceder a todas las secciones

## 🔧 Solución de problemas

### La página no carga
- Verifica que el archivo `.nojekyll` esté en la raíz del proyecto
- Asegúrate de que `index.html` esté en la raíz
- Espera unos minutos más, a veces GitHub tarda

### Error 404
- Verifica que seleccionaste la rama correcta en GitHub Pages
- Asegúrate de que todos los archivos se subieron correctamente

### Los archivos CSS/JS no cargan
- Verifica que las rutas en `index.html` sean relativas (./css/..., ./js/...)
- Limpia la caché del navegador (Ctrl + Shift + R o Cmd + Shift + R)

### La aplicación no funciona offline
- La primera vez debes cargarla con internet
- Después de la primera carga, funcionará offline automáticamente

## 📱 Uso en dispositivos móviles

1. Abre la URL en tu navegador móvil
2. En Android Chrome: "Agregar a pantalla de inicio"
3. En iOS Safari: "Compartir" > "Agregar a inicio"

## 🔄 Actualizar la aplicación

Para subir cambios:
1. Modifica los archivos localmente
2. Súbelos a GitHub usando el mismo método que usaste inicialmente
3. GitHub Pages se actualizará automáticamente en 1-2 minutos

## 💡 Consejos

- **Cambia las credenciales** desde Ajustes después del primer login
- **Crea backups** regularmente de tus datos
- **Usa el mismo navegador** en cada dispositivo para mantener tus datos
- **No borres los datos del navegador** o perderás la información

## 📧 Compartir con otros usuarios

Para que otros usuarios accedan:
1. Compárteles la URL de tu GitHub Pages
2. Cada usuario tendrá su propia base de datos local
3. Los datos NO se sincronizan entre usuarios (es una app local)

---

¡Listo! Tu aplicación de gestión de clientes está publicada y accesible desde cualquier lugar 🎉
