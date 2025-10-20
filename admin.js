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
    }

    checkAuthentication() {
        const isAuthenticated = localStorage.getItem('gripstore_admin_auth');
        if (isAuthenticated) {
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    showLogin() {
        document.getElementById('loginModal').classList.add('active');
        document.getElementById('adminDashboard').style.display = 'none';
        this.isLoggedIn = false;
    }

    showDashboard() {
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('adminDashboard').style.display = 'block';
        this.isLoggedIn = true;
        this.initializeDashboard();
    }

    initializeEventListeners() {
        // Login form
        document.getElementById('adminLoginForm').addEventListener('submit', (event) => {
            event.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

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