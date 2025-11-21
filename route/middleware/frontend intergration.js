// scripts/api.js
class GripStoreAPI {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('gripstore_token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('gripstore_token', token);
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    // Auth methods
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (data.success && data.data.token) {
            this.setToken(data.data.token);
        }

        return data;
    }

    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (data.success && data.data.token) {
            this.setToken(data.data.token);
        }

        return data;
    }

    // Product methods
    async getProducts(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/products${queryParams ? `?${queryParams}` : ''}`;
        return await this.request(endpoint);
    }

    async getProduct(productId) {
        return await this.request(`/products/${productId}`);
    }

    // Cart/Order methods
    async createOrder(orderData) {
        return await this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getOrders() {
        return await this.request('/orders');
    }
}

// Global API instance
window.gripstoreAPI = new GripStoreAPI();