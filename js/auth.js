// Sistema de Autenticación
class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
    }

    async init() {
        // Verificar si hay sesión guardada
        const session = localStorage.getItem('session');
        if (session) {
            const sessionData = JSON.parse(session);
            if (this.validateSession(sessionData)) {
                this.isAuthenticated = true;
                this.currentUser = sessionData.username;
                this.showApp();
                return;
            }
        }
        this.showLogin();
    }

    validateSession(sessionData) {
        // Verificar si la sesión no ha expirado (24 horas)
        const now = new Date().getTime();
        const sessionTime = sessionData.timestamp;
        const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);
        return hoursDiff < 24;
    }

    async login(username, password) {
        try {
            const credentials = await db.getConfig('credentials');
            
            if (username === credentials.username && password === credentials.password) {
                this.isAuthenticated = true;
                this.currentUser = username;
                
                // Guardar sesión
                const sessionData = {
                    username: username,
                    timestamp: new Date().getTime()
                };
                localStorage.setItem('session', JSON.stringify(sessionData));
                
                this.showApp();
                return true;
            } else {
                throw new Error('Usuario o contraseña incorrectos');
            }
        } catch (error) {
            throw error;
        }
    }

    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        localStorage.removeItem('session');
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
    }

    showApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'flex';
        
        // Cargar datos iniciales
        if (window.clientesManager) {
            window.clientesManager.loadClients();
        }
    }

    async changeCredentials(newUsername, newPassword) {
        try {
            await db.setConfig('credentials', {
                username: newUsername,
                password: newPassword
            });
            
            // Actualizar sesión actual
            this.currentUser = newUsername;
            const sessionData = {
                username: newUsername,
                timestamp: new Date().getTime()
            };
            localStorage.setItem('session', JSON.stringify(sessionData));
            
            return true;
        } catch (error) {
            throw error;
        }
    }
}

// Instancia global de autenticación
const auth = new Auth();

// Event listeners para login
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            if (!username || !password) {
                showAlert('Por favor, complete todos los campos', 'error');
                return;
            }

            try {
                await auth.login(username, password);
                showAlert('Inicio de sesión exitoso', 'success');
            } catch (error) {
                showAlert(error.message, 'error');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            showConfirm(
                '¿Está seguro que desea cerrar sesión?',
                'Se cerrará su sesión actual',
                () => {
                    auth.logout();
                    showAlert('Sesión cerrada correctamente', 'success');
                }
            );
        });
    }
});
