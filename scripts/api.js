// scripts/api.js - Frontend-Backend Communication
class GripStoreAPI {
    constructor() {
        this.baseURL = 'http://localhost:3000'; // Your backend URL
        this.token = localStorage.getItem('gripstore_token');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('gripstore_token', token);
    }

    // Remove token (logout)
    removeToken() {
        this.token = null;
        localStorage.removeItem('gripstore_token');
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        // Default headers
        const headers = {
            'Content-Type': 'application/json',
        };

        // Add authorization header if token exists
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        // Merge with custom options
        const config = {
            headers,
            ...options
        };

        try {
            console.log(`🔄 API Call: ${url}`);
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            console.log(`✅ API Success: ${endpoint}`);
            return data;

        } catch (error) {
            console.error(`❌ API Error (${endpoint}):`, error.message);
            throw error;
        }
    }

    // ==================== AUTH API METHODS ====================

    async login(email, password) {
        return await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async register(userData) {
        return await this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // ==================== PRODUCTS API METHODS ====================

    async getProducts(filters = {}) {
        // Convert filters to query string
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/api/products${queryParams ? `?${queryParams}` : ''}`;
        return await this.request(endpoint);
    }

    async getProduct(productId) {
        return await this.request(`/api/products/${productId}`);
    }

    async searchProducts(query) {
        return await this.request(`/api/products?search=${encodeURIComponent(query)}`);
    }

    // ==================== CART/ORDERS API METHODS ====================

    async createOrder(orderData) {
        return await this.request('/api/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getOrders() {
        return await this.request('/api/orders');
    }

    async getOrder(orderId) {
        return await this.request(`/api/orders/${orderId}`);
    }

    // ==================== ADMIN API METHODS ====================

    async createProduct(productData) {
        return await this.request('/api/admin/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    async updateProduct(productId, productData) {
        return await this.request(`/api/admin/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    async deleteProduct(productId) {
        return await this.request(`/api/admin/products/${productId}`, {
            method: 'DELETE'
        });
    }
}

// Create global instance
window.gripstoreAPI = new GripStoreAPI();