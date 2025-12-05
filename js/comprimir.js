// Gestor de Compresión de Archivos
class ComprimirManager {
    constructor() {
        this.compressMode = null;
        this.months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('compressOneBtn')?.addEventListener('click', () => {
            this.showCompressForm('one');
        });

        document.getElementById('compressMultipleBtn')?.addEventListener('click', () => {
            this.showCompressForm('multiple');
        });

        document.getElementById('compressAllBtn')?.addEventListener('click', () => {
            this.showCompressForm('all');
        });
    }

    async showCompressForm(mode) {
        this.compressMode = mode;
        const container = document.getElementById('compressFormContainer');

        let formHTML = '';

        if (mode === 'one') {
            formHTML = await this.getOneClientForm();
        } else if (mode === 'multiple') {
            formHTML = await this.getMultipleClientsForm();
        } else if (mode === 'all') {
            formHTML = await this.getAllClientsForm();
        }

        container.innerHTML = formHTML;
        container.style.display = 'block';

        this.setupFormListeners(mode);
    }

    async getOneClientForm() {
        return `
            <h3>Comprimir archivos de un cliente</h3>
            <div class="form-group">
                <label>Buscar Cliente:</label>
                <input type="text" id="searchClientCompress" placeholder="Buscar por NIT o Razón Social...">
                <div id="clientSuggestionsCompress" class="suggestions-list"></div>
                <input type="hidden" id="selectedClientId">
            </div>
            <div class="form-group">
                <label>Año:</label>
                <select id="compressYear">
                    ${this.getYearOptions()}
                </select>
            </div>
            <div class="form-group">
                <label>Período:</label>
                <select id="compressPeriod">
                    ${this.months.map((month, index) => 
                        `<option value="${index + 1}">${month}</option>`
                    ).join('')}
                </select>
            </div>
            <button class="btn btn-primary" id="compressExecuteBtn">Comprimir</button>
        `;
    }

    async getMultipleClientsForm() {
        const clients = await db.getAll('clientes');
        
        return `
            <h3>Comprimir archivos de varios clientes</h3>
            <div class="form-group">
                <label>Año:</label>
                <select id="compressYear">
                    ${this.getYearOptions()}
                </select>
            </div>
            <div class="form-group">
                <label>Período:</label>
                <select id="compressPeriod">
                    ${this.months.map((month, index) => 
                        `<option value="${index + 1}">${month}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Seleccionar Clientes:</label>
                <div class="clients-selection-list">
                    ${clients.map(client => `
                        <div class="client-checkbox-item">
                            <input type="checkbox" id="client-${client.id}" value="${client.id}" class="client-checkbox">
                            <label for="client-${client.id}" class="client-checkbox-label">
                                ${client.razonSocial} - ${client.nit}
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
            <button class="btn btn-primary" id="compressExecuteBtn">Comprimir Seleccionados</button>
        `;
    }

    async getAllClientsForm() {
        return `
            <h3>Comprimir archivos de todos los clientes</h3>
            <div class="form-group">
                <label>Año:</label>
                <select id="compressYear">
                    ${this.getYearOptions()}
                </select>
            </div>
            <div class="form-group">
                <label>Período:</label>
                <select id="compressPeriod">
                    ${this.months.map((month, index) => 
                        `<option value="${index + 1}">${month}</option>`
                    ).join('')}
                </select>
            </div>
            <div style="background: var(--light-bg); padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p>⚠️ Esta opción comprimirá los archivos de <strong>todos los clientes</strong> para el año y período seleccionado.</p>
            </div>
            <button class="btn btn-primary" id="compressExecuteBtn">Comprimir Todos</button>
        `;
    }

    getYearOptions() {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= currentYear - 10; i--) {
            years.push(`<option value="${i}">${i}</option>`);
        }
        return years.join('');
    }

    setupFormListeners(mode) {
        const executeBtn = document.getElementById('compressExecuteBtn');
        
        if (mode === 'one') {
            const searchInput = document.getElementById('searchClientCompress');
            searchInput?.addEventListener('input', (e) => {
                this.searchClientsForCompress(e.target.value);
            });
        }

        executeBtn?.addEventListener('click', () => {
            this.executeCompress();
        });
    }

    async searchClientsForCompress(query) {
        const suggestionsDiv = document.getElementById('clientSuggestionsCompress');
        
        if (!query.trim()) {
            suggestionsDiv.innerHTML = '';
            suggestionsDiv.style.display = 'none';
            return;
        }

        const clients = await db.getAll('clientes');
        const filteredClients = clients.filter(client => 
            (client.nit && client.nit.toLowerCase().includes(query.toLowerCase())) ||
            (client.razonSocial && client.razonSocial.toLowerCase().includes(query.toLowerCase()))
        );

        if (filteredClients.length === 0) {
            suggestionsDiv.innerHTML = '<div class="suggestion-item">No se encontraron clientes</div>';
            suggestionsDiv.style.display = 'block';
        } else {
            suggestionsDiv.innerHTML = filteredClients.map(client => `
                <div class="suggestion-item" data-client-id="${client.id}">
                    ${client.razonSocial} - ${client.nit}
                </div>
            `).join('');
            suggestionsDiv.style.display = 'block';

            suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    const clientId = parseInt(item.dataset.clientId);
                    const clientText = item.textContent;
                    document.getElementById('searchClientCompress').value = clientText;
                    document.getElementById('selectedClientId').value = clientId;
                    suggestionsDiv.style.display = 'none';
                });
            });
        }
    }

    async executeCompress() {
        const year = parseInt(document.getElementById('compressYear').value);
        const period = parseInt(document.getElementById('compressPeriod').value);
        const periodName = this.months[period - 1];

        let clientsToCompress = [];

        if (this.compressMode === 'one') {
            const clientId = parseInt(document.getElementById('selectedClientId').value);
            if (!clientId) {
                showAlert('Por favor seleccione un cliente', 'error');
                return;
            }
            const client = await db.get('clientes', clientId);
            if (client) {
                clientsToCompress.push(client);
            }
        } else if (this.compressMode === 'multiple') {
            const checkboxes = document.querySelectorAll('.client-checkbox:checked');
            if (checkboxes.length === 0) {
                showAlert('Por favor seleccione al menos un cliente', 'error');
                return;
            }
            for (const checkbox of checkboxes) {
                const clientId = parseInt(checkbox.value);
                const client = await db.get('clientes', clientId);
                if (client) {
                    clientsToCompress.push(client);
                }
            }
        } else if (this.compressMode === 'all') {
            clientsToCompress = await db.getAll('clientes');
            if (clientsToCompress.length === 0) {
                showAlert('No hay clientes para comprimir', 'error');
                return;
            }
        }

        const loadingModal = showLoading('Comprimiendo archivos...');

        try {
            const zip = new JSZip();
            let filesAdded = 0;

            // Procesar cada cliente
            for (const client of clientsToCompress) {
                const archivos = await db.getByIndex('archivos', 'clienteId', client.id);
                const filteredFiles = archivos.filter(a => a.year === year && a.month === period);

                if (filteredFiles.length > 0) {
                    // Crear carpeta para el cliente
                    const clientFolder = zip.folder(client.razonSocial);

                    // Agregar archivos del cliente
                    for (const archivo of filteredFiles) {
                        const blob = await base64ToBlob(archivo.data);
                        clientFolder.file(archivo.name, blob);
                        filesAdded++;
                    }
                }
            }

            if (filesAdded === 0) {
                hideLoading();
                showAlert('No se encontraron archivos para el período seleccionado', 'error');
                return;
            }

            // Generar el archivo ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob' });

            // Crear nombre del archivo
            const fileName = `Clientes_Nestor_${periodName}_${year}.zip`;

            // Descargar el archivo
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);

            hideLoading();
            showAlert(`Archivo ZIP creado exitosamente con ${filesAdded} archivo(s)`, 'success');

        } catch (error) {
            hideLoading();
            console.error('Error al comprimir archivos:', error);
            showAlert('Error al crear el archivo ZIP', 'error');
        }
    }
}

// Instancia global
const comprimirManager = new ComprimirManager();
