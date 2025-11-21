// scripts/products.js - Enhanced Products Management with Real API
class ProductsManager {
    constructor() {
        this.allProducts = [];
        this.currentFilters = {};
        this.isLoading = false;
    }

    // ==================== MAIN PRODUCT LOADING ====================

    async loadProducts(filters = {}) {
        // Prevent multiple simultaneous loads
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading('Loading products...');

        try {
            console.log('🔄 Loading products from API...');
            
            // Call real backend API
            const response = await gripstoreAPI.getProducts(filters);
            
            if (response.success) {
                this.allProducts = response.data;
                this.displayProducts(this.allProducts);
                this.updateProductCount(this.allProducts.length);
                this.updateFilters(filters);
                
                console.log(`✅ Loaded ${this.allProducts.length} products from API`);
            } else {
                throw new Error(response.message || 'Failed to load products');
            }

        } catch (error) {
            console.error('❌ API Error:', error);
            this.showError('Failed to load products from server');
            this.loadSampleProducts(); // Fallback to sample data
            
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    // ==================== PRODUCT DISPLAY ====================

    displayProducts(products) {
        const productsGrid = document.getElementById('productsGrid');
        
        if (!productsGrid) {
            console.error('❌ productsGrid element not found');
            return;
        }

        if (products.length === 0) {
            productsGrid.innerHTML = this.getNoProductsHTML();
            return;
        }

        productsGrid.innerHTML = products.map(product => 
            this.createProductCard(product)
        ).join('');
        
        // Add animation to new products
        this.animateProductCards();
    }

    createProductCard(product) {
        const isOutOfStock = product.stock === 0;
        const stockClass = isOutOfStock ? 'stock-out' : 'stock-in';
        const stockText = isOutOfStock ? 'Out of stock' : `${product.stock} in stock`;

        return `
            <div class="product-item" data-product-id="${product.id}" data-category="${product.category}">
                <div class="product-image">
                    <i class="${product.image || 'fas fa-cube'}"></i>
                </div>
                <div class="product-info">
                    <div class="product-category">${this.formatCategory(product.category)}</div>
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">$${product.price}</div>
                    <div class="product-stock ${stockClass}">
                        ${stockText}
                    </div>
                    ${product.description ? `<div class="product-description">${product.description}</div>` : ''}
                    <div class="product-actions">
                        <button class="product-btn details-btn" onclick="productsManager.showProductDetails(${product.id})">
                            <i class="fas fa-info-circle"></i> Details
                        </button>
                        <button class="product-btn cart-btn" 
                                onclick="productsManager.addToCart(${product.id})" 
                                ${isOutOfStock ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== SEARCH AND FILTERS ====================

    async searchProducts() {
        const searchInput = document.getElementById('productSearch');
        const searchTerm = searchInput?.value.trim() || '';
        
        this.currentFilters.search = searchTerm || undefined;
        await this.loadProducts(this.currentFilters);
    }

    async filterByCategory() {
        const categoryFilter = document.getElementById('categoryFilter');
        const category = categoryFilter?.value || '';
        
        this.currentFilters.category = category || undefined;
        await this.loadProducts(this.currentFilters);
    }

    async sortProducts(sortBy) {
        this.currentFilters.sort_by = sortBy;
        await this.loadProducts(this.currentFilters);
    }

    // ==================== PRODUCT DETAILS ====================

    async showProductDetails(productId) {
        try {
            this.showLoading('Loading product details...');
            
            const response = await gripstoreAPI.getProduct(productId);
            
            if (response.success) {
                this.displayProductModal(response.data);
            } else {
                throw new Error('Product not found');
            }
            
        } catch (error) {
            console.error('Error loading product details:', error);
            this.showError('Failed to load product details');
            
        } finally {
            this.hideLoading();
        }
    }

    displayProductModal(product) {
        const modalHTML = `
            <div class="modal active" id="productModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${product.name}</h3>
                        <button class="close-modal" onclick="productsManager.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="product-modal-content">
                            <div class="product-modal-image">
                                <i class="${product.image || 'fas fa-cube'}"></i>
                            </div>
                            <div class="product-modal-info">
                                <div class="product-price">$${product.price}</div>
                                <div class="product-category">Category: ${this.formatCategory(product.category)}</div>
                                <div class="product-stock ${product.stock > 0 ? 'stock-in' : 'stock-out'}">
                                    ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </div>
                                <div class="product-description">
                                    <h4>Description</h4>
                                    <p>${product.description || 'No description available.'}</p>
                                </div>
                                ${product.specifications ? `
                                <div class="product-specifications">
                                    <h4>Specifications</h4>
                                    <pre>${JSON.stringify(product.specifications, null, 2)}</pre>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="productsManager.closeModal()">Close</button>
                        <button class="btn btn-primary" 
                                onclick="productsManager.addToCart(${product.id})" 
                                ${product.stock === 0 ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    closeModal() {
        const modal = document.getElementById('productModal');
        if (modal) modal.remove();
    }

    // ==================== CART MANAGEMENT ====================

    addToCart(productId) {
        const product = this.allProducts.find(p => p.id === productId);
        
        if (!product) {
            this.showError('Product not found');
            return;
        }
        
        if (product.stock === 0) {
            this.showError('This product is out of stock');
            return;
        }
        
        let cart = JSON.parse(localStorage.getItem('gripstore_cart')) || [];
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                this.showError(`Only ${product.stock} items available in stock!`);
                return;
            }
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        localStorage.setItem('gripstore_cart', JSON.stringify(cart));
        this.updateCartCount();
        this.showSuccess(`${product.name} added to cart!`);
    }

    updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('gripstore_cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update all cart count elements on page
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = totalItems;
        });
    }

    // ==================== UTILITY METHODS ====================

    showLoading(message = 'Loading...') {
        let loader = document.getElementById('loadingIndicator');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'loadingIndicator';
            loader.className = 'loading-indicator';
            loader.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>${message}</span>
                </div>
            `;
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';
    }

    hideLoading() {
        const loader = document.getElementById('loadingIndicator');
        if (loader) loader.style.display = 'none';
    }

    showError(message) {
        // Remove existing error
        this.removeExistingNotification('error');
        
        const notification = document.createElement('div');
        notification.className = 'notification error-notification';
        notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 5000);
    }

    showSuccess(message) {
        // Remove existing success
        this.removeExistingNotification('success');
        
        const notification = document.createElement('div');
        notification.className = 'notification success-notification';
        notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }

    removeExistingNotification(type) {
        const existing = document.querySelector(`.notification.${type}-notification`);
        if (existing) existing.remove();
    }

    updateProductCount(count) {
        const countElement = document.getElementById('productCount');
        if (countElement) {
            countElement.textContent = `(${count} products)`;
        }
    }

    updateFilters(filters) {
        this.currentFilters = { ...this.currentFilters, ...filters };
    }

    formatCategory(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    animateProductCards() {
        const cards = document.querySelectorAll('.product-item');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-in');
        });
    }

    getNoProductsHTML() {
        return `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria</p>
                <button class="btn btn-primary" onclick="productsManager.loadProducts()">
                    Show All Products
                </button>
            </div>
        `;
    }

    // ==================== FALLBACK METHODS ====================

    loadSampleProducts() {
        console.log('🔄 Loading sample products as fallback...');
        
        const sampleProducts = [
            {
                id: 1,
                name: "ProRunner Marathon Shoes",
                price: 129.99,
                category: "running",
                stock: 15,
                image: "fas fa-shoe-prints",
                description: "Professional running shoes for marathon training with advanced cushioning technology."
            },
            {
                id: 2,
                name: "Elite Basketball",
                price: 49.99,
                category: "basketball",
                stock: 25,
                image: "fas fa-basketball-ball",
                description: "Official size professional basketball with superior grip and durability."
            }
        ];
        
        this.allProducts = sampleProducts;
        this.displayProducts(sampleProducts);
        this.updateProductCount(sampleProducts.length);
        this.showError('Using sample data. Backend connection failed.');
    }

    // ==================== INITIALIZATION ====================

    initialize() {
        console.log('🛍️ Products Manager Initialized');
        
        // Load products when page loads
        this.loadProducts();
        this.updateCartCount();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('productSearch');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => this.searchProducts());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchProducts();
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterByCategory());
        }

        // Sort functionality
        const sortSelect = document.getElementById('sortProducts');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => this.sortProducts(e.target.value));
        }
    }
}

// Create global instance
const productsManager = new ProductsManager();