// Page transition system
class PageTransitions {
  constructor() {
    this.init();
  }
  
  init() {
    // Add page transition overlay to DOM
    this.createOverlay();
    
    // Mark page as loaded to trigger initial animation
    document.body.classList.add('page-loaded');
    
    // Intercept link clicks for smooth page transitions
    this.interceptLinks();
    
    // Initialize scroll animations
    this.initScrollAnimations();
    
    // Add ripple effect to buttons
    this.addRippleEffect();
    
    // Add staggered animations
    this.initStaggeredAnimations();
    
    // Add header scroll effect
    this.initHeaderScroll();
  }
  
  createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition';
    document.body.appendChild(overlay);
  }
  
  interceptLinks() {
    document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        
        // Skip if modifier keys are pressed or external URL
        if (e.metaKey || e.ctrlKey || href.indexOf('http') === 0) return;
        
        e.preventDefault();
        this.navigateTo(href);
      });
    });
  }
  
  navigateTo(url) {
    // Add exiting animation class
    document.body.classList.add('page-exiting');
    
    // Navigate after animation completes
    setTimeout(() => {
      window.location.href = url;
    }, 600);
  }
  
  initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    // Initialize Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all elements with fade-in class
    fadeElements.forEach(el => {
      observer.observe(el);
    });
  }
  
  initStaggeredAnimations() {
    const staggerContainers = document.querySelectorAll('.stagger-container');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const items = entry.target.querySelectorAll('.stagger-item');
          items.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('visible');
            }, 100 * index);
          });
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    
    staggerContainers.forEach(container => {
      observer.observe(container);
    });
  }
  
  addRippleEffect() {
    const buttons = document.querySelectorAll('.btn, .auth-btn, .submit-btn, .nav-btn');
    
    buttons.forEach(button => {
      button.addEventListener('click', e => {
        // Create ripple element
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        
        // Get position
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        // Apply styles
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        // Add to button
        button.appendChild(ripple);
        
        // Remove after animation
        setTimeout(() => {
          ripple.remove();
        }, 800);
      });
    });
  }
  
  initHeaderScroll() {
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Apply scrolled style when scrolled down
      if (scrollTop > 50) {
        header.classList.add('header-scrolled');
        
        // Hide header when scrolling down, show when scrolling up
        if (scrollTop > lastScrollTop && scrollTop > 200) {
          header.classList.add('header-hidden');
        } else {
          header.classList.remove('header-hidden');
        }
      } else {
        header.classList.remove('header-scrolled');
      }
      
      lastScrollTop = scrollTop;
    });
  }
}

// Initialize menu item animations
function initMenuItemAnimations() {
  const menuItems = document.querySelectorAll('.menu-item');
  
  menuItems.forEach((item, index) => {
    item.classList.add('fade-in');
    item.style.animationDelay = `${index * 0.1}s`;
  });
}

// Initialize modal animations
function enhanceModals() {
  const modals = document.querySelectorAll('.modal');
  
  modals.forEach(modal => {
    const content = modal.querySelector('.modal-content');
    const closeBtn = modal.querySelector('.modal-close');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        content.style.transform = 'translateY(-30px) scale(0.95)';
        content.style.opacity = '0';
        
        setTimeout(() => {
          modal.classList.remove('active');
          setTimeout(() => {
            content.style.transform = '';
            content.style.opacity = '';
          }, 300);
        }, 300);
      });
    }
  });
}

// Initialize cart animations
function enhanceCart() {
  const cartBtn = document.querySelector('.cart-button');
  const cartPanel = document.querySelector('.cart-panel');
  const closeCartBtn = document.querySelector('.close-cart');
  
  if (cartBtn && cartPanel) {
    cartBtn.addEventListener('click', () => {
      cartPanel.classList.add('open');
      document.querySelector('.overlay').classList.add('active');
    });
    
    if (closeCartBtn) {
      closeCartBtn.addEventListener('click', () => {
        cartPanel.classList.remove('open');
        document.querySelector('.overlay').classList.remove('active');
      });
    }
  }
}

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
  // Create page transitions instance
  const pageTransitions = new PageTransitions();
  
  // Initialize menu item animations if on menu page
  if (document.querySelector('.menu-grid')) {
    initMenuItemAnimations();
  }
  
  // Enhance modals
  enhanceModals();
  
  // Enhance cart if exists
  enhanceCart();
  
  // Initialize any datepickers with animation
  const dateInputs = document.querySelectorAll('input[type="date"]');
  dateInputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.style.boxShadow = '0 0 0 3px rgba(192, 57, 43, 0.2)';
    });
    
    input.addEventListener('blur', () => {
      input.style.boxShadow = '';
    });
  });
});

// Check if page is being loaded from back/forward cache
window.addEventListener('pageshow', e => {
  if (e.persisted) {
    // Add entering animation class
    document.body.classList.add('page-entering');
    
    // Remove class after animation
    setTimeout(() => {
      document.body.classList.remove('page-entering');
    }, 600);
  }
});