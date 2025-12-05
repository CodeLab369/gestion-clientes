// Gestor de Clientes
class ClientesManager {
    constructor() {
        this.clients = [];
        this.filteredClients = [];
        this.currentPage = 1;
        this.clientsPerPage = 5;
        this.filters = {
            search: '',
            digit: 'all',
            tipoEntidad: '',
            administracion: '',
            facturacion: '',
            consolidacion: '',
            encargado: ''
        };
    }

    async init() {
        try {
            await this.loadOptions();
            this.setupEventListeners();
            await this.loadClients();
        } catch (error) {
            console.error('Error al inicializar ClientesManager:', error);
        }
    }

    async loadOptions() {
        try {
            // Cargar opciones para los filtros y formularios
            const tipoContribuyente = await db.getConfig('tipoContribuyente') || [];
            const tipoEntidad = await db.getConfig('tipoEntidad') || [];
            const administracion = await db.getConfig('administracion') || [];
            const facturacion = await db.getConfig('facturacion') || [];
            const regimen = await db.getConfig('regimen') || [];
            const consolidacion = await db.getConfig('consolidacion') || [];
            const encargado = await db.getConfig('encargado') || [];

            // Poblar filtros
            this.populateSelect('filterTipoEntidad', tipoEntidad);
            this.populateSelect('filterAdministracion', administracion);
            this.populateSelect('filterFacturacion', facturacion);
            this.populateSelect('filterConsolidacion', consolidacion);
            this.populateSelect('filterEncargado', encargado);

            // Guardar opciones para uso posterior
            this.options = {
                tipoContribuyente,
                tipoEntidad,
                administracion,
                facturacion,
                regimen,
                consolidacion,
                encargado
            };
        } catch (error) {
            console.error('Error al cargar opciones:', error);
            // Inicializar opciones vacías para evitar errores
            this.options = {
                tipoContribuyente: [],
                tipoEntidad: [],
                administracion: [],
                facturacion: [],
                regimen: [],
                consolidacion: [],
                encargado: []
            };
        }
    }

    populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) return;

        // Mantener la opción "Todos"
        const currentValue = select.value;
        select.innerHTML = '<option value="">Todos</option>';
        
        options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option;
            optionEl.textContent = option;
            select.appendChild(optionEl);
        });

        select.value = currentValue;
    }

    setupEventListeners() {
        // Botón agregar cliente
        document.getElementById('addClientBtn')?.addEventListener('click', () => {
            this.showClientModal();
        });

        // Buscador
        document.getElementById('searchClients')?.addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });

        // Filtro de dígito
        document.getElementById('filterDigit')?.addEventListener('change', (e) => {
            this.filters.digit = e.target.value;
            this.applyFilters();
        });

        // Filtros de select
        ['filterTipoEntidad', 'filterAdministracion', 'filterFacturacion', 'filterConsolidacion', 'filterEncargado'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                const filterName = id.replace('filter', '').toLowerCase();
                this.filters[filterName] = e.target.value;
                this.applyFilters();
            });
        });

        // Clientes por página
        document.getElementById('clientsPerPage')?.addEventListener('change', (e) => {
            this.clientsPerPage = parseInt(e.target.value);
            this.currentPage = 1;
            this.renderClients();
        });
    }

    async loadClients() {
        try {
            this.clients = await db.getAll('clientes');
            this.applyFilters();
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            showAlert('Error al cargar clientes', 'error');
        }
    }

    applyFilters() {
        this.filteredClients = this.clients.filter(client => {
            // Filtro de búsqueda
            if (this.filters.search) {
                const searchText = this.filters.search;
                const matchesSearch = 
                    (client.nit && client.nit.toLowerCase().includes(searchText)) ||
                    (client.razonSocial && client.razonSocial.toLowerCase().includes(searchText)) ||
                    (client.correo && client.correo.toLowerCase().includes(searchText));
                if (!matchesSearch) return false;
            }

            // Filtro de dígito
            if (this.filters.digit !== 'all' && client.nit) {
                const lastDigit = client.nit.slice(-1);
                if (lastDigit !== this.filters.digit) return false;
            }

            // Filtros de campos específicos
            if (this.filters.tipoentidad && client.tipoEntidad !== this.filters.tipoentidad) return false;
            if (this.filters.administracion && client.administracion !== this.filters.administracion) return false;
            if (this.filters.facturacion && client.facturacion !== this.filters.facturacion) return false;
            if (this.filters.consolidacion && client.consolidacion !== this.filters.consolidacion) return false;
            if (this.filters.encargado && client.encargado !== this.filters.encargado) return false;

            return true;
        });

        this.currentPage = 1;
        this.renderClients();
    }

    renderClients() {
        const tbody = document.getElementById('clientsTableBody');
        if (!tbody) return;

        const start = (this.currentPage - 1) * this.clientsPerPage;
        const end = start + this.clientsPerPage;
        const clientsToShow = this.filteredClients.slice(start, end);

        if (clientsToShow.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay clientes para mostrar</td></tr>';
        } else {
            tbody.innerHTML = clientsToShow.map(client => `
                <tr>
                    <td>${client.nit || '-'}</td>
                    <td>${client.razonSocial || '-'}</td>
                    <td>${this.getClientMarks(client)}</td>
                    <td>
                        <div class="actions">
                            <button class="action-btn view" onclick="clientesManager.viewClient(${client.id})" title="Ver">👁</button>
                            <button class="action-btn notes" onclick="clientesManager.showNotes(${client.id})" title="Notas">📝</button>
                            <button class="action-btn files" onclick="clientesManager.showFiles(${client.id})" title="Archivos">📄</button>
                            <button class="action-btn marks" onclick="clientesManager.showMarks(${client.id})" title="Marcas">🏷️</button>
                            <button class="action-btn edit" onclick="clientesManager.editClient(${client.id})" title="Editar">✏️</button>
                            <button class="action-btn delete" onclick="clientesManager.deleteClient(${client.id})" title="Eliminar">🗑</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        this.renderPagination();
    }

    getClientMarks(client) {
        const marks = [];
        if (client.marks && client.marks.length > 0) {
            return client.marks.join(' | ');
        }
        return '-';
    }

    renderPagination() {
        const pagination = document.getElementById('clientsPagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredClients.length / this.clientsPerPage);

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = `
            <button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                onclick="clientesManager.goToPage(${this.currentPage - 1})">‹</button>
        `;

        // Mostrar páginas
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                html += `
                    <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="clientesManager.goToPage(${i})">${i}</button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                html += '<span>...</span>';
            }
        }

        html += `
            <button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                onclick="clientesManager.goToPage(${this.currentPage + 1})">›</button>
        `;

        pagination.innerHTML = html;
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredClients.length / this.clientsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderClients();
        }
    }

    showClientModal(client = null) {
        const isEdit = client !== null;
        const title = isEdit ? 'Editar Cliente' : 'Agregar Cliente';

        // Asegurar que options existe
        if (!this.options) {
            showAlert('Error: Las opciones no están cargadas. Recarga la página.', 'error');
            return;
        }

        const content = `
            <form id="clientForm" class="client-form">
                <div class="form-group">
                    <label>NIT/CUR/CI *</label>
                    <input type="text" name="nit" value="${client?.nit || ''}" required>
                </div>
                <div class="form-group">
                    <label>Correo Electrónico *</label>
                    <input type="email" name="correo" value="${client?.correo || ''}" required>
                </div>
                <div class="form-group">
                    <label>Contraseña *</label>
                    <input type="text" name="password" value="${client?.password || ''}" required>
                </div>
                <div class="form-group">
                    <label>Razón Social *</label>
                    <input type="text" name="razonSocial" value="${client?.razonSocial || ''}" required>
                </div>
                <div class="form-group">
                    <label>Tipo de Contribuyente</label>
                    <select name="tipoContribuyente">
                        <option value="">Seleccionar...</option>
                        ${this.options.tipoContribuyente.map(opt => 
                            `<option value="${opt}" ${client?.tipoContribuyente === opt ? 'selected' : ''}>${opt}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Tipo de Entidad</label>
                    <select name="tipoEntidad">
                        <option value="">Seleccionar...</option>
                        ${this.options.tipoEntidad.map(opt => 
                            `<option value="${opt}" ${client?.tipoEntidad === opt ? 'selected' : ''}>${opt}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Contacto</label>
                    <input type="text" name="contacto" value="${client?.contacto || ''}">
                </div>
                <div class="form-group">
                    <label>Administración</label>
                    <select name="administracion">
                        <option value="">Seleccionar...</option>
                        ${this.options.administracion.map(opt => 
                            `<option value="${opt}" ${client?.administracion === opt ? 'selected' : ''}>${opt}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Facturación</label>
                    <select name="facturacion">
                        <option value="">Seleccionar...</option>
                        ${this.options.facturacion.map(opt => 
                            `<option value="${opt}" ${client?.facturacion === opt ? 'selected' : ''}>${opt}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Régimen</label>
                    <select name="regimen">
                        <option value="">Seleccionar...</option>
                        ${this.options.regimen.map(opt => 
                            `<option value="${opt}" ${client?.regimen === opt ? 'selected' : ''}>${opt}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Actividad</label>
                    <input type="text" name="actividad" value="${client?.actividad || ''}">
                </div>
                <div class="form-group">
                    <label>Consolidación</label>
                    <select name="consolidacion">
                        <option value="">Seleccionar...</option>
                        ${this.options.consolidacion.map(opt => 
                            `<option value="${opt}" ${client?.consolidacion === opt ? 'selected' : ''}>${opt}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Encargado</label>
                    <select name="encargado">
                        <option value="">Seleccionar...</option>
                        ${this.options.encargado.map(opt => 
                            `<option value="${opt}" ${client?.encargado === opt ? 'selected' : ''}>${opt}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group full-width">
                    <label>Dirección</label>
                    <textarea name="direccion">${client?.direccion || ''}</textarea>
                </div>
            </form>
        `;

        const footer = `
            <button class="btn btn-secondary" id="cancelClientBtn">Cancelar</button>
            <button class="btn btn-primary" id="saveClientBtn">${isEdit ? 'Actualizar' : 'Guardar'}</button>
        `;

        const modal = modalManager.create(title, content, footer);

        const form = modal.querySelector('#clientForm');
        const saveBtn = modal.querySelector('#saveClientBtn');
        const cancelBtn = modal.querySelector('#cancelClientBtn');

        saveBtn.addEventListener('click', async () => {
            const formData = new FormData(form);
            const clientData = {};
            
            for (let [key, value] of formData.entries()) {
                clientData[key] = value;
            }

            if (!clientData.nit || !clientData.correo || !clientData.password || !clientData.razonSocial) {
                showAlert('Por favor complete los campos obligatorios', 'error');
                return;
            }

            try {
                if (isEdit) {
                    clientData.id = client.id;
                    await db.update('clientes', clientData);
                    showAlert('Cliente actualizado correctamente', 'success');
                } else {
                    await db.add('clientes', clientData);
                    showAlert('Cliente agregado correctamente', 'success');
                }

                await this.loadClients();
                modalManager.close(modal);
            } catch (error) {
                console.error('Error al guardar cliente:', error);
                showAlert('Error al guardar cliente', 'error');
            }
        });

        cancelBtn.addEventListener('click', () => modalManager.close(modal));
    }

    async viewClient(id) {
        const client = this.clients.find(c => c.id === id);
        if (client) {
            showClientDetails(client);
        }
    }

    async editClient(id) {
        const client = this.clients.find(c => c.id === id);
        if (client) {
            this.showClientModal(client);
        }
    }

    async deleteClient(id) {
        const client = this.clients.find(c => c.id === id);
        if (!client) return;

        showConfirm(
            '¿Está seguro que desea eliminar este cliente?',
            `Se eliminará ${client.razonSocial} y todos sus datos asociados`,
            async () => {
                try {
                    await db.delete('clientes', id);
                    
                    // Eliminar notas asociadas
                    const notas = await db.getByIndex('notas', 'clienteId', id);
                    for (const nota of notas) {
                        await db.delete('notas', nota.id);
                    }
                    
                    // Eliminar archivos asociados
                    const archivos = await db.getByIndex('archivos', 'clienteId', id);
                    for (const archivo of archivos) {
                        await db.delete('archivos', archivo.id);
                    }

                    showAlert('Cliente eliminado correctamente', 'success');
                    await this.loadClients();
                } catch (error) {
                    console.error('Error al eliminar cliente:', error);
                    showAlert('Error al eliminar cliente', 'error');
                }
            }
        );
    }

    async copyClientInfo(id) {
        const client = this.clients.find(c => c.id === id);
        if (!client) return;

        const info = `NIT/CUR/CI: ${client.nit}
Correo: ${client.correo}
Contraseña: ${client.password}`;

        copyToClipboard(info);
    }

    // Continúa en la siguiente parte...
    async showNotes(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (!client) return;

        const notes = await db.getByIndex('notas', 'clienteId', clientId);

        const renderNotesList = () => {
            const notesList = document.getElementById('notesList');
            if (notes.length === 0) {
                notesList.innerHTML = '<p class="text-center">No hay notas para este cliente</p>';
            } else {
                notesList.innerHTML = notes.map(note => `
                    <div class="note-item" data-note-id="${note.id}">
                        <div class="note-item-header">
                            <span class="note-date">${formatDate(note.timestamp)}</span>
                            <div class="note-actions">
                                <button class="action-btn edit" onclick="clientesManager.editNote(${note.id}, ${clientId})">✏️</button>
                                <button class="action-btn delete" onclick="clientesManager.deleteNote(${note.id}, ${clientId})">🗑</button>
                            </div>
                        </div>
                        <div class="note-content">${note.content}</div>
                    </div>
                `).join('');
            }
        };

        const content = `
            <div class="notes-list" id="notesList"></div>
            <div class="note-form">
                <textarea id="newNoteContent" placeholder="Escribir nueva nota..."></textarea>
                <button class="btn btn-primary" id="addNoteBtn">Agregar Nota</button>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" id="closeNotesBtn">Cerrar</button>
        `;

        const modal = modalManager.create(`Notas - ${client.razonSocial}`, content, footer, 'notes-modal');

        renderNotesList();

        const addNoteBtn = modal.querySelector('#addNoteBtn');
        const closeBtn = modal.querySelector('#closeNotesBtn');

        addNoteBtn.addEventListener('click', async () => {
            const content = modal.querySelector('#newNoteContent').value.trim();
            if (!content) {
                showAlert('Por favor escriba una nota', 'error');
                return;
            }

            try {
                const note = {
                    clienteId: clientId,
                    content: content,
                    timestamp: Date.now()
                };
                await db.add('notas', note);
                notes.push(note);
                renderNotesList();
                modal.querySelector('#newNoteContent').value = '';
                showAlert('Nota agregada correctamente', 'success');
            } catch (error) {
                console.error('Error al agregar nota:', error);
                showAlert('Error al agregar nota', 'error');
            }
        });

        closeBtn.addEventListener('click', () => modalManager.close(modal));
    }

    async editNote(noteId, clientId) {
        const notes = await db.getByIndex('notas', 'clienteId', clientId);
        const note = notes.find(n => n.id === noteId);
        if (!note) return;

        const content = `
            <div class="note-form">
                <textarea id="editNoteContent">${note.content}</textarea>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" id="cancelEditNoteBtn">Cancelar</button>
            <button class="btn btn-primary" id="saveEditNoteBtn">Guardar</button>
        `;

        const modal = modalManager.create('Editar Nota', content, footer);

        const saveBtn = modal.querySelector('#saveEditNoteBtn');
        const cancelBtn = modal.querySelector('#cancelEditNoteBtn');

        saveBtn.addEventListener('click', async () => {
            const newContent = modal.querySelector('#editNoteContent').value.trim();
            if (!newContent) {
                showAlert('La nota no puede estar vacía', 'error');
                return;
            }

            try {
                note.content = newContent;
                note.timestamp = Date.now();
                await db.update('notas', note);
                showAlert('Nota actualizada correctamente', 'success');
                modalManager.close(modal);
                this.showNotes(clientId);
            } catch (error) {
                console.error('Error al actualizar nota:', error);
                showAlert('Error al actualizar nota', 'error');
            }
        });

        cancelBtn.addEventListener('click', () => modalManager.close(modal));
    }

    async deleteNote(noteId, clientId) {
        showConfirm(
            '¿Está seguro que desea eliminar esta nota?',
            '',
            async () => {
                try {
                    await db.delete('notas', noteId);
                    showAlert('Nota eliminada correctamente', 'success');
                    modalManager.closeAll();
                    this.showNotes(clientId);
                } catch (error) {
                    console.error('Error al eliminar nota:', error);
                    showAlert('Error al eliminar nota', 'error');
                }
            }
        );
    }

    async showFiles(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (!client) return;

        const archivos = await db.getByIndex('archivos', 'clienteId', clientId);
        
        // Obtener años únicos
        const years = [...new Set(archivos.map(a => a.year))].sort((a, b) => b - a);
        if (years.length === 0) {
            years.push(new Date().getFullYear());
        }

        let currentYear = years[0];
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const renderContent = () => {
            const monthsGrid = modal.querySelector('#monthsGrid');
            const filesList = modal.querySelector('#filesList');
            const uploadSection = modal.querySelector('#uploadSection');

            // Renderizar meses
            monthsGrid.innerHTML = months.map((month, index) => {
                const monthFiles = archivos.filter(a => a.year === currentYear && a.month === index + 1);
                return `
                    <div class="month-card ${monthFiles.length > 0 ? 'has-files' : ''}" data-month="${index + 1}">
                        <div class="month-name">${month}</div>
                        <div class="files-count">${monthFiles.length} archivo(s)</div>
                    </div>
                `;
            }).join('');

            // Event listeners para meses
            monthsGrid.querySelectorAll('.month-card').forEach(card => {
                card.addEventListener('click', () => {
                    const month = parseInt(card.dataset.month);
                    showMonthFiles(month);
                });
            });

            uploadSection.style.display = 'none';
            filesList.innerHTML = '<p class="text-center">Seleccione un mes para ver los archivos</p>';
        };

        const showMonthFiles = (month) => {
            const filesList = modal.querySelector('#filesList');
            const uploadSection = modal.querySelector('#uploadSection');
            const monthFiles = archivos.filter(a => a.year === currentYear && a.month === month);

            uploadSection.style.display = 'block';
            uploadSection.querySelector('#currentMonth').textContent = months[month - 1];
            uploadSection.querySelector('#currentYear').textContent = currentYear;
            uploadSection.querySelector('#uploadMonth').value = month;
            uploadSection.querySelector('#uploadYear').value = currentYear;

            if (monthFiles.length === 0) {
                filesList.innerHTML = '<p class="text-center">No hay archivos para este mes</p>';
            } else {
                filesList.innerHTML = monthFiles.map(file => `
                    <div class="file-item">
                        <div class="file-info">
                            <div class="file-name">${file.name}</div>
                            <div class="file-date">${formatDate(file.timestamp)}</div>
                        </div>
                        <div class="file-actions">
                            <button class="action-btn view" onclick="clientesManager.viewPDF(${file.id})">👁</button>
                            <button class="action-btn delete" onclick="clientesManager.deleteFile(${file.id}, ${clientId})">🗑</button>
                        </div>
                    </div>
                `).join('');
            }
        };

        const content = `
            <div class="years-tabs" id="yearsTabs">
                ${years.map(year => `
                    <button class="year-tab ${year === currentYear ? 'active' : ''}" data-year="${year}">${year}</button>
                `).join('')}
            </div>
            <div class="months-grid" id="monthsGrid"></div>
            <div class="upload-section" id="uploadSection" style="display: none;">
                <h4>Subir archivo para <span id="currentMonth"></span> <span id="currentYear"></span></h4>
                <form class="upload-form" id="uploadForm">
                    <input type="hidden" id="uploadMonth">
                    <input type="hidden" id="uploadYear">
                    <div class="form-group">
                        <label>Nombre del archivo</label>
                        <input type="text" id="fileName" placeholder="Ingrese el nombre del archivo" required>
                    </div>
                    <div class="form-group">
                        <div class="file-input-wrapper">
                            <label class="file-input-label" for="pdfFile">Seleccionar PDF</label>
                            <input type="file" id="pdfFile" accept=".pdf" required>
                        </div>
                        <div class="selected-file" id="selectedFileName"></div>
                    </div>
                    <button type="submit" class="btn btn-primary">Subir Archivo</button>
                </form>
            </div>
            <div class="files-list" id="filesList"></div>
        `;

        const footer = `
            <button class="btn btn-secondary" id="closeFilesBtn">Cerrar</button>
        `;

        const modal = modalManager.create(`Archivos - ${client.razonSocial}`, content, footer, 'files-modal');

        renderContent();

        // Event listeners para años
        modal.querySelectorAll('.year-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                modal.querySelectorAll('.year-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentYear = parseInt(tab.dataset.year);
                renderContent();
            });
        });

        // Event listener para seleccionar archivo
        modal.querySelector('#pdfFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            const selectedFileName = modal.querySelector('#selectedFileName');
            if (file) {
                selectedFileName.textContent = file.name;
            } else {
                selectedFileName.textContent = '';
            }
        });

        // Event listener para subir archivo
        modal.querySelector('#uploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const fileName = modal.querySelector('#fileName').value.trim();
            const pdfFile = modal.querySelector('#pdfFile').files[0];
            const month = parseInt(modal.querySelector('#uploadMonth').value);
            const year = parseInt(modal.querySelector('#uploadYear').value);

            if (!fileName || !pdfFile) {
                showAlert('Complete todos los campos', 'error');
                return;
            }

            try {
                const fileData = await fileToBase64(pdfFile);

                const archivo = {
                    clienteId: clientId,
                    name: fileName + '.pdf',
                    data: fileData,
                    year: year,
                    month: month,
                    timestamp: Date.now()
                };

                await db.add('archivos', archivo);
                archivos.push(archivo);
                
                showAlert('Archivo subido correctamente', 'success');
                
                modal.querySelector('#fileName').value = '';
                modal.querySelector('#pdfFile').value = '';
                modal.querySelector('#selectedFileName').textContent = '';
                
                renderContent();
                showMonthFiles(month);
            } catch (error) {
                console.error('Error al subir archivo:', error);
                showAlert('Error al subir archivo', 'error');
            }
        });

        modal.querySelector('#closeFilesBtn').addEventListener('click', () => modalManager.close(modal));
    }

    async viewPDF(fileId) {
        try {
            const file = await db.get('archivos', fileId);
            if (file) {
                const blob = await base64ToBlob(file.data);
                const arrayBuffer = await blob.arrayBuffer();
                showPDFViewer(arrayBuffer, file.name);
            }
        } catch (error) {
            console.error('Error al ver PDF:', error);
            showAlert('Error al abrir el PDF', 'error');
        }
    }

    async deleteFile(fileId, clientId) {
        showConfirm(
            '¿Está seguro que desea eliminar este archivo?',
            '',
            async () => {
                try {
                    await db.delete('archivos', fileId);
                    showAlert('Archivo eliminado correctamente', 'success');
                    modalManager.closeAll();
                    this.showFiles(clientId);
                } catch (error) {
                    console.error('Error al eliminar archivo:', error);
                    showAlert('Error al eliminar archivo', 'error');
                }
            }
        );
    }

    async showMarks(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (!client) return;

        const marks = client.marks || [];

        const renderMarksList = () => {
            const marksList = document.getElementById('marksList');
            if (marks.length === 0) {
                marksList.innerHTML = '<p class="text-center">No hay marcas para este cliente</p>';
            } else {
                marksList.innerHTML = marks.map((mark, index) => `
                    <div class="mark-item" data-mark-index="${index}">
                        <span class="mark-text">${mark}</span>
                        <div class="mark-actions">
                            <button class="action-btn edit" onclick="clientesManager.editMark(${clientId}, ${index})">✏️</button>
                            <button class="action-btn delete" onclick="clientesManager.deleteMark(${clientId}, ${index})">🗑</button>
                        </div>
                    </div>
                `).join('');
            }
        };

        const content = `
            <div class="marks-list" id="marksList"></div>
            <div class="mark-form">
                <input type="text" id="newMarkInput" placeholder="Escribir nueva marca..." maxlength="20">
                <button class="btn btn-primary" id="addMarkBtn">Agregar Marca</button>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" id="closeMarksBtn">Cerrar</button>
        `;

        const modal = modalManager.create(`Marcas - ${client.razonSocial}`, content, footer, 'marks-modal');

        renderMarksList();

        const addMarkBtn = modal.querySelector('#addMarkBtn');
        const newMarkInput = modal.querySelector('#newMarkInput');
        const closeBtn = modal.querySelector('#closeMarksBtn');

        addMarkBtn.addEventListener('click', async () => {
            const markText = newMarkInput.value.trim();
            if (!markText) {
                showAlert('Por favor escriba una marca', 'error');
                return;
            }

            if (marks.includes(markText)) {
                showAlert('Esta marca ya existe', 'error');
                return;
            }

            try {
                marks.push(markText);
                client.marks = marks;
                await db.update('clientes', client);
                await this.loadClients();
                renderMarksList();
                newMarkInput.value = '';
                showAlert('Marca agregada correctamente', 'success');
            } catch (error) {
                console.error('Error al agregar marca:', error);
                showAlert('Error al agregar marca', 'error');
            }
        });

        // Permitir agregar con Enter
        newMarkInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addMarkBtn.click();
            }
        });

        closeBtn.addEventListener('click', () => modalManager.close(modal));
    }

    async editMark(clientId, markIndex) {
        const client = this.clients.find(c => c.id === clientId);
        if (!client || !client.marks) return;

        const currentMark = client.marks[markIndex];

        const content = `
            <div class="form-group">
                <label>Editar marca:</label>
                <input type="text" id="editMarkInput" value="${currentMark}" maxlength="20">
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" id="cancelEditMarkBtn">Cancelar</button>
            <button class="btn btn-primary" id="saveEditMarkBtn">Guardar</button>
        `;

        const modal = modalManager.create('Editar Marca', content, footer);

        const saveBtn = modal.querySelector('#saveEditMarkBtn');
        const cancelBtn = modal.querySelector('#cancelEditMarkBtn');
        const editInput = modal.querySelector('#editMarkInput');

        saveBtn.addEventListener('click', async () => {
            const newMark = editInput.value.trim();

            if (!newMark) {
                showAlert('La marca no puede estar vacía', 'error');
                return;
            }

            if (newMark !== currentMark && client.marks.includes(newMark)) {
                showAlert('Esta marca ya existe', 'error');
                return;
            }

            try {
                client.marks[markIndex] = newMark;
                await db.update('clientes', client);
                await this.loadClients();
                showAlert('Marca actualizada correctamente', 'success');
                modalManager.close(modal);
                this.showMarks(clientId);
            } catch (error) {
                console.error('Error al actualizar marca:', error);
                showAlert('Error al actualizar marca', 'error');
            }
        });

        cancelBtn.addEventListener('click', () => modalManager.close(modal));

        // Permitir guardar con Enter
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveBtn.click();
            }
        });

        editInput.focus();
        editInput.select();
    }

    async deleteMark(clientId, markIndex) {
        const client = this.clients.find(c => c.id === clientId);
        if (!client || !client.marks) return;

        const markText = client.marks[markIndex];

        showConfirm(
            '¿Está seguro que desea eliminar esta marca?',
            `Se eliminará: ${markText}`,
            async () => {
                try {
                    client.marks.splice(markIndex, 1);
                    await db.update('clientes', client);
                    await this.loadClients();
                    showAlert('Marca eliminada correctamente', 'success');
                    modalManager.closeAll();
                    this.showMarks(clientId);
                } catch (error) {
                    console.error('Error al eliminar marca:', error);
                    showAlert('Error al eliminar marca', 'error');
                }
            }
        );
    }
}

// Instancia global
const clientesManager = new ClientesManager();
