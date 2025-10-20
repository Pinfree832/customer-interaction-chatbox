// Main JavaScript with Enhanced Animations
class GripStoreAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.initializeHeaderAnimations();
        this.initializeScrollAnimations();
        this.initializePageTransitions();
        this.initializeLoadingStates();
    }

    initializeHeaderAnimations() {
        // Header scroll effect
        let lastScrollTop = 0;
        const header = document.querySelector('header');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
            
            lastScrollTop = scrollTop;
        });

        // Nav link hover effects
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', (e) => {
                this.animateNavLink(e.target);
            });
            
            link.addEventListener('click', (e) => {
                this.animateNavClick(e.target);
            });
        });

        // Cart icon animation
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('mouseenter', () => {
                this.animateCartHover();
            });
            
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.animateCartClick();
                // Navigate to cart after animation
                setTimeout(() => {
                    window.location.href = 'cart.html';
                }, 300);
            });
        }

        // Logo animation
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('mouseenter', () => {
                this.animateLogoHover();
            });
        }
    }

    animateNavLink(link) {
        link.style.transform = 'translateY(-2px) scale(1.05)';
        link.style.boxShadow = '0 8px 20px rgba(46, 139, 87, 0.3)';
        
        // Create ripple effect
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(46, 139, 87, 0.1);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        const size = Math.max(link.offsetWidth, link.offsetHeight);
        const rect = link.getBoundingClientRect();
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (rect.width / 2 - size / 2) + 'px';
        ripple.style.top = (rect.height / 2 - size / 2) + 'px';
        
        link.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    animateNavClick(link) {
        link.style.transform = 'scale(0.95)';
        setTimeout(() => {
            link.style.transform = 'translateY(-2px) scale(1.05)';
        }, 150);
    }

    animateCartHover() {
        const cartIcon = document.querySelector('.cart-icon');
        const cartCount = document.querySelector('.cart-count');
        
        if (cartIcon && cartCount) {
            cartIcon.style.transform = 'scale(1.2) rotate(15deg)';
            cartCount.style.transform = 'scale(1.3)';
            
            setTimeout(() => {
                cartIcon.style.transform = '';
                cartCount.style.transform = '';
            }, 300);
        }
    }

    animateCartClick() {
        const cartIcon = document.querySelector('.cart-icon');
        const cartCount = document.querySelector('.cart-count');
        
        if (cartIcon && cartCount) {
            // Bounce animation
            cartIcon.style.animation = 'cartBounce 0.5s ease';
            cartCount.style.animation = 'countBounce 0.5s ease';
            
            // Add CSS for bounce animation
            if (!document.querySelector('#cartAnimations')) {
                const style = document.createElement('style');
                style.id = 'cartAnimations';
                style.textContent = `
                    @keyframes cartBounce {
                        0%, 100% { transform: scale(1) rotate(0deg); }
                        50% { transform: scale(1.3) rotate(20deg); }
                    }
                    @keyframes countBounce {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.5); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            setTimeout(() => {
                cartIcon.style.animation = '';
                cartCount.style.animation = '';
            }, 500);
        }
    }

    animateLogoHover() {
        const logo = document.querySelector('.logo');
        const logoIcon = document.querySelector('.logo-icon');
        
        if (logo && logoIcon) {
            logo.style.transform = 'scale(1.1) rotate(-5deg)';
            logoIcon.style.animation = 'logoSpin 0.6s ease';
            
            // Add CSS for spin animation
            if (!document.querySelector('#logoAnimations')) {
                const style = document.createElement('style');
                style.id = 'logoAnimations';
                style.textContent = `
                    @keyframes logoSpin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            setTimeout(() => {
                logo.style.transform = '';
            }, 300);
        }
    }

    initializeScrollAnimations() {
        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateOnScroll(entry.target);
                }
            });
        }, observerOptions);

        // Observe all elements with data-animate attribute
        document.querySelectorAll('[data-animate]').forEach(el => {
            observer.observe(el);
        });
    }

    animateOnScroll(element) {
        const animationType = element.getAttribute('data-animate') || 'fadeInUp';
        
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease-out';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100);
    }

    initializePageTransitions() {
        // Smooth page transitions
        document.addEventListener('DOMContentLoaded', () => {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.3s ease-in-out';
            
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 100);
        });

        // Add loading state for navigation
        document.querySelectorAll('a').forEach(link => {
            if (link.href && link.href.includes('.html') && !link.href.includes('#')) {
                link.addEventListener('click', (e) => {
                    if (link.target !== '_blank' && !link.hasAttribute('download')) {
                        e.preventDefault();
                        this.animatePageTransition(link.href);
                    }
                });
            }
        });
    }

    animatePageTransition(href) {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease-in-out';
        
        setTimeout(() => {
            window.location.href = href;
        }, 300);
    }

    initializeLoadingStates() {
        // Add loading animations for dynamic content
        this.createLoadingAnimations();
    }

    createLoadingAnimations() {
        if (!document.querySelector('#loadingAnimations')) {
            const style = document.createElement('style');
            style.id = 'loadingAnimations';
            style.textContent = `
                .loading-shimmer {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }
                
                @keyframes shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }
                
                .pulse {
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }
                
                /* Ripple animation for buttons */
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GripStoreAnimations();
});

// Update cart count function (used across all pages)
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('gripstore_cart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(element => {
        element.textContent = cartCount;
        
        // Add animation when cart count changes
        if (parseInt(element.textContent) > 0) {
            element.style.animation = 'countPulse 0.5s ease';
            setTimeout(() => {
                element.style.animation = '';
            }, 500);
        }
    });
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', updateCartCount);