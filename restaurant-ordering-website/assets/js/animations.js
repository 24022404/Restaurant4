document.addEventListener('DOMContentLoaded', function() {
    // Animate elements when they enter viewport
    initScrollAnimations();
    
    // Add ripple effect to buttons
    addRippleEffect();
    
    // Initialize staggered animations
    initStaggeredAnimations();
    
    // Enhance hover effects
    enhanceHoverEffects();
});

function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in-element');
    const slideRightElements = document.querySelectorAll('.slide-from-right');
    const slideLeftElements = document.querySelectorAll('.slide-from-left');
    
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, options);
    
    fadeElements.forEach(el => observer.observe(el));
    slideRightElements.forEach(el => observer.observe(el));
    slideLeftElements.forEach(el => observer.observe(el));
}

function initStaggeredAnimations() {
    const staggerContainers = document.querySelectorAll('.stagger-container');
    
    staggerContainers.forEach(container => {
        const items = container.querySelectorAll('.stagger-item');
        
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('visible');
                    }, 100 * index); // Stagger timing
                });
                observer.unobserve(container);
            }
        }, options);
        
        observer.observe(container);
    });
}

function addRippleEffect() {
    const buttons = document.querySelectorAll('.btn, .nav-btn, .submit-btn, .auth-btn');
    
    buttons.forEach(button => {
        button.classList.add('ripple-btn');
        
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

function enhanceHoverEffects() {
    // Menu link hover effect
    const menuLinks = document.querySelectorAll('.nav-link:not(.active)');
    
    menuLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            this.style.transform = 'translateY(-2px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Menu item animations
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const image = this.querySelector('img');
            if (image) {
                image.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                image.style.transform = 'scale(1.08)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const image = this.querySelector('img');
            if (image) {
                image.style.transform = 'scale(1)';
            }
        });
    });
}