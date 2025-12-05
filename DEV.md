# 🛠️ Guía para Desarrolladores

## 📁 Estructura del Proyecto

```
consultora/
├── index.html              # Punto de entrada de la aplicación
├── sw.js                   # Service Worker para funcionamiento offline
├── .nojekyll              # Configuración para GitHub Pages
├── package.json           # Metadatos del proyecto
├── README.md              # Documentación principal
├── DEPLOY.md              # Instrucciones de despliegue
├── TESTING.md             # Plan de pruebas
├── DEV.md                 # Esta guía
├── datos-ejemplo.js       # Datos de ejemplo para pruebas
├── css/
│   ├── styles.css         # Estilos principales y variables
│   ├── modal.css          # Estilos de los modales personalizados
│   └── responsive.css     # Media queries y diseño adaptativo
└── js/
    ├── database.js        # Capa de abstracción de IndexedDB
    ├── auth.js            # Sistema de autenticación y sesiones
    ├── modal.js           # Sistema de modales y utilidades
    ├── clientes.js        # Lógica de gestión de clientes
    ├── unir.js            # Funcionalidad de unir PDFs
    ├── comprimir.js       # Funcionalidad de comprimir archivos
    ├── ajustes.js         # Gestión de configuración
    └── app.js             # Inicialización y coordinación
```

## 🔧 Tecnologías y Dependencias

### Librerías Externas (CDN)
- **pdf-lib v1.17.1**: Manipulación de archivos PDF
  - URL: `https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js`
  - Uso: Combinación de múltiples PDFs en uno solo

- **JSZip v3.10.1**: Creación de archivos ZIP
  - URL: `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js`
  - Uso: Compresión de archivos PDF por cliente/período

### APIs del Navegador
- **IndexedDB**: Base de datos NoSQL del navegador
- **Service Worker**: Cache y funcionamiento offline
- **File API**: Lectura y escritura de archivos
- **Clipboard API**: Copiar texto al portapapeles

## 🏗️ Arquitectura

### Patrón de Diseño
La aplicación sigue un patrón **Manager/Controller** donde cada sección tiene su propio gestor:

```javascript
ClientesManager    // Gestión de clientes
UnirManager        // Combinación de PDFs
ComprimirManager   // Compresión de archivos
AjustesManager     // Configuración
ModalManager       // Modales personalizados
Database           // Abstracción de IndexedDB
Auth               // Autenticación
```

### Flujo de Datos

```
Usuario → Evento → Manager → Database → IndexedDB
                                     ↓
                              Actualización UI
```

## 📊 Esquema de Base de Datos (IndexedDB)

### Stores (Tablas)

#### 1. clientes
```javascript
{
  id: number (autoIncrement),
  nit: string,
  correo: string,
  password: string,
  razonSocial: string,
  tipoContribuyente: string,
  tipoEntidad: string,
  contacto: string,
  administracion: string,
  facturacion: string,
  regimen: string,
  actividad: string,
  consolidacion: string,
  encargado: string,
  direccion: string
}
```

#### 2. notas
```javascript
{
  id: number (autoIncrement),
  clienteId: number (index),
  content: string,
  timestamp: number
}
```

#### 3. archivos
```javascript
{
  id: number (autoIncrement),
  clienteId: number (index),
  name: string,
  data: string (base64),
  year: number (index),
  month: number (index),
  timestamp: number
}
```

#### 4. pdfsMerged
```javascript
{
  id: number (autoIncrement),
  name: string,
  data: string (base64),
  clienteId: number,
  clienteName: string,
  timestamp: number
}
```

#### 5. config
```javascript
{
  key: string (keyPath),
  value: any
}
```

## 🔨 Desarrollo Local

### Opción 1: Abrir directamente
```bash
# Simplemente abre index.html en tu navegador
# Funciona pero Service Worker puede tener problemas
```

### Opción 2: Servidor local con Python
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Luego abre: http://localhost:8000
```

### Opción 3: Servidor local con Node.js
```bash
# Instalar http-server globalmente
npm install -g http-server

# Ejecutar
http-server -p 8000

# Luego abre: http://localhost:8000
```

### Opción 4: Live Server (VS Code)
1. Instalar extensión "Live Server"
2. Click derecho en index.html
3. "Open with Live Server"

## 🐛 Debugging

### Consola del Navegador

```javascript
// Ver todos los clientes
await window.debugApp.listClients()

// Ver todos los archivos
await window.debugApp.listFiles()

// Ver configuración
await window.debugApp.getConfig()

// Limpiar toda la base de datos (¡CUIDADO!)
await window.debugApp.clearAll()
```

### DevTools

1. **Application Tab**
   - IndexedDB: Ver datos almacenados
   - Service Worker: Estado del SW
   - Cache Storage: Archivos cacheados

2. **Console Tab**
   - Ver logs y errores
   - Ejecutar comandos de debug

3. **Network Tab**
   - Verificar carga de recursos
   - Ver errores de red

4. **Sources Tab**
   - Depurar JavaScript
   - Establecer breakpoints

## 🎨 Personalización

### Colores
Editar en `css/styles.css`:
```css
:root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --success-color: #27ae60;
    --danger-color: #e74c3c;
    --warning-color: #f39c12;
    /* ... más colores */
}
```

### Agregar nueva sección
1. Agregar HTML en `index.html`:
```html
<section id="nuevaSection" class="section">
    <!-- Contenido -->
</section>
```

2. Agregar botón de navegación:
```html
<button class="nav-btn" data-section="nueva">Nueva</button>
```

3. Crear manager en `js/nueva.js`:
```javascript
class NuevaManager {
    constructor() {}
    async init() {}
}
const nuevaManager = new NuevaManager();
```

4. Inicializar en `app.js`:
```javascript
await nuevaManager.init();
```

## 📝 Convenciones de Código

### Nombres
- Clases: `PascalCase` (ClientesManager)
- Variables: `camelCase` (currentPage)
- Constantes: `UPPER_SNAKE_CASE` (CACHE_NAME)
- Archivos: `kebab-case` (datos-ejemplo.js)

### Comentarios
```javascript
// Comentario de línea para explicaciones breves

/**
 * Comentario de bloque para funciones importantes
 * @param {string} param - Descripción del parámetro
 * @returns {Promise<void>}
 */
```

### Async/Await
Preferir async/await sobre Promises:
```javascript
// ✅ Bueno
async function loadData() {
    const data = await db.getAll('clientes');
    return data;
}

// ❌ Evitar
function loadData() {
    return db.getAll('clientes').then(data => data);
}
```

## 🚀 Optimización

### Rendimiento
- Las operaciones de IndexedDB son asíncronas
- Los archivos PDF se almacenan en base64
- La paginación evita renderizar grandes cantidades de datos
- Los filtros se aplican en memoria (rápido)

### Tamaño de Almacenamiento
- IndexedDB: ~50MB - 1GB (depende del navegador)
- PDFs en base64: ~33% más grandes que el original
- Recomendar backups cuando hay muchos archivos

## 🔐 Seguridad

### Consideraciones
- ⚠️ Las credenciales se almacenan en IndexedDB (no encriptadas)
- ⚠️ No hay protección contra XSS (la app es local)
- ⚠️ Los datos son visibles en DevTools
- ✅ Los datos NO se envían a ningún servidor
- ✅ Funcionamiento 100% local

### Mejoras futuras
- Encriptar datos sensibles
- Agregar hash a las contraseñas
- Implementar timeout de sesión configurable

## 📦 Build y Deploy

### GitHub Pages
El proyecto está optimizado para GitHub Pages:
- Sin build process necesario
- Archivos estáticos listos para servir
- `.nojekyll` evita procesamiento de Jekyll
- Rutas relativas para compatibilidad

### Deploy manual
1. Subir archivos a servidor web
2. Asegurar que el servidor sirve archivos estáticos
3. Habilitar HTTPS para Service Worker
4. Configurar MIME types correctos

## 🧪 Testing

### Testing manual
Ver `TESTING.md` para plan completo de pruebas

### Testing automatizado
Actualmente no implementado. Posibles frameworks:
- Jest para testing unitario
- Cypress para testing E2E
- Playwright para testing cross-browser

## 📚 Recursos Adicionales

### Documentación
- [IndexedDB API](https://developer.mozilla.org/es/docs/Web/API/IndexedDB_API)
- [Service Worker API](https://developer.mozilla.org/es/docs/Web/API/Service_Worker_API)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [JSZip Documentation](https://stuk.github.io/jszip/)

### Herramientas
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [VS Code](https://code.visualstudio.com/)
- [GitHub Desktop](https://desktop.github.com/)

## 💡 Mejoras Futuras

- [ ] Sincronización con la nube (Firebase, Supabase)
- [ ] Exportar clientes a Excel/CSV
- [ ] Importar clientes desde Excel/CSV
- [ ] Modo oscuro
- [ ] Multi-idioma
- [ ] Notificaciones push
- [ ] PWA con instalación
- [ ] Estadísticas y gráficos
- [ ] Búsqueda avanzada con filtros combinados
- [ ] Campos personalizables por usuario

---

**Desarrollado con ❤️ para gestión eficiente de clientes**
