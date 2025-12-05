// Gestor de Unir PDFs
class UnirManager {
    constructor() {
        this.selectedClient = null;
        this.mergedPdfs = [];
        this.currentPage = 1;
        this.pdfsPerPage = 5;
    }

    async init() {
        this.setupEventListeners();
        await this.loadMergedPdfs();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchClientUnir');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchClients(e.target.value);
            });
        }

        const mergeBtn = document.getElementById('mergePdfsBtn');
        if (mergeBtn) {
            mergeBtn.addEventListener('click', () => {
                this.mergePdfs();
            });
        }

        const mergedPerPage = document.getElementById('mergedPerPage');
        if (mergedPerPage) {
            mergedPerPage.addEventListener('change', (e) => {
                this.pdfsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.renderMergedPdfs();
            });
        }
    }

    async searchClients(query) {
        const suggestionsDiv = document.getElementById('clientSuggestionsUnir');
        
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

            // Event listeners para sugerencias
            suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    const clientId = parseInt(item.dataset.clientId);
                    this.selectClient(clientId);
                    suggestionsDiv.style.display = 'none';
                });
            });
        }
    }

    async selectClient(clientId) {
        const client = await db.get('clientes', clientId);
        if (!client) return;

        this.selectedClient = client;

        document.getElementById('searchClientUnir').value = `${client.razonSocial} - ${client.nit}`;
        document.getElementById('clientNameUnir').textContent = client.razonSocial;
        document.getElementById('selectedClientUnir').style.display = 'block';

        await this.loadClientPdfs(clientId);
    }

    async loadClientPdfs(clientId) {
        const archivos = await db.getByIndex('archivos', 'clienteId', clientId);
        const pdfListDiv = document.getElementById('pdfListUnir');

        if (archivos.length === 0) {
            pdfListDiv.innerHTML = '<p class="text-center">Este cliente no tiene archivos PDF</p>';
            return;
        }

        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        pdfListDiv.innerHTML = archivos.map(archivo => `
            <div class="pdf-item">
                <input type="checkbox" id="pdf-${archivo.id}" value="${archivo.id}" class="pdf-checkbox">
                <label for="pdf-${archivo.id}">
                    ${archivo.name} - ${months[archivo.month - 1]} ${archivo.year}
                </label>
            </div>
        `).join('');
    }

    async mergePdfs() {
        const checkboxes = document.querySelectorAll('.pdf-checkbox:checked');
        
        if (checkboxes.length === 0) {
            showAlert('Por favor seleccione al menos un archivo PDF', 'error');
            return;
        }

        const fileName = document.getElementById('mergedFileName').value.trim();
        if (!fileName) {
            showAlert('Por favor ingrese un nombre para el archivo combinado', 'error');
            return;
        }

        const loadingModal = showLoading('Combinando archivos PDF...');

        try {
            const { PDFDocument } = PDFLib;
            const mergedPdf = await PDFDocument.create();

            // Obtener y combinar los PDFs seleccionados
            for (const checkbox of checkboxes) {
                const fileId = parseInt(checkbox.value);
                const archivo = await db.get('archivos', fileId);
                
                if (archivo) {
                    const blob = await base64ToBlob(archivo.data);
                    const arrayBuffer = await blob.arrayBuffer();
                    const pdf = await PDFDocument.load(arrayBuffer);
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                }
            }

            // Guardar el PDF combinado
            const mergedPdfBytes = await mergedPdf.save();
            const mergedBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const mergedBase64 = await fileToBase64(mergedBlob);

            // Guardar en la base de datos
            const mergedData = {
                name: fileName + '.pdf',
                data: mergedBase64,
                clienteId: this.selectedClient.id,
                clienteName: this.selectedClient.razonSocial,
                timestamp: Date.now()
            };

            await db.add('pdfsMerged', mergedData);

            hideLoading();
            showAlert('PDFs combinados exitosamente', 'success');

            // Limpiar selección
            document.querySelectorAll('.pdf-checkbox').forEach(cb => cb.checked = false);
            document.getElementById('mergedFileName').value = '';

            await this.loadMergedPdfs();
        } catch (error) {
            hideLoading();
            console.error('Error al combinar PDFs:', error);
            showAlert('Error al combinar los archivos PDF', 'error');
        }
    }

    async loadMergedPdfs() {
        try {
            this.mergedPdfs = await db.getAll('pdfsMerged');
            this.renderMergedPdfs();
        } catch (error) {
            console.error('Error al cargar PDFs combinados:', error);
        }
    }

    renderMergedPdfs() {
        const tbody = document.getElementById('mergedPdfsTableBody');
        if (!tbody) return;

        const start = (this.currentPage - 1) * this.pdfsPerPage;
        const end = start + this.pdfsPerPage;
        const pdfsToShow = this.mergedPdfs.slice(start, end);

        if (pdfsToShow.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No hay PDFs combinados</td></tr>';
        } else {
            tbody.innerHTML = pdfsToShow.map(pdf => `
                <tr>
                    <td>${pdf.name}</td>
                    <td>${formatDate(pdf.timestamp)}</td>
                    <td>
                        <div class="actions">
                            <button class="action-btn view" onclick="unirManager.viewMergedPDF(${pdf.id})" title="Ver">👁</button>
                            <button class="action-btn files" onclick="unirManager.downloadMergedPDF(${pdf.id})" title="Descargar">⬇️</button>
                            <button class="action-btn delete" onclick="unirManager.deleteMergedPDF(${pdf.id})" title="Eliminar">🗑</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        this.renderPagination();
    }

    renderPagination() {
        const pagination = document.getElementById('mergedPagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.mergedPdfs.length / this.pdfsPerPage);

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = `
            <button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                onclick="unirManager.goToPage(${this.currentPage - 1})">‹</button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                html += `
                    <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="unirManager.goToPage(${i})">${i}</button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                html += '<span>...</span>';
            }
        }

        html += `
            <button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                onclick="unirManager.goToPage(${this.currentPage + 1})">›</button>
        `;

        pagination.innerHTML = html;
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.mergedPdfs.length / this.pdfsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderMergedPdfs();
        }
    }

    async viewMergedPDF(pdfId) {
        try {
            const pdf = await db.get('pdfsMerged', pdfId);
            if (pdf) {
                const blob = await base64ToBlob(pdf.data);
                const arrayBuffer = await blob.arrayBuffer();
                showPDFViewer(arrayBuffer, pdf.name);
            }
        } catch (error) {
            console.error('Error al ver PDF:', error);
            showAlert('Error al abrir el PDF', 'error');
        }
    }

    async downloadMergedPDF(pdfId) {
        try {
            const pdf = await db.get('pdfsMerged', pdfId);
            if (pdf) {
                const blob = await base64ToBlob(pdf.data);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = pdf.name;
                a.click();
                URL.revokeObjectURL(url);
                showAlert('Descarga iniciada', 'success');
            }
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            showAlert('Error al descargar el PDF', 'error');
        }
    }

    async deleteMergedPDF(pdfId) {
        showConfirm(
            '¿Está seguro que desea eliminar este PDF combinado?',
            '',
            async () => {
                try {
                    await db.delete('pdfsMerged', pdfId);
                    showAlert('PDF eliminado correctamente', 'success');
                    await this.loadMergedPdfs();
                } catch (error) {
                    console.error('Error al eliminar PDF:', error);
                    showAlert('Error al eliminar el PDF', 'error');
                }
            }
        );
    }
}

// Instancia global
const unirManager = new UnirManager();
