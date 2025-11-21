// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.currentProductId = null;
        this.isLoggedIn = false;
        this.adminCredentials = {
            username: 'admin',
            password: 'gripstore2024'
        };
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.initializeEventListeners();
        this.showLoadingState(false);
    }

    async checkAuthentication() {
        const token = localStorage.getItem('gripstore_token');
        if (token) {
            window.gripstoreAPI.setToken(token);
            await this.handleTokenValidation();
        } else {
            this.showLogin();
        }
    }

    async handleTokenValidation() {
        try {
            const response = await window.gripstoreAPI.request('/auth/profile');
            if (response?.success) {
                const name = response.data?.user?.first_name || 'Administrator';
                const adminName = document.getElementById('adminName');
                if (adminName) {
                    adminName.textContent = name;
                }
                this.showDashboard();
                return;
            }
        } catch (error) {
            console.warn('Token validation failed:', error.message);
        }

        this.handleLogout({ skipMessage: true });
    }

    showLogin() {
        const loginModal = document.getElementById('loginModal');
        const dashboard = document.getElementById('adminDashboard');
        if (loginModal) loginModal.classList.add('active');
        if (dashboard) dashboard.style.display = 'none';
        this.isLoggedIn = false;
    }

    showDashboard() {
        const loginModal = document.getElementById('loginModal');
        const dashboard = document.getElementById('adminDashboard');
        if (loginModal) loginModal.classList.remove('active');
        if (dashboard) dashboard.style.display = 'block';
        this.isLoggedIn = true;
        this.initializeDashboard();
    }

    showLoadingState(isLoading) {
        const submitButton = document.querySelector('#adminLoginForm button[type="submit"]');
        if (!submitButton) return;

        if (isLoading) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        } else {
            submitButton.disabled = false;
            submitButton.innerHTML = `
                <i class="fas fa-sign-in-alt"></i>
                Login to Dashboard
            `;
        }
    }

    initializeEventListeners() {
        const loginForm = document.getElementById('adminLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                await this.handleLogin();
            });
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        const passwordInput = document.getElementById('adminPassword');
        if (passwordInput) {
            passwordInput.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    loginForm?.dispatchEvent(new Event('submit', { cancelable: true }));
                }
            });
        }

        // Close modals
        document.querySelectorAll('.close-modal').forEach((button) => {
            button.addEventListener('click', (event) => {
                event.target.closest('.modal').classList.remove('active');
            });
        });

        // Modal backdrop clicks
        document.querySelectorAll('.modal').forEach((modal) => {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    handleLogin() {
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        if (username === this.adminCredentials.username && password === this.adminCredentials.password) {
            localStorage.setItem('gripstore_admin_auth', 'true');
            this.showDashboard();
            this.showSuccessMessage('Login successful! Welcome to Admin Dashboard.');
        } else {
            this.showSuccessMessage('Invalid credentials! Please try again.', 'error');
        }
    }

    handleLogout() {
        localStorage.removeItem('gripstore_admin_auth');
        this.showLogin();
        this.showSuccessMessage('Logged out successfully.');
    }

    initializeDashboard() {
        this.initializeTabs();
        this.loadDashboardData();
        this.loadProductsTable();
        this.loadInventory();
        this.loadOrders();
        this.initializeProductForm();
        this.initializeUpload();
        updateCartCount();
    }

    initializeTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach((button) => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');

                // Update active tab button
                tabBtns.forEach((btn) => btn.classList.remove('active'));
                button.classList.add('active');

                // Show active tab content
                tabContents.forEach((content) => {
                    content.classList.remove('active');
                    if (content.id === `${tabId}-tab`) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }
}