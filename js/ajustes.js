// Gestor de Ajustes
class AjustesManager {
    constructor() {
        this.optionTypes = {
            tipoContribuyente: 'Tipo de Contribuyente',
            tipoEntidad: 'Tipo de Entidad',
            administracion: 'Administración',
            facturacion: 'Facturación',
            regimen: 'Régimen',
            consolidacion: 'Consolidación',
            encargado: 'Encargado'
        };
    }

    async init() {
        await this.loadCurrentCredentials();
        this.setupEventListeners();
    }

    async loadCurrentCredentials() {
        const credentials = await db.getConfig('credentials');
        const currentUsernameInput = document.getElementById('currentUsername');
        if (currentUsernameInput && credentials) {
            currentUsernameInput.value = credentials.username;
        }
    }

    setupEventListeners() {
        // Cambiar credenciales
        const changeCredentialsForm = document.getElementById('changeCredentialsForm');
        changeCredentialsForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.changeCredentials();
        });

        // Gestión de opciones
        const optionTypeSelect = document.getElementById('optionTypeSelect');
        optionTypeSelect?.addEventListener('change', (e) => {
            this.loadOptions(e.target.value);
        });

        const addOptionBtn = document.getElementById('addOptionBtn');
        addOptionBtn?.addEventListener('click', () => {
            this.addOption();
        });

        // Backup y restauración
        const createBackupBtn = document.getElementById('createBackupBtn');
        createBackupBtn?.addEventListener('click', () => {
            this.createBackup();
        });

        const restoreBackupBtn = document.getElementById('restoreBackupBtn');
        restoreBackupBtn?.addEventListener('click', () => {
            document.getElementById('restoreBackupInput').click();
        });

        const restoreBackupInput = document.getElementById('restoreBackupInput');
        restoreBackupInput?.addEventListener('change', (e) => {
            this.restoreBackup(e.target.files[0]);
        });
    }

    async changeCredentials() {
        const newUsername = document.getElementById('newUsername').value.trim();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!newUsername || !newPassword || !confirmPassword) {
            showAlert('Por favor complete todos los campos', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showAlert('Las contraseñas no coinciden', 'error');
            return;
        }

        if (newPassword.length < 4) {
            showAlert('La contraseña debe tener al menos 4 caracteres', 'error');
            return;
        }

        showConfirm(
            '¿Está seguro que desea cambiar las credenciales?',
            'Deberá iniciar sesión nuevamente con las nuevas credenciales',
            async () => {
                try {
                    await auth.changeCredentials(newUsername, newPassword);
                    showAlert('Credenciales actualizadas correctamente', 'success');
                    
                    // Limpiar formulario
                    document.getElementById('newUsername').value = '';
                    document.getElementById('newPassword').value = '';
                    document.getElementById('confirmPassword').value = '';
                    
                    await this.loadCurrentCredentials();
                } catch (error) {
                    console.error('Error al cambiar credenciales:', error);
                    showAlert('Error al cambiar credenciales', 'error');
                }
            }
        );
    }

    async loadOptions(optionType) {
        if (!optionType) {
            document.getElementById('optionsListContainer').innerHTML = '';
            return;
        }

        const options = await db.getConfig(optionType);
        const container = document.getElementById('optionsListContainer');

        if (!options || options.length === 0) {
            container.innerHTML = '<p class="text-center">No hay opciones disponibles</p>';
            return;
        }

        container.innerHTML = options.map((option, index) => `
            <div class="option-item">
                <span>${option}</span>
                <div class="option-item-actions">
                    <button class="action-btn edit" onclick="ajustesManager.editOption('${optionType}', ${index})">✏️</button>
                    <button class="action-btn delete" onclick="ajustesManager.deleteOption('${optionType}', ${index})">🗑</button>
                </div>
            </div>
        `).join('');
    }

    async addOption() {
        const optionType = document.getElementById('optionTypeSelect').value;
        const newOptionValue = document.getElementById('newOptionValue').value.trim();

        if (!optionType) {
            showAlert('Por favor seleccione un tipo de opción', 'error');
            return;
        }

        if (!newOptionValue) {
            showAlert('Por favor ingrese un valor para la opción', 'error');
            return;
        }

        try {
            const options = await db.getConfig(optionType);
            
            if (options.includes(newOptionValue)) {
                showAlert('Esta opción ya existe', 'error');
                return;
            }

            options.push(newOptionValue);
            await db.setConfig(optionType, options);

            showAlert('Opción agregada correctamente', 'success');
            document.getElementById('newOptionValue').value = '';
            
            await this.loadOptions(optionType);
            await this.refreshFiltersAndForms();
        } catch (error) {
            console.error('Error al agregar opción:', error);
            showAlert('Error al agregar opción', 'error');
        }
    }

    async editOption(optionType, index) {
        const options = await db.getConfig(optionType);
        const currentValue = options[index];

        const content = `
            <div class="form-group">
                <label>Editar opción:</label>
                <input type="text" id="editOptionValue" value="${currentValue}">
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" id="cancelEditOptionBtn">Cancelar</button>
            <button class="btn btn-primary" id="saveEditOptionBtn">Guardar</button>
        `;

        const modal = modalManager.create('Editar Opción', content, footer);

        const saveBtn = modal.querySelector('#saveEditOptionBtn');
        const cancelBtn = modal.querySelector('#cancelEditOptionBtn');

        saveBtn.addEventListener('click', async () => {
            const newValue = modal.querySelector('#editOptionValue').value.trim();

            if (!newValue) {
                showAlert('El valor no puede estar vacío', 'error');
                return;
            }

            if (newValue !== currentValue && options.includes(newValue)) {
                showAlert('Esta opción ya existe', 'error');
                return;
            }

            try {
                options[index] = newValue;
                await db.setConfig(optionType, options);

                showAlert('Opción actualizada correctamente', 'success');
                modalManager.close(modal);
                
                await this.loadOptions(optionType);
                await this.refreshFiltersAndForms();
            } catch (error) {
                console.error('Error al editar opción:', error);
                showAlert('Error al editar opción', 'error');
            }
        });

        cancelBtn.addEventListener('click', () => modalManager.close(modal));
    }

    async deleteOption(optionType, index) {
        const options = await db.getConfig(optionType);
        const optionValue = options[index];

        showConfirm(
            '¿Está seguro que desea eliminar esta opción?',
            `Se eliminará: ${optionValue}`,
            async () => {
                try {
                    options.splice(index, 1);
                    await db.setConfig(optionType, options);

                    showAlert('Opción eliminada correctamente', 'success');
                    
                    await this.loadOptions(optionType);
                    await this.refreshFiltersAndForms();
                } catch (error) {
                    console.error('Error al eliminar opción:', error);
                    showAlert('Error al eliminar opción', 'error');
                }
            }
        );
    }

    async refreshFiltersAndForms() {
        // Recargar opciones en el gestor de clientes
        if (window.clientesManager) {
            await clientesManager.loadOptions();
        }
    }

    async createBackup() {
        showConfirm(
            '¿Desea crear una copia de respaldo?',
            'Se descargará un archivo con todos los datos de la aplicación',
            async () => {
                try {
                    const loadingModal = showLoading('Creando backup...');

                    const data = await db.exportData();
                    const dataStr = JSON.stringify(data, null, 2);
                    const blob = new Blob([dataStr], { type: 'application/json' });

                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const fileName = `backup_gestion_clientes_${timestamp}.json`;

                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    URL.revokeObjectURL(url);

                    hideLoading();
                    showAlert('Backup creado exitosamente', 'success');
                } catch (error) {
                    hideLoading();
                    console.error('Error al crear backup:', error);
                    showAlert('Error al crear backup', 'error');
                }
            }
        );
    }

    async restoreBackup(file) {
        if (!file) return;

        showConfirm(
            '¿Está seguro que desea restaurar este backup?',
            'ADVERTENCIA: Todos los datos actuales serán reemplazados',
            async () => {
                try {
                    const loadingModal = showLoading('Restaurando backup...');

                    const text = await file.text();
                    const data = JSON.parse(text);

                    // Validar estructura del backup
                    if (!data.clientes || !data.config) {
                        throw new Error('Archivo de backup inválido');
                    }

                    await db.importData(data);

                    hideLoading();
                    showAlert('Backup restaurado exitosamente. La página se recargará.', 'success');

                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } catch (error) {
                    hideLoading();
                    console.error('Error al restaurar backup:', error);
                    showAlert('Error al restaurar backup. Verifique el archivo.', 'error');
                }
            }
        );

        // Limpiar input
        document.getElementById('restoreBackupInput').value = '';
    }
}

// Instancia global
const ajustesManager = new AjustesManager();
