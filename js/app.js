// Aplicación Principal
class App {
    constructor() {
        this.currentSection = 'clientes';
    }

    async init() {
        try {
            // Inicializar base de datos
            await db.init();

            // Inicializar autenticación
            await auth.init();

            // Si está autenticado, inicializar managers
            if (auth.isAuthenticated) {
                await this.initializeManagers();
            }

            // Configurar navegación
            this.setupNavigation();

        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            showAlert('Error al inicializar la aplicación', 'error');
        }
    }

    async initializeManagers() {
        try {
            await clientesManager.init();
            await unirManager.init();
            comprimirManager.init();
            await ajustesManager.init();
            console.log('Todos los managers inicializados correctamente');
        } catch (error) {
            console.error('Error al inicializar managers:', error);
            showAlert('Error al inicializar la aplicación. Por favor recarga la página.', 'error');
        }
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                this.navigateToSection(section);
            });
        });
    }

    navigateToSection(sectionName) {
        // Actualizar botones de navegación
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === sectionName) {
                btn.classList.add('active');
            }
        });

        // Mostrar sección correspondiente
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(`${sectionName}Section`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
        }
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.init();
});

// Hacer disponibles las instancias globalmente para debugging
window.app = null;
window.db = db;
window.auth = auth;
window.clientesManager = clientesManager;
window.unirManager = unirManager;
window.comprimirManager = comprimirManager;
window.ajustesManager = ajustesManager;

// Service Worker para soporte offline (opcional pero recomendado)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registrado correctamente');
                
                // Verificar actualizaciones cada 10 segundos
                setInterval(() => {
                    registration.update();
                }, 10000);
                
                // Detectar cuando hay una nueva versión
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'activated') {
                            // Recargar la página para usar la nueva versión
                            if (confirm('Hay una nueva versión disponible. ¿Desea actualizar?')) {
                                window.location.reload();
                            }
                        }
                    });
                });
            })
            .catch(error => {
                console.log('Error al registrar Service Worker:', error);
            });
    });
    
    // Recargar cuando el Service Worker toma control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });
}

// Prevenir pérdida de datos al cerrar
window.addEventListener('beforeunload', (e) => {
    // Solo mostrar advertencia si hay datos pendientes
    // Por ahora comentado para no molestar
    // e.preventDefault();
    // e.returnValue = '';
});

// Utilidad para debugging
window.debugApp = {
    async listClients() {
        const clients = await db.getAll('clientes');
        console.table(clients);
        return clients;
    },
    
    async listFiles() {
        const files = await db.getAll('archivos');
        console.table(files);
        return files;
    },
    
    async clearAll() {
        if (confirm('¿Está seguro de eliminar TODOS los datos?')) {
            await db.clearAllStores();
            console.log('Todos los datos han sido eliminados');
            window.location.reload();
        }
    },
    
    async getConfig() {
        const config = await db.getAll('config');
        console.table(config);
        return config;
    }
};

console.log('%c Gestión de Clientes v1.0 ', 'background: #2c3e50; color: #fff; padding: 5px 10px; border-radius: 3px;');
console.log('Usa window.debugApp para acceder a utilidades de debugging');
