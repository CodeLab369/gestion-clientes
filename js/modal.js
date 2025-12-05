// Sistema de Modales Personalizados
class ModalManager {
    constructor() {
        this.container = document.getElementById('modalContainer');
        this.currentModal = null;
    }

    create(title, content, footer = null, cssClass = '') {
        const overlay = document.createElement('div');
        overlay.className = `modal-overlay ${cssClass}`;

        const modal = document.createElement('div');
        modal.className = 'modal';

        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <h2>${title}</h2>
            <button class="modal-close" aria-label="Cerrar">&times;</button>
        `;

        const body = document.createElement('div');
        body.className = 'modal-body';
        body.innerHTML = content;

        modal.appendChild(header);
        modal.appendChild(body);

        if (footer) {
            const footerEl = document.createElement('div');
            footerEl.className = 'modal-footer';
            footerEl.innerHTML = footer;
            modal.appendChild(footerEl);
        }

        overlay.appendChild(modal);
        this.container.appendChild(overlay);

        // Event listeners
        const closeBtn = header.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => this.close(overlay));

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.close(overlay);
            }
        });

        this.currentModal = overlay;
        return overlay;
    }

    close(modal = null) {
        const modalToClose = modal || this.currentModal;
        if (modalToClose) {
            modalToClose.classList.add('closing');
            setTimeout(() => {
                modalToClose.remove();
                if (this.currentModal === modalToClose) {
                    this.currentModal = null;
                }
            }, 300);
        }
    }

    closeAll() {
        this.container.innerHTML = '';
        this.currentModal = null;
    }
}

const modalManager = new ModalManager();

// Funciones de utilidad para modales comunes
function showAlert(message, type = 'info') {
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };

    const content = `
        <div class="alert-icon ${type}">${icons[type] || icons.info}</div>
        <div class="alert-message">${message}</div>
    `;

    const footer = `
        <button class="btn btn-primary" id="alertOkBtn">Aceptar</button>
    `;

    const modal = modalManager.create('', content, footer, 'alert-modal');

    const okBtn = modal.querySelector('#alertOkBtn');
    okBtn.addEventListener('click', () => modalManager.close(modal));

    // Cerrar con Enter
    document.addEventListener('keydown', function enterHandler(e) {
        if (e.key === 'Enter') {
            modalManager.close(modal);
            document.removeEventListener('keydown', enterHandler);
        }
    });
}

function showConfirm(message, details = '', onConfirm, onCancel = null) {
    const content = `
        <div class="confirm-icon warning">⚠</div>
        <div class="confirm-message">${message}</div>
        ${details ? `<div class="confirm-details">${details}</div>` : ''}
    `;

    const footer = `
        <button class="btn btn-secondary" id="confirmCancelBtn">Cancelar</button>
        <button class="btn btn-primary" id="confirmOkBtn">Confirmar</button>
    `;

    const modal = modalManager.create('Confirmación', content, footer, 'confirm-modal');

    const okBtn = modal.querySelector('#confirmOkBtn');
    const cancelBtn = modal.querySelector('#confirmCancelBtn');

    okBtn.addEventListener('click', () => {
        modalManager.close(modal);
        if (onConfirm) onConfirm();
    });

    cancelBtn.addEventListener('click', () => {
        modalManager.close(modal);
        if (onCancel) onCancel();
    });
}

function showLoading(message = 'Procesando...') {
    const content = `
        <div style="text-align: center; padding: 40px;">
            <div class="loading-spinner" style="margin: 0 auto 20px; width: 50px; height: 50px; border-width: 5px;"></div>
            <p style="font-size: 18px; color: var(--text-dark);">${message}</p>
        </div>
    `;

    return modalManager.create('', content, null, 'loading-modal');
}

function hideLoading() {
    modalManager.closeAll();
}

// Modal para ver cliente
function showClientDetails(client) {
    const content = `
        <div class="client-details">
            <div class="detail-item">
                <div class="detail-label">NIT/CUR/CI</div>
                <div class="detail-value">${client.nit || '-'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Razón Social</div>
                <div class="detail-value">${client.razonSocial || '-'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Correo Electrónico</div>
                <div class="detail-value">${client.correo || '-'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Contraseña</div>
                <div class="detail-value">${client.password || '-'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Tipo de Contribuyente</div>
                <div class="detail-value">${client.tipoContribuyente || '-'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Tipo de Entidad</div>
                <div class="detail-value">${client.tipoEntidad || '-'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Contacto</div>
                <div class="detail-value">${client.contacto || '-'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Administración</div>
                <div class="detail-value">${client.administracion || '-'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Facturación</div>
                <div class="detail-value">${client.facturacion || '-'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Régimen</div>
                <div class="detail-value">${client.regimen || '-'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Actividad</div>
                <div class="detail-value">${client.actividad || '-'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Consolidación</div>
                <div class="detail-value">${client.consolidacion || '-'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Encargado</div>
                <div class="detail-value">${client.encargado || '-'}</div>
            </div>
            <div class="detail-item" style="grid-column: 1 / -1;">
                <div class="detail-label">Dirección</div>
                <div class="detail-value">${client.direccion || '-'}</div>
            </div>
        </div>
        <div style="margin-top: 20px; padding: 20px; background: var(--light-bg); border-radius: 5px;">
            <h4 style="margin-bottom: 15px; color: var(--primary-color);">Copiar Información</h4>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn btn-secondary" id="copyNitBtn">📋 Copiar NIT</button>
                <button class="btn btn-secondary" id="copyEmailBtn">📋 Copiar Correo</button>
                <button class="btn btn-secondary" id="copyPasswordBtn">📋 Copiar Contraseña</button>
                <button class="btn btn-primary" id="copyAllBtn">📋 Copiar Todo</button>
            </div>
        </div>
    `;

    const footer = `
        <button class="btn btn-secondary" id="closeDetailsBtn">Cerrar</button>
    `;

    const modal = modalManager.create('Información del Cliente', content, footer, 'view-client-modal');

    // Botón copiar NIT
    modal.querySelector('#copyNitBtn')?.addEventListener('click', () => {
        copyToClipboard(client.nit || '');
    });

    // Botón copiar correo
    modal.querySelector('#copyEmailBtn')?.addEventListener('click', () => {
        copyToClipboard(client.correo || '');
    });

    // Botón copiar contraseña
    modal.querySelector('#copyPasswordBtn')?.addEventListener('click', () => {
        copyToClipboard(client.password || '');
    });

    // Botón copiar todo
    modal.querySelector('#copyAllBtn')?.addEventListener('click', () => {
        const info = `NIT/CUR/CI: ${client.nit || '-'}\nCorreo: ${client.correo || '-'}\nContraseña: ${client.password || '-'}`;
        copyToClipboard(info);
    });

    const closeBtn = modal.querySelector('#closeDetailsBtn');
    closeBtn.addEventListener('click', () => modalManager.close(modal));
}

// Modal para visor de PDF
function showPDFViewer(pdfData, fileName) {
    const blob = new Blob([pdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const content = `
        <div class="pdf-viewer-controls">
            <span>${fileName}</span>
            <button class="btn btn-primary" id="downloadPdfBtn">Descargar</button>
        </div>
        <iframe class="pdf-viewer-frame" src="${url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH"></iframe>
    `;

    const modal = modalManager.create('Visor de PDF', content, null, 'pdf-viewer-modal');

    const downloadBtn = modal.querySelector('#downloadPdfBtn');
    downloadBtn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
    });

    // Limpiar URL cuando se cierre el modal
    const closeBtn = modal.querySelector('.modal-close');
    const originalCloseHandler = closeBtn.onclick;
    closeBtn.onclick = (e) => {
        URL.revokeObjectURL(url);
        if (originalCloseHandler) originalCloseHandler(e);
    };
}

// Utilidades generales
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showAlert('Texto copiado al portapapeles', 'success');
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showAlert('Texto copiado al portapapeles', 'success');
    } catch (err) {
        showAlert('No se pudo copiar el texto', 'error');
    }
    
    document.body.removeChild(textarea);
}

async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function base64ToBlob(base64) {
    const response = await fetch(base64);
    return await response.blob();
}
