// Sistema de Base de Datos con IndexedDB
class Database {
    constructor() {
        this.dbName = 'GestionClientesDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store para clientes
                if (!db.objectStoreNames.contains('clientes')) {
                    const clientesStore = db.createObjectStore('clientes', { keyPath: 'id', autoIncrement: true });
                    clientesStore.createIndex('nit', 'nit', { unique: false });
                    clientesStore.createIndex('razonSocial', 'razonSocial', { unique: false });
                    // marks se almacena como array en el objeto cliente
                }

                // Store para notas
                if (!db.objectStoreNames.contains('notas')) {
                    const notasStore = db.createObjectStore('notas', { keyPath: 'id', autoIncrement: true });
                    notasStore.createIndex('clienteId', 'clienteId', { unique: false });
                }

                // Store para archivos PDF
                if (!db.objectStoreNames.contains('archivos')) {
                    const archivosStore = db.createObjectStore('archivos', { keyPath: 'id', autoIncrement: true });
                    archivosStore.createIndex('clienteId', 'clienteId', { unique: false });
                    archivosStore.createIndex('year', 'year', { unique: false });
                    archivosStore.createIndex('month', 'month', { unique: false });
                }

                // Store para PDFs unidos
                if (!db.objectStoreNames.contains('pdfsMerged')) {
                    db.createObjectStore('pdfsMerged', { keyPath: 'id', autoIncrement: true });
                }

                // Store para configuración
                if (!db.objectStoreNames.contains('config')) {
                    const configStore = db.createObjectStore('config', { keyPath: 'key' });
                    
                    // Configuración inicial
                    const defaultConfig = [
                        { key: 'credentials', value: { username: 'Nestor', password: '1005' } },
                        { key: 'tipoContribuyente', value: ['IVA', 'RC-IVA', 'IRACIS', 'IRE', 'INGRESOS BRUTOS'] },
                        { key: 'tipoEntidad', value: ['PERSONAS FISICAS', 'PERSONAS JURIDICAS'] },
                        { key: 'administracion', value: ['GRANDE', 'MEDIANA', 'PEQUEÑA'] },
                        { key: 'facturacion', value: ['ELECTRONICA', 'MANUAL'] },
                        { key: 'regimen', value: ['GENERAL', 'SIMPLIFICADO'] },
                        { key: 'consolidacion', value: ['ANUAL', 'MENSUAL', 'TRIMESTRAL'] },
                        { key: 'encargado', value: ['NESTOR', 'MARIA', 'JUAN', 'PEDRO'] }
                    ];

                    event.target.transaction.objectStore('config');
                    defaultConfig.forEach(config => {
                        configStore.add(config);
                    });
                }
            };
        });
    }

    // Métodos CRUD genéricos
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getConfig(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['config'], 'readonly');
            const store = transaction.objectStore('config');
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async setConfig(key, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['config'], 'readwrite');
            const store = transaction.objectStore('config');
            const request = store.put({ key, value });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Exportar todos los datos
    async exportData() {
        const data = {
            clientes: await this.getAll('clientes'),
            notas: await this.getAll('notas'),
            archivos: await this.getAll('archivos'),
            pdfsMerged: await this.getAll('pdfsMerged'),
            config: await this.getAll('config')
        };
        return data;
    }

    // Importar datos
    async importData(data) {
        // Limpiar stores
        await this.clearAllStores();

        // Importar cada store
        for (const [storeName, items] of Object.entries(data)) {
            for (const item of items) {
                await this.add(storeName, item);
            }
        }
    }

    async clearAllStores() {
        const storeNames = ['clientes', 'notas', 'archivos', 'pdfsMerged'];
        for (const storeName of storeNames) {
            await this.clearStore(storeName);
        }
    }

    async clearStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// Instancia global de la base de datos
const db = new Database();
