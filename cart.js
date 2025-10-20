// Cart Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeCartPage();
});

function initializeCartPage() {
    loadCartItems();
    setupEventListeners();
    updateCartCount();
    initializePromoCodes();
}

function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('gripstore_cart')) || [];
    const cartItemsContainer = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h4>Your cart is empty</h4>
                <p>Add some amazing sports equipment to get started!</p>
                <a href="products.html" class="btn btn-primary">
                    <i class="fas fa-shopping-bag"></i>
                    Discover Products
                </a>
            </div>
        `;
        updateOrderSummary([]);
        document.getElementById('checkoutBtn').disabled = true;
        document.getElementById('itemCount').textContent = '0';
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <i class="${item.image}"></i>
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price}</div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `).join('');
    
    updateOrderSummary(cart);
    document.getElementById('checkoutBtn').disabled = false;
    document.getElementById('itemCount').textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

function setupEventListeners() {
    // Clear cart
    document.getElementById('clearCart').addEventListener('click', clearCart);
    
    // Checkout
    document.getElementById('checkoutBtn').addEventListener('click', proceedToCheckout);
    
    // Payment modal
    const paymentModal = document.getElementById('paymentModal');
    const closeModal = paymentModal.querySelector('.close-modal');
    
    closeModal.addEventListener('click', () => {
        paymentModal.classList.remove('active');
    });
    
    paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            paymentModal.classList.remove('active');
        }
    });
    
    // Success modal
    const successModal = document.getElementById('successModal');
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.classList.remove('active');
        }
    });
}

function initializePromoCodes() {
    // Apply promo button
    document.getElementById('applyPromo').addEventListener('click', applyPromoCode);
    
    // Promo code input enter key
    document.getElementById('promoCode').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyPromoCode();
        }
    });
    
    // Promo tag clicks
    document.querySelectorAll('.promo-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const code = tag.getAttribute('data-code');
            document.getElementById('promoCode').value = code;
            applyPromoCode();
        });
    });
}

function updateQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('gripstore_cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;
        
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        localStorage.setItem('gripstore_cart', JSON.stringify(cart));
        loadCartItems();
        updateCartCount();
        
        // Show animation
        animateCartUpdate();
    }
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('gripstore_cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        const itemName = cart[itemIndex].name;
        cart.splice(itemIndex, 1);
        localStorage.setItem('gripstore_cart', JSON.stringify(cart));
        loadCartItems();
        updateCartCount();
        
        // Show removal message
        showSuccessMessage(`${itemName} removed from cart`);
    }
}

function clearCart() {
    const cart = JSON.parse(localStorage.getItem('gripstore_cart')) || [];
    if (cart.length === 0) return;
    
    if (confirm('Are you sure you want to clear your cart? This action cannot be undone.')) {
        localStorage.removeItem('gripstore_cart');
        localStorage.removeItem('gripstore_promo');
        loadCartItems();
        updateCartCount();
        showSuccessMessage('Cart cleared successfully');
    }
}

function updateOrderSummary(cart) {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const tax = subtotal * 0.08;
    
    // Apply promo code if exists
    const promo = JSON.parse(localStorage.getItem('gripstore_promo')) || null;
    let discount = 0;
    
    if (promo) {
        if (promo.type === 'percentage') {
            discount = subtotal * (promo.value / 100);
        } else if (promo.type === 'fixed') {
            discount = promo.value;
        } else if (promo.type === 'shipping') {
            discount = shipping;
        }
    }
    
    const total = Math.max(0, subtotal + shipping + tax - discount);
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('discount').textContent = `-$${discount.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    document.getElementById('checkoutTotal').textContent = total.toFixed(2);
    
    // Update shipping display
    if (shipping === 0) {
        document.getElementById('shipping').style.color = 'var(--success)';
        document.getElementById('shipping').style.fontWeight = '600';
    }
}

function applyPromoCode() {
    const promoCode = document.getElementById('promoCode').value.trim().toUpperCase();
    const promoInput = document.getElementById('promoCode');
    
    if (!promoCode) {
        showSuccessMessage('Please enter a promo code', 'error');
        return;
    }
    
    const promoCodes = {
        'WELCOME10': { type: 'percentage', value: 10, message: '10% discount applied!' },
        'SPORTS20': { type: 'percentage', value: 20, message: '20% discount applied!' },
        'FREESHIP': { type: 'shipping', value: 0, message: 'Free shipping applied!' },
        'NEW25': { type: 'percentage', value: 25, message: '25% discount applied!' }
    };
    
    if (promoCodes[promoCode]) {
        const promo = promoCodes[promoCode];
        localStorage.setItem('gripstore_promo', JSON.stringify(promo));
        updateOrderSummary(JSON.parse(localStorage.getItem('gripstore_cart')) || []);
        showSuccessMessage(promo.message);
        promoInput.style.borderColor = 'var(--success)';
    } else {
        showSuccessMessage('Invalid promo code', 'error');
        promoInput.style.borderColor = 'var(--danger)';
        localStorage.removeItem('gripstore_promo');
    }
}

function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem('gripstore_cart')) || [];
    if (cart.length === 0) return;
    
    // Validate shipping information
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    
    if (!fullName || !email || !address) {
        showSuccessMessage('Please fill in all required shipping information', 'error');
        return;
    }
    
    const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
    const paymentModal = document.getElementById('paymentModal');
    const paymentDetails = document.getElementById('paymentDetails');
    
    // Generate payment form based on selected method
    let paymentForm = '';
    const total = calculateTotal();
    
    switch(selectedPayment) {
        case 'mpesa':
            paymentForm =
    }