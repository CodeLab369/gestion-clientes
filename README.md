# Gestión de Clientes

Aplicación web completa para la gestión de clientes con almacenamiento local y funcionalidad offline.

## 🚀 Características

### ✅ Sistema de Autenticación
- Inicio de sesión con credenciales personalizadas
- Credenciales iniciales: Usuario: `Nestor`, Contraseña: `1005`
- Cambio de credenciales desde la sección de Ajustes

### 👥 Gestión de Clientes
- **CRUD completo**: Crear, leer, actualizar y eliminar clientes
- **Campos personalizables**: NIT/CUR/CI, Correo, Contraseña, Razón Social, etc.
- **Búsqueda y filtros avanzados**: Por texto, último dígito del NIT, tipo de entidad, administración, facturación y consolidación
- **Paginación**: Ver 5, 10 o 50 clientes por página
- **Notas**: Agregar, editar y eliminar notas por cliente
- **Archivos PDF**: Subir archivos organizados por año y mes con visor integrado
- **Copiar información**: Copiar rápidamente NIT, correo y contraseña

### 🔗 Unir PDFs
- Seleccionar cliente y sus archivos PDF
- Combinar múltiples PDFs en uno solo
- Asignar nombre personalizado al archivo combinado
- Visualizar y descargar PDFs combinados

### 📦 Comprimir Archivos
- **Un cliente**: Comprimir archivos de un cliente específico
- **Varios clientes**: Seleccionar múltiples clientes
- **Todos los clientes**: Comprimir archivos de todos a la vez
- Filtrar por año y período mensual
- Formato ZIP con estructura de carpetas por cliente

### ⚙️ Ajustes
- Cambiar credenciales de acceso
- Gestionar opciones de listas desplegables
- Crear backup completo de datos
- Restaurar desde backup

## 💻 Tecnologías Utilizadas

- **HTML5, CSS3, JavaScript (Vanilla)**
- **IndexedDB**: Almacenamiento local persistente
- **pdf-lib**: Manipulación de archivos PDF
- **JSZip**: Creación de archivos ZIP
- **Service Worker**: Soporte offline completo

## 📱 Responsive Design

La aplicación es completamente responsive y funciona en:
- 💻 Computadoras de escritorio
- 💻 Laptops
- 📱 Tablets
- 📱 Smartphones

## 🚀 Instalación y Uso

### Uso Local

1. Descarga todos los archivos del proyecto
2. Abre `index.html` en tu navegador web moderno (Chrome, Firefox, Edge)
3. Inicia sesión con las credenciales por defecto
4. ¡Empieza a gestionar tus clientes!

### Despliegue en GitHub Pages

1. Sube todos los archivos a un repositorio de GitHub
2. Ve a Settings > Pages
3. Selecciona "Deploy from a branch"
4. Selecciona la rama `main` (o `master`) y la carpeta `/ (root)`
5. Guarda y espera unos minutos
6. Tu aplicación estará disponible en `https://tu-usuario.github.io/tu-repositorio`

## 📂 Estructura del Proyecto

```
consultora/
├── index.html              # Página principal
├── sw.js                   # Service Worker para soporte offline
├── .nojekyll              # Configuración para GitHub Pages
├── README.md              # Este archivo
├── css/
│   ├── styles.css         # Estilos principales
│   ├── modal.css          # Estilos de modales
│   └── responsive.css     # Estilos responsive
└── js/
    ├── database.js        # Gestión de IndexedDB
    ├── auth.js            # Sistema de autenticación
    ├── modal.js           # Sistema de modales
    ├── clientes.js        # Gestión de clientes
    ├── unir.js            # Unir PDFs
    ├── comprimir.js       # Comprimir archivos
    ├── ajustes.js         # Configuración
    └── app.js             # Aplicación principal
```

## 🔐 Credenciales por Defecto

- **Usuario**: Nestor
- **Contraseña**: 1005

⚠️ Cambia estas credenciales desde la sección de Ajustes después del primer inicio de sesión.

## 💾 Almacenamiento de Datos

Todos los datos se almacenan localmente en tu navegador usando IndexedDB:
- No se envía información a ningún servidor
- Los datos persisten incluso después de cerrar el navegador
- Funcionamiento 100% offline
- Crea backups regularmente desde la sección de Ajustes

## 🎯 Características Técnicas

- **Tiempo real**: Todos los cambios se reflejan instantáneamente
- **Sin recargas**: Experiencia de aplicación SPA
- **Modales personalizados**: No usa alertas del navegador
- **Optimizado**: Rendimiento rápido y eficiente
- **Offline First**: Funciona completamente sin conexión

## 🆘 Soporte

Si encuentras algún problema:
1. Verifica que estés usando un navegador moderno
2. Limpia la caché del navegador
3. Verifica que JavaScript esté habilitado
4. Comprueba la consola del navegador para errores

## 📝 Notas Importantes

- Crea backups regularmente de tus datos
- Los datos se almacenan en el navegador específico del dispositivo
- Usa el mismo navegador para acceder a tus datos
- No elimines los datos del navegador o perderás la información

## 🔄 Actualizaciones

**Versión 1.0** - Lanzamiento inicial
- Sistema completo de gestión de clientes
- Funcionalidad offline
- Soporte para dispositivos móviles

---

Desarrollado para gestión eficiente de clientes ⚡
